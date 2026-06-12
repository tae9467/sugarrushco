// Sugar Rush Co. â€” shop, product, cart drawer, checkout, confirm, about, contact
const { useState: usePState, useMemo: usePMemo, useEffect: usePEffect, useRef: usePRef } = React;

/* â”€â”€ Shop page â”€â”€ */
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

/* â”€â”€ Product page â”€â”€ */
function ProductPage({ route, go, onAdd }) {
  const p     = productById(route.id) || SHOP_DATA.products[0];
  const [qty, setQty] = usePState(1);
  const pairs = (p.pair || []).map(productById).filter(Boolean).filter((x) => x.id !== p.id).slice(0, 2);
  return (
    <div className="rail sec" data-screen-label={"Product Â· " + p.name}>
      <button className="crumb" onClick={() => go("shop", { cat: p.cat })}>â† back to {catById(p.cat).label.toLowerCase()}</button>
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
              <button onClick={() => setQty(Math.max(1, qty - 1))} aria-label="Less">âˆ’</button>
              <span>{qty}</span>
              <button onClick={() => setQty(qty + 1)} aria-label="More">+</button>
            </div>
            <button className="btn" onClick={() => { onAdd(p.id, qty); setQty(1); }}>
              {`Add to cart Â· $${p.price * qty}`}
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

/* â”€â”€ Cart drawer â”€â”€ */
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
                    <button onClick={() => setQty(line.id, line.qty - 1)} aria-label="Less">âˆ’</button>
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

/* â”€â”€ Checkout â€” uses Stripe Payment Link (no backend needed) â”€â”€ */
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
  const total    = subtotal + shipping;

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
    localStorage.setItem("sugarrush.pending_order", JSON.stringify({ cart, form, total, orderNo }));

    if (paymentLinkReady) {
      // Build Payment Link URL â€” pre-fills amount + email on Stripe's page
      const url = new URL(window.STRIPE_PAYMENT_LINK);
      url.searchParams.set("prefilled_amount", Math.round(total * 100));
      url.searchParams.set("prefilled_email",  form.email);
      // Tell Stripe where to send them after payment (your site + ?payment=success)
      // Set this in your Stripe Payment Link settings â†’ After payment â†’ Redirect to URL
      window.location.href = url.toString();
    } else {
      // Demo mode â€” no Payment Link configured yet
      onPlaced();
    }
  };

  return (
    <div className="rail sec" data-screen-label="Checkout">
      <button className="crumb" onClick={() => go("shop")}>â† keep shopping</button>
      <SectionHead title="Checkout" />

      {!paymentLinkReady && (
        <div className="stripe-demo-note" style={{ marginBottom: 24 }}>
          <span>ðŸ”—</span>
          <span>
            <strong>Payment Link not connected yet.</strong> Create a Payment Link in your Stripe
            dashboard (set price to "Customer chooses"), paste it into <code>shop/app.jsx</code>, and
            set the redirect URL to <code>your-site-url/?payment=success</code>. Until then, checkout works in demo mode.
          </span>
        </div>
      )}

      <div className="co">
        {/* â”€â”€ Left: shipping info â”€â”€ */}
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
              {paymentLinkReady ? `Continue to payment Â· $${total}` : `Place order Â· $${total}`}
            </button>
            <p style={{ font:"italic 600 12.5px var(--font-italic)", opacity:0.6, textAlign:"center", marginTop:8 }}>
              {paymentLinkReady
                ? "You'll be taken to Stripe's secure checkout â€” then brought right back."
                : "(demo mode â€” no card charged)"}
            </p>
          </div>
        </div>

        {/* â”€â”€ Right: order summary â”€â”€ */}
        <div className="co-card">
          <h3>Your order</h3>
          {cart.map((line) => {
            const p = productById(line.id);
            return p ? (
              <div className="co-line" key={line.id}>
                <span>{p.name} Ã— {line.qty}</span><strong>${p.price * line.qty}</strong>
              </div>
            ) : null;
          })}
          <div className="co-line">
            <span>Shipping{shipping === 0 ? " (free over $35!)" : ""}</span>
            <strong>{shipping === 0 ? "free" : "$" + shipping}</strong>
          </div>
          <div className="co-total"><span>Total</span><span>${total}</span></div>
        </div>
      </div>
    </div>
  );
}

