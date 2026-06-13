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

// ── CORS: allow your GitHub Pages domain ──────────────────────────────────────
app.use(cors({
  origin: [
    "https://sugarrushco.com",
    "http://localhost:3000",
    /\.github\.io$/
  ]
}));

// ── Stripe webhook needs raw body for signature verification ──────────────────
app.post("/webhook", express.raw({ type: "application/json" }), async (req, res) => {
  const sig = req.headers["stripe-signature"];
  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error("Webhook signature failed:", err.message);
    return res.status(400).send("Webhook Error: " + err.message);
  }

  if (event.type === "payment_intent.succeeded") {
    const pi = event.data.object;

    // Pull the order data Stripe stored in metadata (we'll set this on checkout)
    const meta = pi.metadata || {};
    const orderNo = meta.order_no || ("SR-" + Date.now());

    const { error } = await sb.from("orders").insert({
      order_no:           orderNo,
      customer_name:      meta.customer_name  || "",
      customer_email:     meta.customer_email || "",
      customer_address:   meta.customer_address || "",
      items:              meta.items           || "",
      total:              pi.amount / 100,
      stripe_payment_id:  pi.id,
      status:             "paid"
    });

    if (error) console.error("Supabase insert error:", error.message);
  }

  res.json({ received: true });
});

// ── All other routes get JSON body parsing ────────────────────────────────────
app.use(express.json());

// ── Simple admin auth middleware ──────────────────────────────────────────────
function adminAuth(req, res, next) {
  const token = req.headers["x-admin-secret"];
  if (token !== ADMIN_SECRET) return res.status(401).json({ error: "Unauthorized" });
  next();
}

// ── GET /orders — list all orders newest first ────────────────────────────────
app.get("/orders", adminAuth, async (req, res) => {
  const { data, error } = await sb
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// ── POST /track — save tracking number and email the customer ─────────────────
app.post("/track", adminAuth, async (req, res) => {
  const { order_id, tracking_number } = req.body;
  if (!order_id || !tracking_number) {
    return res.status(400).json({ error: "order_id and tracking_number required" });
  }

  // Fetch the order
  const { data: orders, error: fetchErr } = await sb
    .from("orders")
    .select("*")
    .eq("id", order_id)
    .limit(1);

  if (fetchErr || !orders || orders.length === 0) {
    return res.status(404).json({ error: "Order not found" });
  }
  const order = orders[0];

  // Save tracking number
  const { error: updateErr } = await sb
    .from("orders")
    .update({ tracking_number, tracking_sent: true, status: "shipped" })
    .eq("id", order_id);
  if (updateErr) return res.status(500).json({ error: updateErr.message });

  // Send email to customer
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

          <a href="${uspsUrl}"
             style="display:block;text-align:center;background:#29261b;color:#fff;text-decoration:none;
                    padding:14px 28px;border-radius:99px;font-size:15px;font-weight:700;margin-bottom:24px;">
            Track my package →
          </a>

          <p style="font-size:13px;opacity:.6;margin:0;">
            Questions? Reply to this email or visit our site.<br>
            Thank you for supporting ${SHOP_NAME}! 🎀
          </p>
        </div>
      </div>
    `
  });

  if (emailErr) {
    console.error("Resend error:", emailErr);
    return res.status(500).json({ error: "Tracking saved but email failed: " + emailErr.message });
  }

  res.json({ ok: true, message: "Tracking saved and email sent!" });
});

// ── Health check ──────────────────────────────────────────────────────────────
app.get("/", (req, res) => res.json({ status: "Sugar Rush server running" }));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
