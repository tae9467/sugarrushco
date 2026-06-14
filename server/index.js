const express = require("express");
const cors    = require("cors");
const stripe  = require("stripe")(process.env.STRIPE_SECRET_KEY);
const { createClient } = require("@supabase/supabase-js");
const { Resend } = require("resend");

const app  = express();
const sb   = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);
const mail = new Resend(process.env.RESEND_API_KEY);

const ADMIN_SECRET  = process.env.ADMIN_SECRET || "sugarrush2026";
const FROM_EMAIL    = process.env.FROM_EMAIL    || "info@sugarrushco.shop";
const SHOP_NAME     = "Sugar Rush Co.";

// ── CORS ──────────────────────────────────────────────────────────────────────
app.use(cors({
  origin: [
    "https://sugarrushco.shop",
    "https://www.sugarrushco.shop",
    "http://localhost:3000",
    "http://localhost:5500",
    "http://127.0.0.1:5500",
    /\.github\.io$/
  ]
}));

// ── Stripe webhook (raw body required) ───────────────────────────────────────
app.post("/webhook", express.raw({ type: "application/json" }), async (req, res) => {
  const sig = req.headers["stripe-signature"];
  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error("Webhook signature failed:", err.message);
    return res.status(400).send("Webhook Error: " + err.message);
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const orderNo = (session.metadata || {}).order_no;
    if (!orderNo) { console.error("Webhook: no order_no in metadata"); return res.json({ received: true }); }

    // Look up the pre-saved pending order — all data already verified server-side
    const { data: existing } = await sb.from("orders").select("*").eq("order_no", orderNo).single();
    if (!existing) { console.error("Webhook: pending order not found:", orderNo); return res.json({ received: true }); }

    // Mark paid and record Stripe payment ID
    await sb.from("orders").update({
      status:            "paid",
      stripe_payment_id: session.payment_intent,
      total:             session.amount_total / 100
    }).eq("order_no", orderNo);

    // Decrement stock using the verified items we saved at checkout time
    try {
      const items = JSON.parse(existing.items_json || "[]");
      for (const item of items) {
        const { data: prod } = await sb.from("products").select("stock").eq("id", item.id).single();
        if (prod) {
          await sb.from("products").update({ stock: Math.max(0, (prod.stock || 0) - item.qty) }).eq("id", item.id);
        }
      }
    } catch(e) { console.error("Stock decrement error:", e.message); }
  }

  res.json({ received: true });
});

// ── JSON body for all other routes ───────────────────────────────────────────
app.use(express.json());

// ── Admin auth middleware ─────────────────────────────────────────────────────
function adminAuth(req, res, next) {
  const token = req.headers["x-admin-secret"];
  if (token !== ADMIN_SECRET) return res.status(401).json({ error: "Unauthorized" });
  next();
}

