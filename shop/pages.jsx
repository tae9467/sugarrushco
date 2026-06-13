// Sugar Rush Co. , shop, product, cart drawer, checkout, confirm, about, contact
const { useState: usePState, useMemo: usePMemo, useEffect: usePEffect, useRef: usePRef } = React;

/* ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ Shop page ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ */
function ShopPage({ route, go, onAdd }) {
  const cat  = route.cat || "all";
  const list = SHOP_DATA.products.filter((p) => cat === "all" || p.cat === cat);
  return (
    <div className="rail sec" data-screen-label="Shop">
      <SectionHead title="The whole sweet shop" />
      <div className="cats" style={{ justifyContent: "flex-start", marginBottom: 30 }}>
        <button className={"cat-chip" + (cat === "all" ? " is-on" : "")} onClick={() => go("shop")}>
          <CherryIcon size={18} /> Everything
        </button>
        {SHOP_DATA.categories.map((c) => (
          <button key={c.id} className={"cat-chip" + (cat === c.id ? " is-on" : "")} onClick={() => go("shop", { cat: c.id })}>
            <CatIcon kind={c.icon} size={18} /> {c.label}
          </button>
        ))}
      </div>
      <div className="pgrid">
        {list.map((p) => <ProductCard key={p.id} p={p} go={go} onAdd={onAdd} showBlurb />)}
      </div>
    </div>
  );
}

/* ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ Product page ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ */
function ProductPage({ route, go, onAdd }) {
  const p     = productById(route.id) || SHOP_DATA.products[0];
  const [qty, setQty] = usePState(1);
  const pairs = SHOP_DATA.products.filter((x) => x.id !== p.id && x.cat === p.cat).slice(0, 2);
  return (
    <div className="rail sec" data-screen-label={"Product · " + p.name}>
      <button className="crumb" onClick={() => go("shop", { cat: p.cat })}>← back to {catById(p.cat).label.toLowerCase()}</button>
      <div className="pp">
        <div className="pp-photo">
          <ProductImage product={p} height={470} radius={20} />
        </div>
        <div>
          <div className="eyebrow">{catById(p.cat).label} - ${p.price}</div>
          <h1 className="pp-name">{p.name}</h1>
          <p className="pp-blurb">{p.blurb}</p>
          <ul className="notes">{p.notes.map((n) => <li key={n}>{n}</li>)}</ul>
          <div className="pp-buy">
            <div className="qty">
              <button onClick={() => setQty(Math.max(1, qty - 1))} aria-label="Less">−</button>
              <span>{qty}</span>
              <button onClick={() => setQty(qty + 1)} aria-label="More">+</button>
            </div>
            <button className="btn" onClick={() => { onAdd(p.id, qty); setQty(1); }}>
              {`Add to cart · ${p.price * qty}`}
            </button>
          </div>
          <div className="pp-rule tld-wc-rule"></div>
          <h3 className="pp-pairs-h">Goes great with</h3>
          <div className="pp-pairs">
            {pairs.map((pp) => <ProductCard key={pp.id} p={pp} go={go} onAdd={onAdd} />)}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ Cart drawer ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ */
function CartDrawer({ open, cart, setQty, remove, subtotal, onClose, onCheckout }) {
  if (!open) return null;
  return (
    <React.Fragment>
      <button className="overlay" onClick={onClose} aria-label="Close cart"></button>
      <aside className="drawer" data-screen-label="Cart drawer">
        <div className="drawer-head">
          <h2 className="drawer-title">Your little haul</h2>
          <button className="drawer-x" onClick={onClose} aria-label="Close"><XIcon /></button>
        </div>
        <div className="drawer-body">
          {cart.length === 0 && <div className="drawer-empty">Nothing in here yet... go treat yourself!</div>}
          {cart.map((line) => {
            const p = productById(line.id);
            if (!p) return null;
            return (
              <div className="line" key={line.id}>
                <div className="line-thumb" style={{ background: THUMB_BG[p.cat] }}>
                  <CatIcon kind={catById(p.cat).icon} />
                </div>
                <div className="line-main">
                  <p className="line-name">{p.name}</p>
                  <span className="line-price">${p.price} each</span>
                </div>
                <div style={{ display:"flex", flexDirection:"column", gap:6, alignItems:"flex-end" }}>
                  <div className="qty">
                    <button onClick={() => setQty(line.id, line.qty - 1)} aria-label="Less">−</button>
                    <span>{line.qty}</span>
                    <button onClick={() => setQty(line.id, line.qty + 1)} aria-label="More">+</button>
                  </div>
                  <button className="line-remove" onClick={() => remove(line.id)}>remove</button>
                </div>
              </div>
            );
          })}
        </div>
        <div className="drawer-foot">
          <div className="subtotal"><span>Subtotal</span><span>${subtotal}</span></div>
          <button className="btn btn--wide" disabled={cart.length === 0}
            style={cart.length === 0 ? { opacity:0.5, cursor:"default" } : null}
            onClick={onCheckout}>Check out</button>
        </div>
      </aside>
    </React.Fragment>
  );
}

/* ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ Checkout , uses Stripe Payment Link (no backend needed) ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ */
const CO_FIELDS = [
  { id:"name",    label:"Full name", full:false, ph:"Your name" },
  { id:"email",   label:"Email",     full:false, ph:"you@email.com" },
  { id:"address", label:"Address",   full:true,  ph:"123 Sweet St" },
  { id:"city",    label:"City",      full:false, ph:"Sugartown" },
  { id:"zip",     label:"ZIP",       full:false, ph:"12345" }
];

function CheckoutPage({ cart, subtotal, go, onPlaced }) {
  const [form, setForm] = usePState({ name:"", email:"", address:"", city:"", zip:"" });
  const [errs, setErrs] = usePState({});

  const shipping = subtotal >= 35 || subtotal === 0 ? 0 : 5;
  const tax      = parseFloat(((subtotal + shipping) * (window.TAX_RATE || 0.07)).toFixed(2));
  const total    = parseFloat((subtotal + shipping + tax).toFixed(2));

  const paymentLinkReady = window.STRIPE_PAYMENT_LINK &&
    !window.STRIPE_PAYMENT_LINK.includes("YOUR_LINK");

  const validate = () => {
    const e = {};
    CO_FIELDS.forEach((f) => { if (!form[f.id].trim()) e[f.id] = "needed, please!"; });
    if (form.email && !/^\S+@\S+\.\S+$/.test(form.email)) e.email = "hmm, that email looks off";
    setErrs(e);
    return Object.keys(e).length === 0;
  };

  const place = () => {
    if (!validate()) return;

    // Save order info so confirm page can show it on return
    const orderNo = "SR-" + Math.floor(1000 + Math.random() * 9000);
    // Save order to history
    const newOrder = { orderNo, cart, form, subtotal, shipping, tax, total, date: new Date().toISOString(), status: "Pending" };
    try {
      const history = JSON.parse(localStorage.getItem("sugarrush.orders") || "[]");
      history.unshift(newOrder);
      localStorage.setItem("sugarrush.orders", JSON.stringify(history.slice(0, 200)));
    } catch(e) {}
    localStorage.setItem("sugarrush.pending_order", JSON.stringify({ cart, form, total, orderNo }));

    if (paymentLinkReady) {
      // Build Payment Link URL , pre-fills amount + email on Stripe's page
      const url = new URL(window.STRIPE_PAYMENT_LINK);
      url.searchParams.set("prefilled_amount", Math.round(total * 100));
      url.searchParams.set("prefilled_email",  form.email);
      // Tell Stripe where to send them after payment (your site + ?payment=success)
      // Set this in your Stripe Payment Link settings ÃƒÂ¢Ã¢â‚¬Â Ã¢â‚¬â„¢ After payment ÃƒÂ¢Ã¢â‚¬Â Ã¢â‚¬â„¢ Redirect to URL
      window.location.href = url.toString();
    } else {
      // Demo mode , no Payment Link configured yet
      onPlaced();
    }
  };

  return (
    <div className="rail sec" data-screen-label="Checkout">
      <button className="crumb" onClick={() => go("shop")}>← keep shopping</button>
      <SectionHead title="Checkout" />

      {!paymentLinkReady && (
        <div className="stripe-demo-note" style={{ marginBottom: 24 }}>
          <span>🔗</span>
          <span>
            <strong>Payment Link not connected yet.</strong> Create a Payment Link in your Stripe
            dashboard (set price to "Customer chooses"), paste it into <code>shop/app.jsx</code>, and
            set the redirect URL to <code>your-site-url/?payment=success</code>. Until then, checkout works in demo mode.
          </span>
        </div>
      )}

      <div className="co">
        {/* ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ Left: shipping info ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ */}
        <div>
          <div className="co-form">
            {CO_FIELDS.map((f) => (
              <div key={f.id} className={"field" + (f.full ? " field--full" : "")}>
                <label htmlFor={"co-" + f.id}>{f.label}</label>
                <input id={"co-" + f.id} className={"input" + (errs[f.id] ? " is-bad" : "")}
                  placeholder={f.ph} value={form[f.id]}
                  onChange={(ev) => setForm({ ...form, [f.id]: ev.target.value })} />
                {errs[f.id] && <span className="field-err">{errs[f.id]}</span>}
              </div>
            ))}
          </div>

          <div style={{ marginTop: 26 }}>
            <button className="btn btn--wide" onClick={place}>
              {paymentLinkReady ? `Continue to payment · ${total}` : `Place order · ${total}`}
            </button>
            <p style={{ font:"italic 600 12.5px var(--font-italic)", opacity:0.6, textAlign:"center", marginTop:8 }}>
              {paymentLinkReady
                ? "You'll be taken to Stripe's secure checkout , then brought right back."
                : "(demo mode , no card charged)"}
            </p>
          </div>
        </div>

        {/* ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ Right: order summary ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ */}
        <div className="co-card">
          <h3>Your order</h3>
          {cart.map((line) => {
            const p = productById(line.id);
            return p ? (
              <div className="co-line" key={line.id}>
                <span>{p.name} × {line.qty}</span><strong>${p.price * line.qty}</strong>
              </div>
            ) : null;
          })}
          <div className="co-line">
            <span>Shipping{shipping === 0 ? " (free over $35!)" : ""}</span>
            <strong>{shipping === 0 ? "free" : "$" + shipping}</strong>
          </div>
          <div className="co-line">
            <span>Florida Tax (7%)</span>
            <strong>${tax}</strong>
          </div>
          <div className="co-total"><span>Total</span><span>${total}</span></div>
        </div>
      </div>
    </div>
  );
}

/* ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ Order confirmation ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ */
function ConfirmPage({ go }) {
  const order  = React.useMemo(() => {
    try { return JSON.parse(localStorage.getItem("sugarrush.pending_order")) || {}; }
    catch { return {}; }
  }, []);
  const orderNo = order.orderNo || ("SR-" + Math.floor(1000 + Math.random() * 9000));
  const items   = (order.cart || []).map((l) => ({ ...l, product: productById(l.id) })).filter((l) => l.product);

  // Send confirmation email via EmailJS if configured
  usePEffect(() => {
    if (!window.emailjs) return;
    if (!window.EMAILJS_SERVICE_ID || window.EMAILJS_SERVICE_ID.includes("YOUR_")) return;
    if (!order.form || !order.form.email) return;
    const itemList = items.map((l) => `${l.product.name} x${l.qty} , $${l.product.price * l.qty}`).join("\n");
    window.emailjs.send(window.EMAILJS_SERVICE_ID, window.EMAILJS_TEMPLATE_ID, {
      to_name:    order.form.name,
      to_email:   order.form.email,
      order_no:   orderNo,
      order_items: itemList,
      order_total: "$" + order.total,
      shop_name:  "Sugar Rush Co."
    }, window.EMAILJS_PUBLIC_KEY).catch(() => {});
  }, []);

  return (
    <div className="confirm-wrap" data-screen-label="Order confirmed">
      <div className="confirm">
        <CherryIcon size={46} />
        <h1 className="confirm-h">Order confirmed , sweet!!</h1>
        <div className="confirm-no">order no. {orderNo}</div>
        {items.length > 0 && (
          <div className="confirm-items">
            {items.map((l) => (
              <div key={l.id} className="confirm-item">
              <span>{l.product.name} × {l.qty}</span>
                <span>${l.product.price * l.qty}</span>
              </div>
            ))}
            <div className="confirm-item confirm-item--total">
              <span>Total paid</span><span>${order.total}</span>
            </div>
          </div>
        )}
        <p className="confirm-sub">
          Your goodies are getting wrapped in tissue paper and tied with a bow as we speak.
          {order.form && order.form.email ? ` A confirmation is headed to ${order.form.email}.` : ""}
        </p>
        <div className="btn-row">
          <button className="btn" onClick={() => go("shop")}>Keep shopping</button>
          <button className="btn btn--ghost" onClick={() => go("home")}>Back home</button>
        </div>
      </div>
    </div>
  );
}

/* ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ Contact ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ */
function ContactPage({ go }) {
  const [form, setForm]   = usePState({ name:"", email:"", msg:"" });
  const [errs, setErrs]   = usePState({});
  const [sent, setSent]   = usePState(false);
  const [sending, setSending] = usePState(false);

  const validate = () => {
    const e = {};
    if (!form.name.trim())  e.name  = "needed, please!";
    if (!form.email.trim()) e.email = "needed, please!";
    if (form.email && !/^\S+@\S+\.\S+$/.test(form.email)) e.email = "hmm, that email looks off";
    if (!form.msg.trim())   e.msg   = "tell us something!";
    setErrs(e);
    return Object.keys(e).length === 0;
  };

  const send = async () => {
    if (!validate()) return;
    setSending(true);
    if (window.emailjs && window.EMAILJS_SERVICE_ID && !window.EMAILJS_SERVICE_ID.includes("YOUR_")) {
      try {
        await window.emailjs.send(window.EMAILJS_SERVICE_ID, window.EMAILJS_TEMPLATE_ID, {
          from_name:  form.name,
          from_email: form.email,
          message:    form.msg,
          shop_name:  "Sugar Rush Co.",
          to_email:   "info@thinkbudgetco.com"
        }, window.EMAILJS_PUBLIC_KEY);
      } catch (err) { /* fail gracefully */ }
    }
    setSending(false);
    setSent(true);
  };

  if (sent) return (
    <div className="confirm-wrap" data-screen-label="Message sent">
      <div className="confirm">
        <CherryIcon size={46} />
        <h1 className="confirm-h">Message sent!!</h1>
        <p className="confirm-sub">We got your note and will get back to you super soon!</p>
        <button className="btn" onClick={() => go("home")}>Back to the shop</button>
      </div>
    </div>
  );

  return (
    <div className="contact-page-wrap" data-screen-label="Contact">
      <div className="contact-card">
        <SectionHead title="Say hi!" />
        <p className="contact-intro">
          Questions about an order? Want to stock Sugar Rush Co. in your store? Just want to say hi?
          We'd love to hear from you , we try to reply within 24 hours.
        </p>
        <div className="contact-form">
          <div className="field">
            <label htmlFor="ct-name">Your name</label>
            <input id="ct-name" className={"input" + (errs.name ? " is-bad" : "")}
              placeholder="Your name" value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })} />
            {errs.name && <span className="field-err">{errs.name}</span>}
          </div>
          <div className="field">
            <label htmlFor="ct-email">Email</label>
            <input id="ct-email" className={"input" + (errs.email ? " is-bad" : "")}
              placeholder="you@email.com" value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })} />
            {errs.email && <span className="field-err">{errs.email}</span>}
          </div>
          <div className="field">
            <label htmlFor="ct-msg">Message</label>
            <textarea id="ct-msg" className={"input" + (errs.msg ? " is-bad" : "")}
              rows={5} placeholder="What's on your mind?"
              value={form.msg}
              onChange={(e) => setForm({ ...form, msg: e.target.value })} />
            {errs.msg && <span className="field-err">{errs.msg}</span>}
          </div>
          <button className="btn btn--wide" onClick={send} disabled={sending}
            style={sending ? { opacity:0.65, cursor:"wait" } : null}>
            {sending ? "Sending…" : "Send message"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ Terms of Service ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ */
function TermsPage({ go }) {
  return (
    <div className="rail sec legal-page" data-screen-label="Terms of Service">
      <div className="legal-card">
        <h1 className="legal-h">Terms of Service</h1>
        <p className="legal-date">Last updated: June 2026</p>

        <h2>1. Overview</h2>
        <p>By placing an order with THINK BUDGET CO, LLC ("we", "us", "our"), you agree to these terms. Please read them carefully before purchasing.</p>

        <h2>2. Products</h2>
        <p>All products are small-batch and handmade. Product descriptions, images, and scents are as accurate as possible, but slight variations may occur. Our lip glosses, body butters, and perfumes are cosmetic products intended for external use only. Slimes and squishies are not intended for consumption , keep away from young children.</p>

        <h2>3. Orders & Payment</h2>
        <p>All orders are processed through Stripe, a secure third-party payment processor. We do not store your card details. Prices are listed in USD and are subject to change without notice. We reserve the right to cancel any order for any reason, with a full refund issued.</p>

        <h2>4. Shipping</h2>
        <p>Orders are typically processed within 3-5 business days. Shipping times vary by location. We are not responsible for delays caused by shipping carriers. Risk of loss passes to you upon delivery to the carrier.</p>

        <h2>5. Allergies & Skin Sensitivities</h2>
        <p>Please review all ingredient lists before purchasing skin-contact products. We are not liable for allergic reactions or skin sensitivities. If you experience irritation, discontinue use immediately. When in doubt, patch test first.</p>

        <h2>6. Intellectual Property</h2>
        <p>All brand assets, logos, product names, and site content belong to THINK BUDGET CO, LLC. You may not reproduce or use them without written permission.</p>

        <h2>7. Limitation of Liability</h2>
        <p>To the fullest extent permitted by law, THINK BUDGET CO, LLC shall not be liable for any indirect, incidental, or consequential damages arising from the use of our products or website.</p>

        <h2>8. Governing Law</h2>
        <p>These terms are governed by the laws of the United States. Any disputes shall be resolved in the jurisdiction where THINK BUDGET CO, LLC is registered.</p>

        <h2>9. Contact</h2>
        <p>Questions about these terms? <button className="legal-link" onClick={() => go("contact")}>Contact us here.</button></p>

        <div className="btn-row" style={{ justifyContent: "flex-start", marginTop: 32 }}>
          <button className="btn btn--ghost btn--sm" onClick={() => go("home")}>Back to shop</button>
        </div>
      </div>
    </div>
  );
}

/* ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ Refund Policy ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ */
function RefundPage({ go }) {
  return (
    <div className="rail sec legal-page" data-screen-label="Refund Policy">
      <div className="legal-card">
        <h1 className="legal-h">Refund Policy</h1>
        <p className="legal-date">Last updated: June 2026</p>

        <h2>Our Promise</h2>
        <p>We want you to love every single thing you get from Sugar Rush Co. If something isn't right, we'll make it right.</p>

        <h2>Returns & Exchanges</h2>
        <p>Due to the handmade and personal-care nature of our products, we do not accept returns on opened items. However, if your order arrives damaged, defective, or incorrect, we will gladly send a replacement or issue a full refund , no questions asked.</p>

        <h2>How to Request a Refund</h2>
        <p>Contact us within <strong>7 days</strong> of receiving your order. Include your order number and a photo of the issue. We will respond within 24-48 hours with a resolution.</p>

        <h2>Damaged in Shipping</h2>
        <p>If your package arrives damaged, please photograph both the packaging and the product and contact us right away. We'll sort it out immediately.</p>

        <h2>Cancellations</h2>
        <p>Orders can be cancelled within <strong>24 hours</strong> of purchase for a full refund. After 24 hours, orders may already be in production and cannot be cancelled.</p>

        <h2>Refund Timeline</h2>
        <p>Approved refunds are processed within 3-5 business days back to your original payment method.</p>

        <h2>Questions?</h2>
        <p><button className="legal-link" onClick={() => go("contact")}>Reach out to us</button> , we are always happy to help.</p>

        <div className="btn-row" style={{ justifyContent: "flex-start", marginTop: 32 }}>
          <button className="btn btn--ghost btn--sm" onClick={() => go("home")}>Back to shop</button>
        </div>
      </div>
    </div>
  );
}

/* ── Admin page ── */
const SERVER_URL = window.ADMIN_SERVER_URL || "https://sugarrushco.onrender.com";

const CARD_STYLE = {
  border:"3px solid var(--ink)", borderRadius:16, padding:"22px 26px",
  marginBottom:18, background:"var(--tld-white)", boxShadow:"var(--tld-shadow)"
};

/* ── Products Tab ── */
const CAT_OPTIONS = [
  { id:"lipgloss",    label:"Lip Gloss"   },
  { id:"candles",     label:"Candles"     },
  { id:"squishies",   label:"Squishies"   },
  { id:"body-butter", label:"Body Butter" },
  { id:"perfume",     label:"Perfume"     }
];

const EMPTY_FORM = { name:"", price:"", cat:"lipgloss", blurb:"", notes:"", stock:"", image_url:"" };

function ProductsTab({ secret }) {
  const [products, setProducts] = usePState([]);
  const [loading,  setLoading]  = usePState(false);
  const [err,      setErr]      = usePState("");
  const [form,     setForm]     = usePState(EMPTY_FORM);
  const [editing,  setEditing]  = usePState(null); // product id being edited
  const [saving,   setSaving]   = usePState(false);
  const [stockEdit,setStockEdit]= usePState({}); // { id: newStockValue }

  usePEffect(() => { fetchProducts(); }, []);

  const fetchProducts = async () => {
    setLoading(true); setErr("");
    try {
      const res  = await fetch(SERVER_URL + "/products");
      const data = await res.json();
      setProducts(Array.isArray(data) ? data : []);
    } catch(e) { setErr("Could not load products"); }
    setLoading(false);
  };

  const saveProduct = async () => {
    if (!form.name || !form.price || !form.cat) { setErr("Name, price and category are required"); return; }
    setSaving(true); setErr("");
    try {
      const url    = editing ? `${SERVER_URL}/admin/products/${editing}` : `${SERVER_URL}/admin/products`;
      const method = editing ? "PUT" : "POST";
      const res    = await fetch(url, {
        method, headers:{ "Content-Type":"application/json", "x-admin-secret": secret },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      setForm(EMPTY_FORM); setEditing(null);
      fetchProducts();
    } catch(e) { setErr(e.message); }
    setSaving(false);
  };

  const deleteProduct = async (id) => {
    if (!window.confirm("Hide this product from the shop?")) return;
    await fetch(`${SERVER_URL}/admin/products/${id}`, {
      method:"DELETE", headers:{ "x-admin-secret": secret }
    });
    fetchProducts();
  };

  const startEdit = (p) => {
    setEditing(p.id);
    setForm({ name:p.name, price:String(p.price), cat:p.cat, blurb:p.blurb||"", notes:p.notes||"", stock:String(p.stock||0), image_url:p.image_url||"" });
    window.scrollTo({ top: 0, behavior:"smooth" });
  };

  const updateStock = async (p) => {
    const newStock = parseInt(stockEdit[p.id]);
    if (isNaN(newStock) || newStock < 0) return;
    await fetch(`${SERVER_URL}/admin/products/${p.id}`, {
      method:"PUT", headers:{ "Content-Type":"application/json", "x-admin-secret": secret },
      body: JSON.stringify({ stock: newStock })
    });
    setStockEdit((s) => { const n = {...s}; delete n[p.id]; return n; });
    fetchProducts();
  };

  const fieldStyle = { display:"flex", flexDirection:"column", gap:4 };
  const labelStyle = { font:"700 12px var(--font-ui)", textTransform:"uppercase", letterSpacing:".05em", opacity:.7 };

  return (
    <div>
      {/* ── Add / Edit form ── */}
      <div style={CARD_STYLE}>
        <h3 style={{ margin:"0 0 18px", fontFamily:"var(--disp)", fontSize:20 }}>
          {editing ? "✏️ Edit Product" : "➕ Add New Product"}
        </h3>
        {err && <div style={{ background:"#ffe0e0", border:"2px solid #c00", borderRadius:8, padding:"10px 14px", marginBottom:14, color:"#900", fontSize:14 }}>{err}</div>}
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
          <div style={fieldStyle}>
            <label style={labelStyle}>Product name *</label>
            <input className="input" placeholder="Strawberry Shortcake Gloss" value={form.name}
              onChange={(e) => setForm({...form, name:e.target.value})} />
          </div>
          <div style={fieldStyle}>
            <label style={labelStyle}>Price ($) *</label>
            <input className="input" type="number" min="0" step="0.01" placeholder="8.00" value={form.price}
              onChange={(e) => setForm({...form, price:e.target.value})} />
          </div>
          <div style={fieldStyle}>
            <label style={labelStyle}>Category *</label>
            <select className="input" value={form.cat} onChange={(e) => setForm({...form, cat:e.target.value})}>
              {CAT_OPTIONS.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
            </select>
          </div>
          <div style={fieldStyle}>
            <label style={labelStyle}>Stock quantity</label>
            <input className="input" type="number" min="0" placeholder="10" value={form.stock}
              onChange={(e) => setForm({...form, stock:e.target.value})} />
          </div>
          <div style={{ ...fieldStyle, gridColumn:"1/-1" }}>
            <label style={labelStyle}>Short description</label>
            <input className="input" placeholder="High-shine, non-sticky, and it smells exactly like the dessert." value={form.blurb}
              onChange={(e) => setForm({...form, blurb:e.target.value})} />
          </div>
          <div style={{ ...fieldStyle, gridColumn:"1/-1" }}>
            <label style={labelStyle}>Notes / scent notes (comma separated)</label>
            <input className="input" placeholder="strawberry, whipped cream, vanilla sponge" value={form.notes}
              onChange={(e) => setForm({...form, notes:e.target.value})} />
          </div>
          <div style={{ ...fieldStyle, gridColumn:"1/-1" }}>
            <label style={labelStyle}>Product image URL (paste a link to your product photo)</label>
            <input className="input" placeholder="https://..." value={form.image_url}
              onChange={(e) => setForm({...form, image_url:e.target.value})} />
            {form.image_url && <img src={form.image_url} alt="preview" style={{ marginTop:8, height:80, objectFit:"cover", borderRadius:8 }} />}
          </div>
        </div>
        <div style={{ display:"flex", gap:10, marginTop:18 }}>
          <button className="btn" onClick={saveProduct} disabled={saving}>
            {saving ? "Saving…" : editing ? "Save changes" : "Add product"}
          </button>
          {editing && (
            <button className="btn btn--ghost" onClick={() => { setEditing(null); setForm(EMPTY_FORM); setErr(""); }}>
              Cancel
            </button>
          )}
        </div>
      </div>

      {/* ── Product list ── */}
      <h3 style={{ fontFamily:"var(--disp)", fontSize:20, margin:"28px 0 14px" }}>All Products ({products.length})</h3>
      {loading && <p style={{ opacity:.6 }}>Loading…</p>}
      {products.map((p) => {
        const isOos  = p.stock === 0;
        const isLow  = p.stock > 0 && p.stock <= 10;
        return (
          <div key={p.id} style={{ ...CARD_STYLE, opacity: isOos ? .75 : 1 }}>
            <div style={{ display:"flex", gap:14, alignItems:"flex-start", flexWrap:"wrap" }}>
              {p.image_url && <img src={p.image_url} alt={p.name} style={{ width:70, height:70, objectFit:"cover", borderRadius:10, border:"2px solid var(--ink)", flexShrink:0 }} />}
              <div style={{ flex:1, minWidth:200 }}>
                <div style={{ display:"flex", alignItems:"center", gap:8, flexWrap:"wrap", marginBottom:4 }}>
                  <strong style={{ fontSize:17 }}>{p.name}</strong>
                  <span style={{ fontSize:13, fontWeight:700, padding:"2px 10px", borderRadius:99,
                    background: isOos ? "#ffd0d0" : isLow ? "#fff3cd" : "#d4f7d4",
                    color:      isOos ? "#900"    : isLow ? "#7a5800" : "#1a6b1a" }}>
                    {isOos ? "Out of Stock" : isLow ? `⚠️ Only ${p.stock} left!` : `✓ ${p.stock} in stock`}
                  </span>
                  <span style={{ fontSize:13, opacity:.6 }}>${Number(p.price).toFixed(2)} · {CAT_OPTIONS.find(c=>c.id===p.cat)?.label}</span>
                </div>
                <p style={{ margin:"0 0 10px", fontSize:13, opacity:.7 }}>{p.blurb}</p>
                {/* Quick stock editor */}
                <div style={{ display:"flex", gap:8, alignItems:"center", flexWrap:"wrap" }}>
                  <span style={{ fontSize:13, fontWeight:700 }}>Update stock:</span>
                  <input className="input" type="number" min="0"
                    style={{ width:80, padding:"6px 10px", fontSize:14 }}
                    placeholder={String(p.stock || 0)}
                    value={stockEdit[p.id] !== undefined ? stockEdit[p.id] : ""}
                    onChange={(e) => setStockEdit((s) => ({...s, [p.id]: e.target.value}))} />
                  <button className="btn btn--sm" onClick={() => updateStock(p)}
                    disabled={stockEdit[p.id] === undefined || stockEdit[p.id] === ""}>
                    Save stock
                  </button>
                </div>
              </div>
              <div style={{ display:"flex", gap:8, flexShrink:0 }}>
                <button className="btn btn--sm btn--ghost" onClick={() => startEdit(p)}>Edit</button>
                <button className="btn btn--sm" style={{ background:"#c00", borderColor:"#c00" }} onClick={() => deleteProduct(p.id)}>Hide</button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function AdminPage({ go }) {
  const [authed,   setAuthed]   = usePState(false);
  const [password, setPassword] = usePState("");
  const [secret,   setSecret]   = usePState("");
  const [tab,      setTab]      = usePState("orders");
  const [orders,   setOrders]   = usePState([]);
  const [loading,  setLoading]  = usePState(false);
  const [err,      setErr]      = usePState("");
  const [tracking, setTracking] = usePState({});
  const [sending,  setSending]  = usePState({});
  const [sent,     setSent]     = usePState({});

  const login = async () => {
    if (password === (window.ADMIN_PASSWORD || "sugarrush2026")) {
      setSecret(password);
      setAuthed(true);
      fetchOrders(password);
    } else {
      setErr("Wrong password.");
    }
  };

  const fetchOrders = async (pwd) => {
    setLoading(true);
    setErr("");
    try {
      const res  = await fetch(SERVER_URL + "/orders", {
        headers: { "x-admin-secret": pwd || secret }
      });
      if (!res.ok) throw new Error("Auth failed");
      const data = await res.json();
      setOrders(data);
    } catch (e) {
      setErr("Could not load orders: " + e.message);
    }
    setLoading(false);
  };

  const sendTracking = async (order) => {
    const num = (tracking[order.id] || "").trim();
    if (!num) return;
    setSending((s) => ({ ...s, [order.id]: true }));
    setErr("");
    try {
      const res = await fetch(SERVER_URL + "/track", {
        method:  "POST",
        headers: { "Content-Type": "application/json", "x-admin-secret": secret },
        body:    JSON.stringify({ order_id: order.id, tracking_number: num })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      setSent((s) => ({ ...s, [order.id]: true }));
      setOrders((prev) => prev.map((o) =>
        o.id === order.id ? { ...o, tracking_number: num, tracking_sent: true, status: "shipped" } : o
      ));
    } catch (e) {
      setErr("Error: " + e.message);
    }
    setSending((s) => ({ ...s, [order.id]: false }));
  };

  if (!authed) return (
    <div className="confirm-wrap" data-screen-label="Admin login">
      <div className="confirm" style={{ maxWidth: 380 }}>
        <CherryIcon size={36} />
        <h1 className="confirm-h" style={{ fontSize: 22 }}>Admin login</h1>
        <div className="field" style={{ width: "100%", marginBottom: 14 }}>
          <input className={"input" + (err ? " is-bad" : "")} type="password"
            placeholder="Password" value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") login(); }} />
          {err && <span className="field-err">{err}</span>}
        </div>
        <button className="btn btn--wide" onClick={login}>Enter</button>
        <button className="btn btn--ghost btn--sm" style={{ marginTop: 10 }} onClick={() => go("home")}>Back to shop</button>
      </div>
    </div>
  );

  return (
    <div className="rail sec" data-screen-label="Admin">
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom: 20, flexWrap:"wrap", gap: 12 }}>
        <h1 style={{ margin:0, fontFamily:"var(--disp)", fontSize:"clamp(24px,4vw,36px)" }}>Admin Dashboard</h1>
        <div style={{ display:"flex", gap: 10 }}>
          <button className="btn btn--sm" onClick={() => tab === "orders" ? fetchOrders() : null}>Refresh</button>
          <button className="btn btn--ghost btn--sm" onClick={() => go("home")}>Back to shop</button>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display:"flex", gap:0, marginBottom:28, borderBottom:"3px solid var(--ink)" }}>
        {[["orders","📦 Orders"],["products","🛍️ Products"]].map(([id,label]) => (
          <button key={id} onClick={() => setTab(id)} style={{
            padding:"10px 24px", fontFamily:"var(--font-ui)", fontWeight:700, fontSize:15,
            border:"none", borderBottom: tab===id ? "3px solid var(--acc2)" : "3px solid transparent",
            background:"none", cursor:"pointer", color: tab===id ? "var(--ink)" : "rgba(0,0,0,.45)",
            marginBottom:"-3px"
          }}>{label}</button>
        ))}
      </div>

      {tab === "products" && <ProductsTab secret={secret} />}

      {tab === "orders" && (<React.Fragment>
      {err && <div style={{ background:"#ffe0e0", border:"2px solid #c00", borderRadius:10, padding:"12px 16px", marginBottom:20, color:"#900" }}>{err}</div>}

      {loading && <p style={{ textAlign:"center", opacity:.6 }}>Loading orders...</p>}

      {!loading && orders.length === 0 && (
        <div style={{ textAlign:"center", opacity:.55, padding:"60px 0" }}>
          <CherryIcon size={40} />
          <p style={{ marginTop:14 }}>No orders yet, they'll show up here once Stripe payments come in.</p>
        </div>
      )}

      {orders.map((order) => {
        const isShipped = order.tracking_sent || order.status === "shipped";
        return (
          <div key={order.id} style={{
            border: "3px solid var(--ink)", borderRadius: 16, padding: "22px 26px",
            marginBottom: 18, background: "var(--tld-white)",
            boxShadow: "var(--tld-shadow)"
          }}>
            <div style={{ display:"flex", justifyContent:"space-between", flexWrap:"wrap", gap:8, marginBottom:10 }}>
              <div>
                <span style={{ fontFamily:"var(--disp)", fontWeight:700, fontSize:18 }}>{order.order_no}</span>
                <span style={{
                  marginLeft:12, fontSize:12, fontWeight:700, textTransform:"uppercase",
                  letterSpacing:".06em", padding:"3px 10px", borderRadius:99,
                  background: isShipped ? "#d4f7d4" : "#fff3cd",
                  color:      isShipped ? "#1a6b1a" : "#7a5800"
                }}>{order.status || "paid"}</span>
              </div>
              <span style={{ fontSize:13, opacity:.55 }}>{order.created_at ? new Date(order.created_at).toLocaleDateString() : ""}</span>
            </div>

            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"4px 24px", fontSize:14, marginBottom:14 }}>
              <span><strong>Name:</strong> {order.customer_name}</span>
              <span><strong>Email:</strong> {order.customer_email}</span>
              <span style={{ gridColumn:"1/-1" }}><strong>Address:</strong> {order.customer_address}</span>
              <span><strong>Total:</strong> ${Number(order.total).toFixed(2)}</span>
              <span><strong>Items:</strong> {order.items}</span>
            </div>

            {isShipped ? (
              <div style={{ background:"#d4f7d4", borderRadius:10, padding:"10px 16px", fontSize:14 }}>
                Tracking sent: <strong>{order.tracking_number}</strong>
              </div>
            ) : (
              <div style={{ display:"flex", gap:10, alignItems:"center", flexWrap:"wrap" }}>
                <input className="input" style={{ flex:1, minWidth:200, maxWidth:340 }}
                  placeholder="USPS tracking number"
                  value={tracking[order.id] || ""}
                  onChange={(e) => setTracking((t) => ({ ...t, [order.id]: e.target.value }))} />
                <button className="btn btn--sm"
                  disabled={sending[order.id] || sent[order.id]}
                  style={(sending[order.id] || sent[order.id]) ? { opacity:.65 } : null}
                  onClick={() => sendTracking(order)}>
                  {sending[order.id] ? "Sending…" : sent[order.id] ? "Sent!" : "Send tracking email"}
                </button>
              </div>
            )}
          </div>
        );
      })}
      </React.Fragment>)}
    </div>
  );
}

Object.assign(window, { ShopPage, ProductPage, CartDrawer, CheckoutPage, ConfirmPage, ContactPage, TermsPage, RefundPage, AdminPage });