/* â”€â”€ Order confirmation â”€â”€ */
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
    const itemList = items.map((l) => `${l.product.name} x${l.qty} â€” $${l.product.price * l.qty}`).join("\n");
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
        <h1 className="confirm-h">Order confirmed â€” sweet!!</h1>
        <div className="confirm-no">order no. {orderNo}</div>
        {items.length > 0 && (
          <div className="confirm-items">
            {items.map((l) => (
              <div key={l.id} className="confirm-item">
                <span>{l.product.name} Ã— {l.qty}</span>
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

/* â”€â”€ Contact â”€â”€ */
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
          We'd love to hear from you â€” we try to reply within 24 hours.
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
            {sending ? "Sendingâ€¦" : "Send message"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* â”€â”€ Terms of Service â”€â”€ */
function TermsPage({ go }) {
  return (
    <div className="rail sec legal-page" data-screen-label="Terms of Service">
      <div className="legal-card">
        <h1 className="legal-h">Terms of Service</h1>
        <p className="legal-date">Last updated: June 2026</p>

        <h2>1. Overview</h2>
        <p>By placing an order with THINK BUDGET CO, LLC ("we", "us", "our"), you agree to these terms. Please read them carefully before purchasing.</p>

        <h2>2. Products</h2>
        <p>All products are small-batch and handmade. Product descriptions, images, and scents are as accurate as possible, but slight variations may occur. Our lip glosses, body butters, and perfumes are cosmetic products intended for external use only. Slimes and squishies are not intended for consumption â€” keep away from young children.</p>

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

/* â”€â”€ Refund Policy â”€â”€ */
function RefundPage({ go }) {
  return (
    <div className="rail sec legal-page" data-screen-label="Refund Policy">
      <div className="legal-card">
        <h1 className="legal-h">Refund Policy</h1>
        <p className="legal-date">Last updated: June 2026</p>

        <h2>Our Promise</h2>
        <p>We want you to love every single thing you get from Sugar Rush Co. If something isn't right, we'll make it right.</p>

        <h2>Returns & Exchanges</h2>
        <p>Due to the handmade and personal-care nature of our products, we do not accept returns on opened items. However, if your order arrives damaged, defective, or incorrect, we will gladly send a replacement or issue a full refund â€” no questions asked.</p>

        <h2>How to Request a Refund</h2>
        <p>Contact us within <strong>7 days</strong> of receiving your order. Include your order number and a photo of the issue. We will respond within 24-48 hours with a resolution.</p>

        <h2>Damaged in Shipping</h2>
        <p>If your package arrives damaged, please photograph both the packaging and the product and contact us right away. We'll sort it out immediately.</p>

        <h2>Cancellations</h2>
        <p>Orders can be cancelled within <strong>24 hours</strong> of purchase for a full refund. After 24 hours, orders may already be in production and cannot be cancelled.</p>

        <h2>Refund Timeline</h2>
        <p>Approved refunds are processed within 3-5 business days back to your original payment method.</p>

        <h2>Questions?</h2>
        <p><button className="legal-link" onClick={() => go("contact")}>Reach out to us</button> â€” we are always happy to help.</p>

        <div className="btn-row" style={{ justifyContent: "flex-start", marginTop: 32 }}>
          <button className="btn btn--ghost btn--sm" onClick={() => go("home")}>Back to shop</button>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { ShopPage, ProductPage, CartDrawer, CheckoutPage, ConfirmPage, ContactPage, TermsPage, RefundPage });