// ── PUBLIC: GET /products ─────────────────────────────────────────────────────
app.get("/products", async (req, res) => {
  const isAdmin = req.headers["x-admin-secret"] === ADMIN_SECRET && req.query.all === "true";
  let query = sb.from("products").select("*").order("created_at", { ascending: true });
  if (!isAdmin) query = query.eq("active", true);
  const { data, error } = await query;
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// ── PUBLIC: POST /create-checkout ────────────────────────────────────────────
app.post("/create-checkout", async (req, res) => {
  const { cart, form, orderNo } = req.body;
  if (!cart || !cart.length) return res.status(400).json({ error: "cart required" });
  try {
    // 1. Look up real prices from Supabase — never trust client-sent data
    const ids = [...new Set(cart.map((i) => i.id))];
    const { data: products, error: dbErr } = await sb.from("products").select("id, name, price").in("id", ids).eq("active", true);
    if (dbErr) throw new Error("Could not verify product prices");

    const productMap = {};
    products.forEach((p) => { productMap[p.id] = p; });

    const verifiedItems = [];
    const line_items    = [];
    let subtotal = 0;

    for (const item of cart) {
      const p = productMap[item.id];
      if (!p) return res.status(400).json({ error: "Product not found or unavailable" });
      const qty = Math.min(99, Math.max(1, Math.round(item.qty)));
      subtotal += p.price * qty;
      verifiedItems.push({ id: p.id, name: p.name, price: p.price, qty });
      line_items.push({
        price_data: { currency: "usd", product_data: { name: p.name }, unit_amount: Math.round(p.price * 100) },
        quantity: qty,
      });
    }

    const shipping = subtotal >= 35 ? 0 : 5;
    if (shipping > 0) {
      line_items.push({
        price_data: { currency: "usd", product_data: { name: "Shipping" }, unit_amount: shipping * 100 },
        quantity: 1,
      });
    }

    const customerAddress = form.fullAddress || `${form.address || ""}${form.address2 ? ", " + form.address2 : ""}, ${form.city || ""} ${form.zip || ""}`;

    // 2. Save verified order to Supabase as "pending" BEFORE sending to Stripe
    //    Webhook will update this to "paid" — no frontend data touches fulfillment
    await sb.from("orders").insert({
      order_no:         orderNo,
      customer_name:    form.name,
      customer_email:   form.email,
      customer_address: customerAddress,
      items:            verifiedItems.map((i) => `${i.name} x${i.qty}`).join(", "),
      items_json:       JSON.stringify(verifiedItems),
      total:            subtotal + shipping,
      status:           "pending"
    });

    // 3. Create Stripe session — metadata just carries orderNo for webhook lookup
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items,
      customer_email: form.email,
      automatic_tax: { enabled: true },
      metadata: { order_no: orderNo },
      success_url: "https://sugarrushco.shop/?payment=success",
      cancel_url:  "https://sugarrushco.shop/",
    });
    res.json({ url: session.url });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ── ADMIN: GET /orders ────────────────────────────────────────────────────────
app.get("/orders", adminAuth, async (req, res) => {
  const { data, error } = await sb
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// ── ADMIN: POST /admin/products — create product ──────────────────────────────
app.post("/admin/products", adminAuth, async (req, res) => {
  const { name, price, cat, blurb, notes, stock, image_url } = req.body;
  if (!name || !price || !cat) return res.status(400).json({ error: "name, price, cat required" });
  const { data, error } = await sb.from("products").insert({
    name, price: parseFloat(price), cat,
    blurb: blurb || "",
    notes: notes || "",
    stock: parseInt(stock) || 0,
    image_url: image_url || "",
    active: true
  }).select().single();
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// ── ADMIN: PUT /admin/products/:id — update product ───────────────────────────
app.put("/admin/products/:id", adminAuth, async (req, res) => {
  const { name, price, cat, blurb, notes, stock, image_url, active } = req.body;
  const updates = {};
  if (name      !== undefined) updates.name      = name;
  if (price     !== undefined) updates.price     = parseFloat(price);
  if (cat       !== undefined) updates.cat       = cat;
  if (blurb     !== undefined) updates.blurb     = blurb;
  if (notes     !== undefined) updates.notes     = notes;
  if (stock     !== undefined) updates.stock     = parseInt(stock);
  if (image_url !== undefined) updates.image_url = image_url;
  if (active    !== undefined) updates.active    = active;

  const { data, error } = await sb.from("products").update(updates).eq("id", req.params.id).select().single();
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// ── ADMIN: DELETE /admin/products/:id ────────────────────────────────────────
app.delete("/admin/products/:id", adminAuth, async (req, res) => {
  const { error } = await sb.from("products").delete().eq("id", req.params.id);
  if (error) return res.status(500).json({ error: error.message });
  res.json({ ok: true });
});

// ── ADMIN: POST /track — save tracking + email customer ──────────────────────
app.post("/track", adminAuth, async (req, res) => {
  const { order_id, tracking_number } = req.body;
  if (!order_id || !tracking_number) return res.status(400).json({ error: "order_id and tracking_number required" });

  const { data: orders, error: fetchErr } = await sb.from("orders").select("*").eq("id", order_id).limit(1);
  if (fetchErr || !orders || orders.length === 0) return res.status(404).json({ error: "Order not found" });
  const order = orders[0];

  const { error: updateErr } = await sb.from("orders").update({ tracking_number, tracking_sent: true, status: "shipped" }).eq("id", order_id);
  if (updateErr) return res.status(500).json({ error: updateErr.message });

  const uspsUrl = `https://tools.usps.com/go/TrackConfirmAction?tLabels=${tracking_number}`;
  const { error: emailErr } = await mail.emails.send({
    from: `${SHOP_NAME} <${FROM_EMAIL}>`,
    to:   order.customer_email,
    subject: `Your ${SHOP_NAME} order is on its way! 🎀`,
    html: `
      <div style="font-family:Georgia,serif;max-width:560px;margin:0 auto;color:#29261b;">
        <div style="background:repeating-linear-gradient(90deg,#C9AAEB 0 46px,#fff 46px 92px);height:60px;border-radius:12px 12px 0 0;"></div>
        <div style="border:3px solid #29261b;border-top:none;border-radius:0 0 16px 16px;padding:36px 40px;">
          <h1 style="font-size:28px;margin:0 0 8px;">Your order shipped! 🍒</h1>
          <p style="margin:0 0 24px;font-size:16px;">Hi ${order.customer_name}, your goodies are on their way!</p>
          <div style="background:#f8f4ff;border-radius:10px;padding:20px 24px;margin-bottom:24px;">
            <p style="margin:0 0 6px;font-size:13px;text-transform:uppercase;letter-spacing:.06em;opacity:.6;">Order</p>
            <p style="margin:0 0 16px;font-weight:700;font-size:18px;">${order.order_no}</p>
            <p style="margin:0 0 6px;font-size:13px;text-transform:uppercase;letter-spacing:.06em;opacity:.6;">USPS Tracking Number</p>
            <p style="margin:0;font-weight:700;font-size:20px;letter-spacing:.05em;">${tracking_number}</p>
          </div>
          <a href="${uspsUrl}" style="display:block;text-align:center;background:#29261b;color:#fff;text-decoration:none;padding:14px 28px;border-radius:99px;font-size:15px;font-weight:700;margin-bottom:24px;">
            Track my package →
          </a>
          <p style="font-size:13px;opacity:.6;margin:0;">Questions? Reply to this email or visit our site.<br>Thank you for supporting ${SHOP_NAME}! 🎀</p>
        </div>
      </div>
    `
  });

  if (emailErr) return res.status(500).json({ error: "Tracking saved but email failed: " + emailErr.message });
  res.json({ ok: true, message: "Tracking saved and email sent!" });
});

// ── Health check ──────────────────────────────────────────────────────────────
app.get("/", (req, res) => res.json({ status: "Sugar Rush server running 🍒" }));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
