// Sugar Rush Co. shop, product, cart drawer, checkout, confirm, about, contact
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

  const images = usePMemo(() => {
    let arr = [];
    try { arr = JSON.parse(p.images || "[]"); } catch {}
    if (!arr.length && p.image_url) arr = [p.image_url];
    return arr;
  }, [p.id]);
  const [activeImg, setActiveImg] = usePState(0);
  usePEffect(() => setActiveImg(0), [p.id]);
  const bg = CAT_GRADIENTS[p.cat] || CAT_GRADIENTS.lipgloss;

  return (
    <div className="rail sec" data-screen-label={"Product · " + p.name}>
      <button className="crumb" onClick={() => go("shop", { cat: p.cat })}>← back to {catById(p.cat).label.toLowerCase()}</button>
      <div className="pp">
        <div className="pp-photo">
          {images.length > 0 ? (
            <div>
              <div style={{ height:470, borderRadius:20, overflow:"hidden", background:bg }}>
                <img src={images[activeImg]} alt={p.name}
                  style={{ width:"100%", height:"100%", objectFit:"cover", display:"block" }} />
              </div>
              {images.length > 1 && (
                <div style={{ display:"flex", gap:8, marginTop:10, flexWrap:"wrap" }}>
                  {images.map((src, i) => (
                    <button key={i} onClick={() => setActiveImg(i)} style={{
                      padding:0, border: i === activeImg ? "3px solid var(--ink)" : "2px solid transparent",
                      borderRadius:8, cursor:"pointer", background:"none", flexShrink:0
                    }}>
                      <img src={src} alt="" style={{ width:56, height:56, objectFit:"cover", borderRadius:6, display:"block" }} />
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <ProductImage product={p} height={470} radius={20} />
          )}
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
      <ProductReviews productId={p.id} />
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
function CheckoutPage({ cart, subtotal, go, onPlaced }) {
  const [form, setForm]   = usePState({ name:"", email:"", address:"", address2:"", city:"", state:"", zip:"" });
  const [errs, setErrs]   = usePState({});
  const [coErr, setCoErr] = usePState("");
  const [going, setGoing] = usePState(false);
  const [suggestions, setSuggestions] = usePState([]);
  const [showSug, setShowSug]         = usePState(false);
  const debounceRef = usePRef(null);

  const shipping = subtotal >= 35 || subtotal === 0 ? 0 : 5;
  const total    = parseFloat((subtotal + shipping).toFixed(2));

  // ── Address autocomplete via OpenStreetMap (free, no key) ──
  const onAddressChange = (val) => {
    setForm((f) => ({ ...f, address: val }));
    clearTimeout(debounceRef.current);
    if (val.length < 3) { setSuggestions([]); setShowSug(false); return; }
    debounceRef.current = setTimeout(async () => {
      try {
        const res  = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(val)}&countrycodes=us&addressdetails=1&limit=6`,
          { headers: { "Accept-Language": "en" } }
        );
        const data = await res.json();
        setSuggestions(data);
        setShowSug(data.length > 0);
      } catch {}
    }, 350);
  };

  const pickSuggestion = (s) => {
    const a = s.address || {};
    const streetNum  = a.house_number || "";
    const streetName = a.road || a.street || "";
    const street     = [streetNum, streetName].filter(Boolean).join(" ");
    const rawCity    = a.city || a.town || a.village || a.county || "";
    const city       = rawCity.replace(/^City of /i, "").replace(/^Town of /i, "").trim();
    const zip        = a.postcode ? a.postcode.slice(0, 5) : "";
    const state      = a.state || "";
    setForm((f) => ({ ...f, address: street, city, zip, state }));
    setSuggestions([]); setShowSug(false);
  };

  // ── Validation ──
  const validate = () => {
    const e = {};
    if (!form.name.trim())    e.name    = "needed, please!";
    if (form.name.trim() && !/^[a-zA-Z\s\-'.]+$/.test(form.name)) e.name = "name can only contain letters";
    if (!form.email.trim())   e.email   = "needed, please!";
    if (form.email && !/^\S+@\S+\.\S+$/.test(form.email))         e.email = "hmm, that email looks off";
    if (!form.address.trim()) e.address = "needed, please!";
    if (!form.city.trim())    e.city    = "needed, please!";
    if (!form.zip.trim())     e.zip     = "needed, please!";
    if (form.zip && !/^\d{5}$/.test(form.zip))                     e.zip   = "ZIP must be exactly 5 digits";
    setErrs(e);
    return Object.keys(e).length === 0;
  };

  const place = async () => {
    if (!validate()) return;
    setCoErr(""); setGoing(true);

    const orderNo  = "SR-" + Math.floor(1000 + Math.random() * 9000);
    const newOrder = { orderNo, cart, form, subtotal, shipping, total, date: new Date().toISOString(), status: "Pending" };
    try {
      const history = JSON.parse(localStorage.getItem("sugarrush.orders") || "[]");
      history.unshift(newOrder);
      localStorage.setItem("sugarrush.orders", JSON.stringify(history.slice(0, 200)));
    } catch(e) {}
    localStorage.setItem("sugarrush.pending_order", JSON.stringify({ cart, form, total, orderNo }));

    const enrichedCart = cart.map((line) => ({ id: line.id, qty: line.qty }));
    const fullAddress  = [form.address, form.address2].filter(Boolean).join(", ") + ", " + form.city + (form.state ? ", " + form.state : "") + " " + form.zip;
    const SERVER       = window.ADMIN_SERVER_URL || "https://sugarrushco.onrender.com";

    const tryCheckout = async (attemptsLeft) => {
      try {
        const res  = await fetch(SERVER + "/create-checkout", {
          method:  "POST",
          headers: { "Content-Type": "application/json" },
          body:    JSON.stringify({ cart: enrichedCart, form: { ...form, fullAddress }, shipping, orderNo })
        });
        let data;
        try { data = await res.json(); } catch { data = {}; }
        if (!res.ok) throw new Error(data.error || "Server error " + res.status);
        if (data.url) {
          window.location.href = data.url;
        } else {
          throw new Error(data.error || "No checkout URL returned");
        }
      } catch(e) {
        if (attemptsLeft > 1 && e.message === "Failed to fetch") {
          setCoErr("Server is starting up... retrying in 5 seconds");
          await new Promise((r) => setTimeout(r, 5000));
          return tryCheckout(attemptsLeft - 1);
        }
        setCoErr("Payment error: " + e.message);
        setGoing(false);
      }
    };

    tryCheckout(3);
  };

  const inp = (id) => ({
    className: "input" + (errs[id] ? " is-bad" : ""),
    value: form[id],
    onChange: (ev) => setForm((f) => ({ ...f, [id]: ev.target.value }))
  });

  return (
    <div className="rail sec" data-screen-label="Checkout">
      <button className="crumb" onClick={() => go("shop")}>keep shopping</button>
      <SectionHead title="Checkout" />

      {coErr && (
        <div style={{ background:"#ffe0e0", border:"2px solid #c00", borderRadius:8, padding:"10px 14px", marginBottom:16, color:"#900", fontSize:14 }}>{coErr}</div>
      )}

      <div className="co">
        <div>
          <div className="co-form">

            {/* Name */}
            <div className="field">
              <label htmlFor="co-name">Full name</label>
              <input id="co-name" autoComplete="name" placeholder="Your name"
                {...inp("name")}
                onChange={(ev) => {
                  const val = ev.target.value.replace(/[^a-zA-Z\s\-'.]/g, "");
                  setForm((f) => ({ ...f, name: val }));
                }} />
              {errs.name && <span className="field-err">{errs.name}</span>}
            </div>

            {/* Email */}
            <div className="field">
              <label htmlFor="co-email">Email</label>
              <input id="co-email" autoComplete="email" placeholder="you@email.com" type="email"
                {...inp("email")} />
              {errs.email && <span className="field-err">{errs.email}</span>}
            </div>

            {/* Address line 1 with autocomplete */}
            <div className="field field--full" style={{ position:"relative" }}>
              <label htmlFor="co-address">Address line 1</label>
              <input id="co-address" autoComplete="address-line1" placeholder="123 Sweet St"
                className={"input" + (errs.address ? " is-bad" : "")}
                value={form.address}
                onChange={(ev) => onAddressChange(ev.target.value)}
                onBlur={() => setTimeout(() => setShowSug(false), 180)} />
              {errs.address && <span className="field-err">{errs.address}</span>}
              {showSug && suggestions.length > 0 && (
                <div style={{
                  position:"absolute", top:"100%", left:0, right:0, zIndex:99,
                  background:"white", border:"2px solid var(--ink)", borderRadius:10,
                  boxShadow:"0 4px 16px rgba(0,0,0,.12)", maxHeight:220, overflowY:"auto"
                }}>
                  {suggestions.map((s, i) => (
                    <button key={i} onMouseDown={() => pickSuggestion(s)} style={{
                      display:"block", width:"100%", textAlign:"left",
                      padding:"10px 14px", border:"none", borderBottom: i < suggestions.length-1 ? "1px solid #eee" : "none",
                      background:"none", cursor:"pointer", fontSize:13, lineHeight:1.4
                    }}>
                      {s.display_name}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Address line 2 */}
            <div className="field field--full">
              <label htmlFor="co-address2">Address line 2 <span style={{ opacity:.5, fontWeight:400 }}>(apt, suite, unit — optional)</span></label>
              <input id="co-address2" autoComplete="address-line2" placeholder="Apt 210, Suite B, Unit 4..."
                className="input" value={form.address2}
                onChange={(ev) => setForm((f) => ({ ...f, address2: ev.target.value }))} />
            </div>

            {/* City */}
            <div className="field">
              <label htmlFor="co-city">City</label>
              <input id="co-city" autoComplete="address-level2" placeholder="City"
                {...inp("city")} />
              {errs.city && <span className="field-err">{errs.city}</span>}
            </div>

            {/* ZIP */}
            <div className="field">
              <label htmlFor="co-zip">ZIP code</label>
              <input id="co-zip" autoComplete="postal-code" placeholder="12345"
                inputMode="numeric" maxLength={5}
                className={"input" + (errs.zip ? " is-bad" : "")}
                value={form.zip}
                onChange={(ev) => {
                  const val = ev.target.value.replace(/\D/g, "").slice(0, 5);
                  setForm((f) => ({ ...f, zip: val }));
                }} />
              {errs.zip && <span className="field-err">{errs.zip}</span>}
            </div>

          </div>

          <div style={{ marginTop: 26 }}>
            <button className="btn btn--wide" onClick={place} disabled={going}
              style={going ? { opacity:.65, cursor:"wait" } : null}>
              {going ? "Taking you to payment..." : `Continue to payment · $${total}`}
            </button>
            <p style={{ font:"italic 600 12.5px var(--font-italic)", opacity:0.6, textAlign:"center", marginTop:8 }}>
              You'll be taken to Stripe's secure checkout, then brought right back.
            </p>
          </div>
        </div>

        {/* Order summary */}
        <div className="co-card">
          <h3>Your order</h3>
          {cart.map((line) => {
            const p = productById(line.id);
            return p ? (
              <div className="co-line" key={line.id}>
                <span>{p.name} x{line.qty}</span><strong>${p.price * line.qty}</strong>
              </div>
            ) : null;
          })}
          <div className="co-line">
            <span>Shipping{shipping === 0 ? " (free over $35!)" : ""}</span>
            <strong>{shipping === 0 ? "free" : "$" + shipping}</strong>
          </div>
          <div className="co-line">
            <span>Tax</span>
            <strong>calculated at checkout</strong>
          </div>
          <div className="co-total"><span>Total</span><span>${total}+tax</span></div>
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
        <img src="shop/assets/logo-footer.png" alt="Sugar Rush Co." className="confirm-logo" style={{ objectFit:"contain", marginBottom:0 }} />
        <h1 className="confirm-h">Order confirmed, sweet!!</h1>
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
          {" "}Once your order ships, you'll get another email with your USPS tracking number.
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
        <img src="shop/assets/logo-footer.png" alt="Sugar Rush Co." style={{ height:80, objectFit:"contain", marginBottom:8 }} />
        <h1 className="confirm-h">Order confirmed, sweet!!</h1>
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

const EMPTY_FORM = { name:"", price:"", cat:"lipgloss", blurb:"", notes:"", stock:"", images:[] };

function ImageUploader({ images, onChange }) {
  const [dragging, setDragging] = usePState(false);
  const fileRef = usePRef(null);

  const addFiles = (files) => {
    Array.from(files).forEach((file) => {
      if (!file.type.startsWith("image/")) return;
      const reader = new FileReader();
      reader.onload = (e) => onChange((prev) => [...prev, e.target.result]);
      reader.readAsDataURL(file);
    });
  };

  const onDrop = (e) => {
    e.preventDefault(); setDragging(false);
    addFiles(e.dataTransfer.files);
  };

  const setFeatured = (idx) => {
    onChange([images[idx], ...images.filter((_, i) => i !== idx)]);
  };

  const removeImage = (idx) => {
    onChange(images.filter((_, i) => i !== idx));
  };

  return (
    <div>
      <div
        onClick={() => fileRef.current.click()}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        style={{
          border: `2px dashed ${dragging ? "var(--acc2)" : "var(--ink)"}`,
          borderRadius: 12, padding: "22px 16px", textAlign: "center",
          cursor: "pointer", background: dragging ? "rgba(0,0,0,.04)" : "transparent", transition: "all .15s"
        }}
      >
        <div style={{ fontSize: 13, opacity: .7 }}>Drop images here or <strong>click to browse</strong></div>
        <div style={{ fontSize: 11, opacity: .5, marginTop: 4 }}>First image = featured · add multiple</div>
      </div>
      <input ref={fileRef} type="file" accept="image/*" multiple style={{ display:"none" }}
        onChange={(e) => addFiles(e.target.files)} />
      {images.length > 0 && (
        <div style={{ display:"flex", gap:10, flexWrap:"wrap", marginTop:12 }}>
          {images.map((src, i) => (
            <div key={i} style={{ position:"relative" }}>
              <img src={src} alt="" style={{
                width:80, height:80, objectFit:"cover", borderRadius:8,
                border: i === 0 ? "3px solid var(--acc2)" : "2px solid var(--ink)"
              }} />
              {i === 0 && (
                <span style={{ position:"absolute", top:4, left:4, background:"var(--acc2)", color:"white",
                  fontSize:9, fontWeight:700, padding:"2px 5px", borderRadius:4 }}>FEATURED</span>
              )}
              {i > 0 && (
                <button onClick={() => setFeatured(i)} style={{
                  position:"absolute", top:4, left:4, background:"rgba(0,0,0,.6)", color:"white",
                  border:"none", borderRadius:4, fontSize:9, fontWeight:700, padding:"2px 5px", cursor:"pointer"
                }}>SET MAIN</button>
              )}
              <button onClick={() => removeImage(i)} style={{
                position:"absolute", top:4, right:4, background:"#c00", color:"white",
                border:"none", borderRadius:"50%", width:18, height:18, fontSize:13,
                cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", lineHeight:1
              }}>×</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

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
      const res  = await fetch(SERVER_URL + "/products?all=true", {
        headers: { "x-admin-secret": secret }
      });
      const data = await res.json();
      setProducts(Array.isArray(data) ? data : []);
    } catch(e) { setErr("Could not load products"); }
    setLoading(false);
  };

  const saveProduct = async () => {
    if (!form.name || !form.price || !form.cat) { setErr("Name, price and category are required"); return; }
    const dup = products.find((p) => p.name.trim().toLowerCase() === form.name.trim().toLowerCase() && p.id !== editing);
    if (dup) { setErr(`"${dup.name}" already exists — edit that one instead of creating a duplicate.`); return; }
    setSaving(true); setErr("");
    try {
      const url    = editing ? `${SERVER_URL}/admin/products/${editing}` : `${SERVER_URL}/admin/products`;
      const method = editing ? "PUT" : "POST";
      const body   = { ...form, image_url: form.images[0] || "", images: JSON.stringify(form.images) };
      const res    = await fetch(url, {
        method, headers:{ "Content-Type":"application/json", "x-admin-secret": secret },
        body: JSON.stringify(body)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      setForm(EMPTY_FORM); setEditing(null);
      fetchProducts();
    } catch(e) { setErr(e.message); }
    setSaving(false);
  };

  const deleteProduct = async (id) => {
    await fetch(`${SERVER_URL}/admin/products/${id}`, {
      method:"DELETE", headers:{ "x-admin-secret": secret }
    });
    fetchProducts();
  };

  const toggleHide = async (p) => {
    await fetch(`${SERVER_URL}/admin/products/${p.id}`, {
      method:"PUT", headers:{ "Content-Type":"application/json", "x-admin-secret": secret },
      body: JSON.stringify({ active: p.active === false ? true : false })
    });
    fetchProducts();
  };

  const startEdit = (p) => {
    setEditing(p.id);
    let images = [];
    try { images = JSON.parse(p.images || "[]"); } catch {}
    if (!images.length && p.image_url) images = [p.image_url];
    setForm({ name:p.name, price:String(p.price), cat:p.cat, blurb:p.blurb||"", notes:p.notes||"", stock:String(p.stock||0), images });
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
            <label style={labelStyle}>Product images (drag &amp; drop or click · first = featured)</label>
            <ImageUploader images={form.images} onChange={(imgs) => setForm((f) => ({...f, images: typeof imgs === "function" ? imgs(f.images) : imgs}))} />
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
      {(() => {
        const visible = products.filter((p) => p.active !== false);
        const hidden  = products.filter((p) => p.active === false);
        return (
          <React.Fragment>
            <h3 style={{ fontFamily:"var(--disp)", fontSize:20, margin:"28px 0 14px" }}>
              Active Products ({visible.length})
            </h3>
            {loading && <p style={{ opacity:.6 }}>Loading…</p>}
            {[...visible, ...hidden].map((p) => {
              const isHidden = p.active === false;
              const isOos  = p.stock === 0;
              const isLow  = p.stock > 0 && p.stock <= 10;
              let thumb = p.image_url || "";
              if (!thumb && p.images) { try { thumb = JSON.parse(p.images)[0] || ""; } catch {} }
              return (
                <div key={p.id} style={{ ...CARD_STYLE, opacity: isHidden ? .55 : isOos ? .8 : 1,
                  borderColor: isHidden ? "#aaa" : "var(--ink)" }}>
                  {isHidden && (
                    <div style={{ background:"#f0f0f0", color:"#666", fontSize:11, fontWeight:700,
                      textTransform:"uppercase", letterSpacing:".08em", padding:"3px 10px", borderRadius:6,
                      display:"inline-block", marginBottom:10 }}>Hidden from shop</div>
                  )}
                  <div style={{ display:"flex", gap:14, alignItems:"flex-start", flexWrap:"wrap" }}>
                    {thumb && <img src={thumb} alt={p.name} style={{ width:70, height:70, objectFit:"cover", borderRadius:10, border:"2px solid var(--ink)", flexShrink:0 }} />}
                    <div style={{ flex:1, minWidth:200 }}>
                      <div style={{ display:"flex", alignItems:"center", gap:8, flexWrap:"wrap", marginBottom:4 }}>
                        <strong style={{ fontSize:17 }}>{p.name}</strong>
                        {!isHidden && (
                          <span style={{ fontSize:13, fontWeight:700, padding:"2px 10px", borderRadius:99,
                            background: isOos ? "#ffd0d0" : isLow ? "#fff3cd" : "#d4f7d4",
                            color:      isOos ? "#900"    : isLow ? "#7a5800" : "#1a6b1a" }}>
                            {isOos ? "Out of Stock" : isLow ? `⚠️ Only ${p.stock} left!` : `✓ ${p.stock} in stock`}
                          </span>
                        )}
                        <span style={{ fontSize:13, opacity:.6 }}>${Number(p.price).toFixed(2)} · {CAT_OPTIONS.find(c=>c.id===p.cat)?.label}</span>
                      </div>
                      <p style={{ margin:"0 0 10px", fontSize:13, opacity:.7 }}>{p.blurb}</p>
                      {!isHidden && (
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
                      )}
                    </div>
                    <div style={{ display:"flex", gap:8, flexShrink:0, flexWrap:"wrap" }}>
                      <button className="btn btn--sm btn--ghost" onClick={() => startEdit(p)}>Edit</button>
                      <button className="btn btn--sm btn--ghost" onClick={() => toggleHide(p)}
                        style={{ borderColor:"#888", color:"#555" }}>
                        {isHidden ? "Unhide" : "Hide"}
                      </button>
                      <button className="btn btn--sm" style={{ background:"#c00", borderColor:"#c00" }}
                        onClick={() => deleteProduct(p.id)}>Delete</button>
                    </div>
                  </div>
                </div>
              );
            })}
          </React.Fragment>
        );
      })()}
    </div>
  );
}

function OrderCard({ order, secret, onUpdate, onHide, onDelete, tracking, setTracking, sending, sent, onSendTracking, showRestore, onRestore, onDeliver, showDelivered }) {
  const [editing, setEditing] = usePState(false);
  const [editForm, setEditForm] = usePState({ customer_name: order.customer_name, customer_email: order.customer_email, customer_address: order.customer_address });
  const [saving, setSaving] = usePState(false);
  const isShipped = order.tracking_sent || order.status === "shipped";
  const key = order.order_no;

  const saveEdit = async () => {
    setSaving(true);
    try {
      const res = await fetch(SERVER_URL + "/admin/orders/" + order.order_no, {
        method: "PUT", headers: { "Content-Type": "application/json", "x-admin-secret": secret },
        body: JSON.stringify(editForm)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      onUpdate({ ...order, ...editForm });
      setEditing(false);
    } catch(e) { alert("Save failed: " + e.message); }
    setSaving(false);
  };

  return (
    <div style={{ border:"3px solid var(--ink)", borderRadius:16, padding:"22px 26px", marginBottom:18, background:"var(--tld-white)", boxShadow:"var(--tld-shadow)" }}>
      <div style={{ display:"flex", justifyContent:"space-between", flexWrap:"wrap", gap:8, marginBottom:10 }}>
        <div>
          <span style={{ fontFamily:"var(--disp)", fontWeight:700, fontSize:18 }}>{order.order_ref || order.order_no}</span>
          <span style={{ marginLeft:12, fontSize:12, fontWeight:700, textTransform:"uppercase", letterSpacing:".06em", padding:"3px 10px", borderRadius:99,
            background: isShipped ? "#d4f7d4" : order.status === "pending" ? "#e8e8e8" : "#fff3cd",
            color:      isShipped ? "#1a6b1a" : order.status === "pending" ? "#555" : "#7a5800"
          }}>{order.status || "paid"}</span>
        </div>
        <div style={{ display:"flex", gap:6, alignItems:"center", flexWrap:"wrap" }}>
          <span style={{ fontSize:13, opacity:.55 }}>{order.created_at ? new Date(order.created_at).toLocaleDateString() : ""}</span>
          {showRestore ? (
            <button className="btn btn--sm" style={{ background:"#1a6b1a", borderColor:"#1a6b1a" }} onClick={onRestore}>Restore</button>
          ) : (
            <React.Fragment>
              <button className="btn btn--sm btn--ghost" onClick={() => { setEditing((e) => !e); setEditForm({ customer_name: order.customer_name, customer_email: order.customer_email, customer_address: order.customer_address }); }}>
                {editing ? "Cancel" : "Edit"}
              </button>
              <button className="btn btn--sm btn--ghost" style={{ borderColor:"#888", color:"#555" }} onClick={onHide}>
                {order.hidden ? "Unhide" : "Hide"}
              </button>
              {order.status === "pending" && (
                <button className="btn btn--sm" style={{ background:"#c00", borderColor:"#c00" }} onClick={onDelete}>
                  Delete
                </button>
              )}
            </React.Fragment>
          )}
        </div>
      </div>

      {editing ? (
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:14 }}>
          <div style={{ display:"flex", flexDirection:"column", gap:4 }}>
            <label style={{ fontSize:11, fontWeight:700, opacity:.6, textTransform:"uppercase" }}>Name</label>
            <input className="input" value={editForm.customer_name} onChange={(e) => setEditForm((f) => ({...f, customer_name: e.target.value}))} />
          </div>
          <div style={{ display:"flex", flexDirection:"column", gap:4 }}>
            <label style={{ fontSize:11, fontWeight:700, opacity:.6, textTransform:"uppercase" }}>Email</label>
            <input className="input" value={editForm.customer_email} onChange={(e) => setEditForm((f) => ({...f, customer_email: e.target.value}))} />
          </div>
          <div style={{ display:"flex", flexDirection:"column", gap:4, gridColumn:"1/-1" }}>
            <label style={{ fontSize:11, fontWeight:700, opacity:.6, textTransform:"uppercase" }}>Address</label>
            <input className="input" value={editForm.customer_address} onChange={(e) => setEditForm((f) => ({...f, customer_address: e.target.value}))} />
          </div>
          <div style={{ gridColumn:"1/-1", display:"flex", gap:8 }}>
            <button className="btn btn--sm" onClick={saveEdit} disabled={saving}>{saving ? "Saving…" : "Save changes"}</button>
            <button className="btn btn--sm btn--ghost" onClick={() => setEditing(false)}>Cancel</button>
          </div>
        </div>
      ) : (
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"4px 24px", fontSize:14, marginBottom:14 }}>
          <span><strong>Name:</strong> {order.customer_name}</span>
          <span><strong>Email:</strong> {order.customer_email}</span>
          <span style={{ gridColumn:"1/-1" }}><strong>Address:</strong> {order.customer_address}</span>
          <span><strong>Total:</strong> ${Number(order.total).toFixed(2)}</span>
          <span><strong>Items:</strong> {order.items}</span>
        </div>
      )}

      {!showRestore && !showDelivered && (isShipped ? (
        <div>
          <div style={{ background:"#d4f7d4", borderRadius:10, padding:"10px 16px", fontSize:14, display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:8 }}>
            <div>
              <strong>Tracking:</strong> {order.tracking_number}
              {order.shipped_at && <span style={{ marginLeft:12, opacity:.6, fontSize:12 }}>Shipped {new Date(order.shipped_at).toLocaleString()}</span>}
            </div>
            <div style={{ display:"flex", gap:8 }}>
              <a href={`https://tools.usps.com/go/TrackConfirmAction?tLabels=${order.tracking_number}`} target="_blank" rel="noopener"
                className="btn btn--sm btn--ghost" style={{ textDecoration:"none" }}>
                Track on USPS ↗
              </a>
              <button className="btn btn--sm" style={{ background:"#1a6b1a", borderColor:"#1a6b1a" }} onClick={onDeliver}>
                Mark Delivered
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div style={{ display:"flex", gap:10, alignItems:"center", flexWrap:"wrap" }}>
          <input className="input" style={{ flex:1, minWidth:200, maxWidth:340 }}
            placeholder="USPS tracking number"
            value={tracking[key] || ""}
            onChange={(e) => setTracking((t) => ({ ...t, [key]: e.target.value }))} />
          <button className="btn btn--sm"
            disabled={sending[key] || sent[key]}
            style={(sending[key] || sent[key]) ? { opacity:.65 } : null}
            onClick={() => onSendTracking(order)}>
            {sending[key] ? "Sending…" : sent[key] ? "Sent!" : "Send tracking email"}
          </button>
        </div>
      ))}

      {showDelivered && (
        <div style={{ marginTop:10 }}>
          <div style={{ display:"flex", gap:8, alignItems:"center", flexWrap:"wrap", marginBottom:8 }}>
            {order.shipped_at && <span style={{ fontSize:13, opacity:.7 }}>📦 Shipped: {new Date(order.shipped_at).toLocaleString()}</span>}
            {order.delivered_at && <span style={{ fontSize:13, opacity:.7 }}>✅ Delivered: {new Date(order.delivered_at).toLocaleString()}</span>}
            {order.tracking_number && (
              <a href={`https://tools.usps.com/go/TrackConfirmAction?tLabels=${order.tracking_number}`} target="_blank" rel="noopener"
                className="btn btn--sm btn--ghost" style={{ textDecoration:"none" }}>
                Track on USPS ↗
              </a>
            )}
          </div>
          {order.delivery_screenshot && (
            <div style={{ marginTop:8 }}>
              <p style={{ fontSize:12, opacity:.5, marginBottom:4 }}>Delivery screenshot (USPS page at time of marking delivered)</p>
              <img src={order.delivery_screenshot} alt="USPS delivery screenshot"
                style={{ width:"100%", borderRadius:8, border:"2px solid var(--ink)", maxHeight:300, objectFit:"cover", objectPosition:"top" }} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function HiddenProductsTab({ secret }) {
  const [products, setProducts] = usePState([]);
  usePEffect(() => {
    fetch(SERVER_URL + "/products?all=true", { headers: { "x-admin-secret": secret } })
      .then((r) => r.json()).then((data) => setProducts(Array.isArray(data) ? data.filter((p) => p.active === false && !p.deleted) : []));
  }, []);
  const unhide = async (p) => {
    await fetch(SERVER_URL + "/admin/products/" + p.id, {
      method: "PUT", headers: { "Content-Type": "application/json", "x-admin-secret": secret },
      body: JSON.stringify({ active: true })
    });
    setProducts((prev) => prev.filter((x) => x.id !== p.id));
  };
  return (
    <div style={{ marginTop: 32 }}>
      <h3 style={{ fontFamily:"var(--disp)", fontSize:20, margin:"0 0 14px" }}>Hidden Products</h3>
      {products.length === 0 && <p style={{ opacity:.5 }}>No hidden products.</p>}
      {products.map((p) => (
        <div key={p.id} style={{ ...CARD_STYLE, opacity:.6 }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:8 }}>
            <div>
              <strong>{p.name}</strong>
              <span style={{ marginLeft:10, fontSize:13, opacity:.6 }}>${Number(p.price).toFixed(2)}</span>
            </div>
            <button className="btn btn--sm" onClick={() => unhide(p)}>Unhide</button>
          </div>
        </div>
      ))}
    </div>
  );
}

function DeletedProductsTab({ secret }) {
  const [products, setProducts] = usePState([]);
  const load = () => {
    fetch(SERVER_URL + "/products?all=true", { headers: { "x-admin-secret": secret } })
      .then((r) => r.json()).then((data) => setProducts(Array.isArray(data) ? data.filter((p) => p.deleted) : []));
  };
  usePEffect(() => { load(); }, []);
  const restore = async (p) => {
    await fetch(SERVER_URL + "/admin/products/" + p.id, {
      method: "PUT", headers: { "Content-Type": "application/json", "x-admin-secret": secret },
      body: JSON.stringify({ deleted: false })
    });
    load();
  };
  return (
    <div style={{ marginTop: 32 }}>
      <h3 style={{ fontFamily:"var(--disp)", fontSize:20, margin:"0 0 14px" }}>Deleted Products</h3>
      {products.length === 0 && <p style={{ opacity:.5 }}>No deleted products.</p>}
      {products.map((p) => (
        <div key={p.id} style={{ ...CARD_STYLE, opacity:.55 }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:8 }}>
            <div>
              <strong>{p.name}</strong>
              <span style={{ marginLeft:10, fontSize:13, opacity:.6 }}>${Number(p.price).toFixed(2)}</span>
              {p.deleted_at && <span style={{ marginLeft:10, fontSize:12, opacity:.5 }}>deleted {new Date(p.deleted_at).toLocaleDateString()}</span>}
            </div>
            <button className="btn btn--sm" style={{ background:"#1a6b1a", borderColor:"#1a6b1a" }} onClick={() => restore(p)}>Restore</button>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ── Reviews Tab ── */
function ReviewsTab({ secret }) {
  const [reviews, setReviews] = usePState([]);
  const [loading, setLoading] = usePState(true);
  const [err,     setErr]     = usePState("");
  const [replyText, setReplyText] = usePState({});
  const [replying,  setReplying]  = usePState({});
  const [replySent, setReplySent] = usePState({});
  const [deleting,  setDeleting]  = usePState({});

  const load = async () => {
    setLoading(true); setErr("");
    try {
      const res  = await fetch(SERVER_URL + "/admin/reviews", { headers: { "x-admin-secret": secret } });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      setReviews(Array.isArray(data) ? data : []);
    } catch(e) { setErr("Could not load reviews: " + e.message); }
    setLoading(false);
  };

  usePEffect(() => { load(); }, []);

  const sendReply = async (id) => {
    const text = (replyText[id] || "").trim();
    if (!text) return;
    setReplying((s) => ({ ...s, [id]: true }));
    try {
      const res = await fetch(SERVER_URL + "/admin/reviews/" + id + "/reply", {
        method: "POST", headers: { "Content-Type": "application/json", "x-admin-secret": secret },
        body: JSON.stringify({ reply: text })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      setReplySent((s) => ({ ...s, [id]: true }));
      setReviews((prev) => prev.map((r) => r.id === id ? { ...r, reply: text } : r));
    } catch(e) { alert("Reply failed: " + e.message); }
    setReplying((s) => ({ ...s, [id]: false }));
  };

  const deleteReview = async (id) => {
    if (!confirm("Delete this review? This cannot be undone.")) return;
    setDeleting((s) => ({ ...s, [id]: true }));
    try {
      await fetch(SERVER_URL + "/admin/reviews/" + id, {
        method: "DELETE", headers: { "x-admin-secret": secret }
      });
      setReviews((prev) => prev.filter((r) => r.id !== id));
    } catch(e) { alert("Delete failed: " + e.message); }
    setDeleting((s) => ({ ...s, [id]: false }));
  };

  if (loading) return <p style={{ opacity:.6 }}>Loading reviews…</p>;

  return (
    <div>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:20 }}>
        <h3 style={{ fontFamily:"var(--disp)", fontSize:20, margin:0 }}>All Reviews ({reviews.length})</h3>
        <button className="btn btn--sm btn--ghost" onClick={load}>Refresh</button>
      </div>
      {err && <div style={{ background:"#ffe0e0", border:"2px solid #c00", borderRadius:8, padding:"10px 14px", marginBottom:14, color:"#900", fontSize:14 }}>{err}</div>}
      {reviews.length === 0 && <p style={{ opacity:.5 }}>No reviews yet.</p>}
      {reviews.map((r) => {
        let imgs = [];
        try { imgs = JSON.parse(r.images || "[]"); } catch {}
        const hasReply = r.reply;
        return (
          <div key={r.id} style={{ ...CARD_STYLE }}>
            {/* Header */}
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", flexWrap:"wrap", gap:8, marginBottom:10 }}>
              <div>
                <strong style={{ fontSize:16 }}>{r.product_name}</strong>
                <span style={{ marginLeft:10, fontSize:13, opacity:.55 }}>{r.order_ref}</span>
              </div>
              <button className="btn btn--sm" style={{ background:"#c00", borderColor:"#c00" }}
                disabled={deleting[r.id]}
                onClick={() => deleteReview(r.id)}>
                {deleting[r.id] ? "Deleting…" : "Delete"}
              </button>
            </div>

            {/* Reviewer info + rating */}
            <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:8, flexWrap:"wrap" }}>
              <StarRating value={r.rating} size={18} />
              <strong style={{ fontSize:14 }}>{r.customer_name}</strong>
              <span style={{ fontSize:12, opacity:.45 }}>{new Date(r.created_at).toLocaleDateString()}</span>
            </div>

            {r.body && <p style={{ margin:"0 0 10px", fontSize:14, lineHeight:1.6 }}>{r.body}</p>}

            {imgs.length > 0 && (
              <div style={{ display:"flex", gap:8, flexWrap:"wrap", marginBottom:10 }}>
                {imgs.map((src, j) => (
                  <img key={j} src={src} alt="" style={{ width:70, height:70, objectFit:"cover", borderRadius:8, border:"2px solid var(--ink)", cursor:"pointer" }}
                    onClick={() => window.open(src, "_blank")} />
                ))}
              </div>
            )}

            {/* Existing reply */}
            {hasReply && (
              <div style={{ background:"#f8f4ff", borderLeft:"4px solid #C9AAEB", borderRadius:"0 8px 8px 0", padding:"12px 16px", marginBottom:10 }}>
                <div style={{ fontSize:11, fontWeight:700, textTransform:"uppercase", opacity:.6, marginBottom:4 }}>Your reply</div>
                <p style={{ margin:0, fontSize:14 }}>{r.reply}</p>
              </div>
            )}

            {/* Reply box */}
            <div style={{ display:"flex", gap:8, alignItems:"flex-end", marginTop:10 }}>
              <textarea className="input" rows={2}
                placeholder={hasReply ? "Edit reply…" : "Write a reply…"}
                style={{ flex:1, resize:"vertical", fontSize:14 }}
                value={replyText[r.id] !== undefined ? replyText[r.id] : (r.reply || "")}
                onChange={(e) => setReplyText((s) => ({ ...s, [r.id]: e.target.value }))} />
              <button className="btn btn--sm"
                disabled={replying[r.id] || replySent[r.id]}
                style={replying[r.id] || replySent[r.id] ? { opacity:.65 } : null}
                onClick={() => sendReply(r.id)}>
                {replying[r.id] ? "Sending…" : replySent[r.id] ? "Sent! ✓" : hasReply ? "Update reply" : "Send reply"}
              </button>
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
  const [orders,          setOrders]          = usePState([]);
  const [hiddenOrders,    setHiddenOrders]    = usePState([]);
  const [deliveredOrders, setDeliveredOrders] = usePState([]);
  const [loading,  setLoading]  = usePState(false);
  const [err,      setErr]      = usePState("");
  const [tracking, setTracking] = usePState({});
  const [sending,  setSending]  = usePState({});
  const [sent,     setSent]     = usePState({});
  const [newCount, setNewCount] = usePState(0);

  const login = async () => {
    if (!password.trim()) { setErr("Enter your password."); return; }
    setErr("");
    try {
      const res = await fetch(SERVER_URL + "/orders", {
        headers: { "x-admin-secret": password }
      });
      if (res.status === 401) { setErr("Wrong password."); return; }
      if (res.status === 429) { setErr("Too many attempts — wait a few minutes."); return; }
      if (!res.ok) throw new Error("Server error");
      setSecret(password);
      setAuthed(true);
      fetchOrders(password);
    } catch(e) {
      setErr("Could not reach server. Try again.");
    }
  };

  const fetchOrders = async (pwd, silent) => {
    if (!silent) setLoading(true);
    setErr("");
    try {
      const hdrs = { "x-admin-secret": pwd || secret };
      const [main, hidden, delivered] = await Promise.all([
        fetch(SERVER_URL + "/orders", { headers: hdrs }).then((r) => r.json()),
        fetch(SERVER_URL + "/orders?hidden=true", { headers: hdrs }).then((r) => r.json()),
        fetch(SERVER_URL + "/orders?delivered=true", { headers: hdrs }).then((r) => r.json()),
      ]);
      if (main.error) throw new Error(main.error);
      setOrders((prev) => {
        if (prev.length && main.length > prev.length) {
          setNewCount(main.length - prev.length);
          try { new Audio("https://www.soundjay.com/buttons/sounds/button-09a.mp3").play(); } catch {}
        }
        return main;
      });
      setHiddenOrders(Array.isArray(hidden) ? hidden : []);
      setDeliveredOrders(Array.isArray(delivered) ? delivered : []);
    } catch (e) {
      setErr("Could not load orders: " + e.message);
    }
    if (!silent) setLoading(false);
  };

  usePEffect(() => {
    if (!authed) return;
    const id = setInterval(() => fetchOrders(secret, true), 30000);
    return () => clearInterval(id);
  }, [authed, secret]);

  const sendTracking = async (order) => {
    const key = order.order_no;
    const num = (tracking[key] || "").trim();
    if (!num) return;
    setSending((s) => ({ ...s, [key]: true }));
    setErr("");
    try {
      const res = await fetch(SERVER_URL + "/track", {
        method: "POST", headers: { "Content-Type": "application/json", "x-admin-secret": secret },
        body: JSON.stringify({ order_id: order.order_no, tracking_number: num })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      setSent((s) => ({ ...s, [key]: true }));
      setOrders((prev) => prev.map((o) => o.order_no === order.order_no ? { ...o, tracking_number: num, tracking_sent: true, status: "shipped" } : o));
    } catch (e) { setErr("Error: " + e.message); }
    setSending((s) => ({ ...s, [key]: false }));
  };

  const deliverOrder = async (order) => {
    const res = await fetch(SERVER_URL + "/admin/orders/" + order.order_no + "/deliver", {
      method: "POST", headers: { "x-admin-secret": secret }
    });
    if (res.ok) fetchOrders();
    else { const d = await res.json(); setErr("Error: " + (d.error || "Failed")); }
  };

  const hideOrder = async (order) => {
    await fetch(SERVER_URL + "/admin/orders/" + order.order_no, {
      method: "PUT", headers: { "Content-Type": "application/json", "x-admin-secret": secret },
      body: JSON.stringify({ hidden: !order.hidden })
    });
    fetchOrders();
  };

  const deleteOrder = async (order) => {
    if (!confirm(`Delete order ${order.order_ref || order.order_no}? This cannot be undone.`)) return;
    try {
      const res = await fetch(SERVER_URL + "/admin/orders/" + order.order_no, {
        method: "DELETE", headers: { "x-admin-secret": secret }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      fetchOrders();
    } catch(e) { setErr("Delete failed: " + e.message); }
  };

  const restoreOrder = async (order) => {
    await fetch(SERVER_URL + "/admin/orders/" + order.order_no, {
      method: "PUT", headers: { "Content-Type": "application/json", "x-admin-secret": secret },
      body: JSON.stringify({ deleted: false, hidden: false })
    });
    fetchOrders();
  };

  const updateOrder = (updated) => {
    setOrders((prev) => prev.map((o) => o.order_no === updated.order_no ? updated : o));
  };

  const orderCardProps = (order, extra) => ({
    order, secret, onUpdate: updateOrder,
    onHide: () => hideOrder(order),
    onDelete: () => deleteOrder(order),
    onDeliver: () => deliverOrder(order),
    tracking, setTracking, sending, sent,
    onSendTracking: sendTracking,
    ...extra
  });

  if (!authed) return (
    <div className="confirm-wrap" data-screen-label="Admin login">
      <div className="confirm" style={{ maxWidth: 380 }}>
        <CherryIcon size={36} />
        <h1 className="confirm-h" style={{ fontSize: 22 }}>Admin login</h1>
        <div className="field" style={{ width: "100%", marginBottom: 14 }}>
          <input className={"input" + (err ? " is-bad" : "")} type="password"
            placeholder="Password" value={password} autoComplete="off"
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") login(); }} />
          {err && <span className="field-err">{err}</span>}
        </div>
        <button className="btn btn--wide" onClick={login}>Enter</button>
        <button className="btn btn--ghost btn--sm" style={{ marginTop: 10 }} onClick={() => go("home")}>Back to shop</button>
      </div>
    </div>
  );

  const TABS = [
    ["orders",    "📦 Orders"],
    ["products",  "🛍️ Products"],
    ["reviews",   "⭐ Reviews"],
    ["delivered", "✅ Delivered"],
    ["hidden",    "👁️ Hidden"],
    ["deleted",   "🗑️ Deleted"],
  ];

  return (
    <div className="rail sec" data-screen-label="Admin">
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:20, flexWrap:"wrap", gap:12 }}>
        <h1 style={{ margin:0, fontFamily:"var(--disp)", fontSize:"clamp(24px,4vw,36px)" }}>Admin Dashboard</h1>
        <div style={{ display:"flex", gap:10, alignItems:"center" }}>
          <span style={{ fontSize:12, opacity:.5 }}>auto-refreshes every 30s</span>
          <button className="btn btn--sm" onClick={() => fetchOrders()}>Refresh now</button>
          <button className="btn btn--ghost btn--sm" onClick={() => go("home")}>Back to shop</button>
        </div>
      </div>

      <div style={{ display:"flex", gap:0, marginBottom:28, borderBottom:"3px solid var(--ink)", flexWrap:"wrap" }}>
        {TABS.map(([id, label]) => (
          <button key={id} onClick={() => setTab(id)} style={{
            padding:"10px 20px", fontFamily:"var(--font-ui)", fontWeight:700, fontSize:14,
            border:"none", borderBottom: tab===id ? "3px solid var(--acc2)" : "3px solid transparent",
            background:"none", cursor:"pointer", color: tab===id ? "var(--ink)" : "rgba(0,0,0,.45)",
            marginBottom:"-3px"
          }}>{label}</button>
        ))}
      </div>

      {tab === "products" && <ProductsTab secret={secret} />}

      {tab === "reviews" && <ReviewsTab secret={secret} />}

      {tab === "delivered" && (
        <div>
          <h3 style={{ fontFamily:"var(--disp)", fontSize:20, margin:"0 0 20px" }}>Delivered Orders</h3>
          {deliveredOrders.length === 0 && <p style={{ opacity:.5 }}>No delivered orders yet.</p>}
          {deliveredOrders.map((order) => (
            <OrderCard key={order.order_no} {...orderCardProps(order, { showDelivered: true })} />
          ))}
        </div>
      )}

      {tab === "hidden" && (
        <div>
          <h3 style={{ fontFamily:"var(--disp)", fontSize:20, margin:"0 0 20px" }}>Hidden Orders</h3>
          {hiddenOrders.length === 0 && <p style={{ opacity:.5 }}>No hidden orders.</p>}
          {hiddenOrders.map((order) => (
            <OrderCard key={order.order_no} {...orderCardProps(order)} />
          ))}
          <HiddenProductsTab secret={secret} />
        </div>
      )}

      {tab === "deleted" && (
        <div>
          <DeletedProductsTab secret={secret} />
        </div>
      )}

      {tab === "orders" && (
        <React.Fragment>
          {newCount > 0 && (
            <div onClick={() => setNewCount(0)} style={{
              background:"var(--acc2)", color:"white", borderRadius:10, padding:"12px 18px",
              marginBottom:16, fontWeight:700, fontSize:15, cursor:"pointer",
              display:"flex", alignItems:"center", justifyContent:"space-between"
            }}>
              <span>🛍️ {newCount} new order{newCount > 1 ? "s" : ""} just came in!</span>
              <span style={{ fontSize:12, opacity:.8 }}>click to dismiss</span>
            </div>
          )}
          {err && <div style={{ background:"#ffe0e0", border:"2px solid #c00", borderRadius:10, padding:"12px 16px", marginBottom:20, color:"#900" }}>{err}</div>}
          {loading && <p style={{ textAlign:"center", opacity:.6 }}>Loading orders...</p>}
          {!loading && orders.length === 0 && (
            <div style={{ textAlign:"center", opacity:.55, padding:"60px 0" }}>
              <CherryIcon size={40} />
              <p style={{ marginTop:14 }}>No orders yet — they'll show up here once Stripe payments come in.</p>
            </div>
          )}
          {orders.map((order) => (
            <OrderCard key={order.order_no} {...orderCardProps(order)} />
          ))}
        </React.Fragment>
      )}
    </div>
  );
}

/* ── Star rating component ── */
function StarRating({ value, onChange, size = 28 }) {
  const [hovered, setHovered] = usePState(0);
  return (
    <div style={{ display:"flex", gap:4 }}>
      {[1,2,3,4,5].map((n) => (
        <span key={n}
          onClick={() => onChange && onChange(n)}
          onMouseEnter={() => onChange && setHovered(n)}
          onMouseLeave={() => onChange && setHovered(0)}
          style={{ fontSize:size, cursor: onChange ? "pointer" : "default", color: n <= (hovered || value) ? "#f5a623" : "#ddd", lineHeight:1 }}>
          ★
        </span>
      ))}
    </div>
  );
}

/* ── Review page — customer lands here from email link ── */
function ReviewPage({ token, go }) {
  const [state, setState] = usePState("loading"); // loading | ready | submitted | error | already
  const [order, setOrder] = usePState(null);
  const [items, setItems]   = usePState([]);
  const [reviews, setReviews] = usePState({});
  const [submitting, setSubmitting] = usePState(false);
  const [promoCode,  setPromoCode]  = usePState(null);
  const SERVER = window.ADMIN_SERVER_URL || "https://sugarrushco.onrender.com";

  usePEffect(() => {
    fetch(SERVER + "/review/" + token)
      .then((r) => {
        if (r.status === 409) { setState("already"); return null; }
        if (!r.ok) { setState("error"); return null; }
        return r.json();
      })
      .then((data) => {
        if (!data) return;
        setOrder(data);
        let parsed = [];
        try { parsed = JSON.parse(data.items_json || "[]"); } catch {}
        // Fallback: if no items_json, build from items text string
        if (!parsed.length && data.items) {
          parsed = data.items.split(",").map((s, i) => ({
            id: "item-" + i,
            name: s.replace(/x\d+$/, "").trim()
          }));
        }
        setItems(parsed);
        const init = {};
        parsed.forEach((i) => { init[i.id] = { rating:5, body:"", images:[] }; });
        setReviews(init);
        setState("ready");
      })
      .catch(() => setState("error"));
  }, [token]);

  const addImage = (productId, files) => {
    Array.from(files).forEach((file) => {
      if (!file.type.startsWith("image/")) return;
      const reader = new FileReader();
      reader.onload = (e) => setReviews((r) => ({
        ...r, [productId]: { ...r[productId], images: [...(r[productId].images || []), e.target.result] }
      }));
      reader.readAsDataURL(file);
    });
  };

  const submit = async () => {
    const payload = items.map((i) => ({
      product_id:   i.id,
      product_name: i.name,
      rating:       reviews[i.id]?.rating || 5,
      body:         reviews[i.id]?.body || "",
      images:       reviews[i.id]?.images || []
    }));
    setSubmitting(true);
    try {
      const res = await fetch(SERVER + "/review", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, reviews: payload })
      });
      if (res.ok) {
        const d = await res.json();
        if (d.promoCode) setPromoCode(d.promoCode);
        setState("submitted");
      }
      else if (res.status === 409) setState("already");
      else { const d = await res.json(); alert("Submission failed: " + (d.error || "Please try again")); setSubmitting(false); return; }
    } catch { setState("error"); }
    setSubmitting(false);
  };

  if (state === "loading") return (
    <div className="confirm-wrap"><div className="confirm"><CherryIcon size={40} /><p style={{ marginTop:16 }}>Loading your review page…</p></div></div>
  );
  if (state === "already") return (
    <div className="confirm-wrap"><div className="confirm">
      <CherryIcon size={40} />
      <h1 className="confirm-h">Already reviewed!</h1>
      <p className="confirm-sub">You already left a review for this order. Thank you so much!</p>
      <button className="btn" onClick={() => go("shop")}>Back to shop</button>
    </div></div>
  );
  if (state === "error") return (
    <div className="confirm-wrap"><div className="confirm">
      <CherryIcon size={40} />
      <h1 className="confirm-h">Oops!</h1>
      <p className="confirm-sub">This review link is invalid or has expired. If you think this is a mistake, please contact us.</p>
      <button className="btn" onClick={() => go("home")}>Back home</button>
    </div></div>
  );
  if (state === "submitted") return (
    <div className="confirm-wrap"><div className="confirm">
      <img src="shop/assets/logo-footer.png" alt="Sugar Rush Co." className="confirm-logo" style={{ objectFit:"contain", marginBottom:0 }} />
      <h1 className="confirm-h">Thank you, {order?.customer_name?.split(" ")[0]}!!</h1>
      <p className="confirm-sub">Your review means the world to us. 🍒 It'll show up on the product page shortly.</p>
      {promoCode && (
        <div style={{ background:"#f8f4ff", border:"3px dashed #C9AAEB", borderRadius:12, padding:"16px 24px", margin:"16px 0", textAlign:"center" }}>
          <p style={{ margin:"0 0 6px", fontSize:13, opacity:.6, textTransform:"uppercase", letterSpacing:".06em" }}>Your 10% off coupon</p>
          <p style={{ margin:0, fontWeight:700, fontSize:26, letterSpacing:".1em", color:"#9B72D8" }}>{promoCode}</p>
          <p style={{ margin:"6px 0 0", fontSize:12, opacity:.5 }}>Also sent to your email · use at checkout</p>
        </div>
      )}
      <button className="btn" onClick={() => go("shop")}>Keep shopping</button>
    </div></div>
  );

  if (state === "ready" && items.length === 0) return (
    <div className="confirm-wrap"><div className="confirm">
      <CherryIcon size={40} />
      <h1 className="confirm-h">Hmm!</h1>
      <p className="confirm-sub">We couldn't find the products in your order. Please contact us and we'll sort it out!</p>
      <button className="btn" onClick={() => go("home")}>Back home</button>
    </div></div>
  );

  return (
    <div className="rail sec" data-screen-label="Leave a review">
      <SectionHead title="Leave a review" />
      <p style={{ opacity:.6, marginBottom:28 }}>Hi {order?.customer_name?.split(" ")[0]}! How did you like your order? ✨</p>
      {items.map((item) => (
        <div key={item.id} style={{ border:"3px solid var(--ink)", borderRadius:16, padding:"24px 28px", marginBottom:20, background:"var(--tld-white)", boxShadow:"var(--tld-shadow)" }}>
          <h3 style={{ fontFamily:"var(--disp)", fontSize:20, margin:"0 0 12px" }}>{item.name}</h3>
          <div style={{ marginBottom:12 }}>
            <label style={{ fontSize:12, fontWeight:700, opacity:.6, textTransform:"uppercase", display:"block", marginBottom:6 }}>Your rating</label>
            <StarRating value={reviews[item.id]?.rating || 5} onChange={(v) => setReviews((r) => ({ ...r, [item.id]: { ...r[item.id], rating:v } }))} />
          </div>
          <div style={{ marginBottom:12 }}>
            <label style={{ fontSize:12, fontWeight:700, opacity:.6, textTransform:"uppercase", display:"block", marginBottom:6 }}>Your review</label>
            <textarea className="input" rows={4} placeholder="Tell others what you loved about it..."
              value={reviews[item.id]?.body || ""}
              onChange={(e) => setReviews((r) => ({ ...r, [item.id]: { ...r[item.id], body: e.target.value } }))}
              style={{ width:"100%", resize:"vertical" }} />
          </div>
          <div>
            <label style={{ fontSize:12, fontWeight:700, opacity:.6, textTransform:"uppercase", display:"block", marginBottom:6 }}>Photos (optional)</label>
            <label style={{ display:"inline-block", border:"2px dashed var(--ink)", borderRadius:8, padding:"8px 16px", cursor:"pointer", fontSize:13, opacity:.7 }}>
              + Add photos
              <input type="file" accept="image/*" multiple style={{ display:"none" }} onChange={(e) => addImage(item.id, e.target.files)} />
            </label>
            {(reviews[item.id]?.images || []).length > 0 && (
              <div style={{ display:"flex", gap:8, flexWrap:"wrap", marginTop:10 }}>
                {(reviews[item.id]?.images || []).map((src, i) => (
                  <div key={i} style={{ position:"relative" }}>
                    <img src={src} alt="" style={{ width:70, height:70, objectFit:"cover", borderRadius:8, border:"2px solid var(--ink)" }} />
                    <button onClick={() => setReviews((r) => ({ ...r, [item.id]: { ...r[item.id], images: r[item.id].images.filter((_,j) => j!==i) } }))}
                      style={{ position:"absolute", top:2, right:2, background:"#c00", color:"white", border:"none", borderRadius:"50%", width:18, height:18, fontSize:12, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center" }}>×</button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ))}
      <button className="btn btn--wide" onClick={submit} disabled={submitting} style={submitting ? { opacity:.65 } : null}>
        {submitting ? "Submitting…" : "Submit my review"}
      </button>
    </div>
  );
}

/* ── Product reviews display ── */
function ProductReviews({ productId }) {
  const [reviews, setReviews] = usePState([]);
  const [loading, setLoading] = usePState(true);
  const SERVER = window.ADMIN_SERVER_URL || "https://sugarrushco.onrender.com";

  usePEffect(() => {
    fetch(SERVER + "/reviews/" + productId)
      .then((r) => r.json())
      .then((data) => { setReviews(Array.isArray(data) ? data : []); setLoading(false); })
      .catch(() => setLoading(false));
  }, [productId]);

  if (loading) return null;
  if (!reviews.length) return (
    <div style={{ marginTop:40, paddingTop:28, borderTop:"2px solid var(--ink)" }}>
      <h3 style={{ fontFamily:"var(--disp)", fontSize:22, margin:"0 0 8px" }}>Reviews</h3>
      <p style={{ opacity:.5, fontSize:14 }}>No reviews yet — be the first!</p>
    </div>
  );

  const avg = (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1);

  return (
    <div style={{ marginTop:40, paddingTop:28, borderTop:"2px solid var(--ink)" }}>
      <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:24, flexWrap:"wrap" }}>
        <h3 style={{ fontFamily:"var(--disp)", fontSize:22, margin:0 }}>Reviews</h3>
        <div style={{ display:"flex", alignItems:"center", gap:6 }}>
          <StarRating value={Math.round(avg)} size={20} />
          <span style={{ fontWeight:700, fontSize:15 }}>{avg}</span>
          <span style={{ opacity:.5, fontSize:13 }}>({reviews.length} review{reviews.length !== 1 ? "s" : ""})</span>
        </div>
      </div>
      {reviews.map((r, i) => {
        let imgs = [];
        try { imgs = JSON.parse(r.images || "[]"); } catch {}
        return (
          <div key={i} style={{ borderBottom: i < reviews.length-1 ? "1px solid #eee" : "none", paddingBottom:20, marginBottom:20 }}>
            <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:6, flexWrap:"wrap" }}>
              <StarRating value={r.rating} size={18} />
              <strong style={{ fontSize:14 }}>{r.customer_name}</strong>
              <span style={{ fontSize:12, opacity:.45 }}>{new Date(r.created_at).toLocaleDateString()}</span>
            </div>
            {r.body && <p style={{ margin:"0 0 10px", fontSize:14, lineHeight:1.6 }}>{r.body}</p>}
            {imgs.length > 0 && (
              <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
                {imgs.map((src, j) => (
                  <img key={j} src={src} alt="" style={{ width:80, height:80, objectFit:"cover", borderRadius:8, border:"2px solid var(--ink)", cursor:"pointer" }}
                    onClick={() => window.open(src, "_blank")} />
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

Object.assign(window, { ShopPage, ProductPage, CartDrawer, CheckoutPage, ConfirmPage, ContactPage, TermsPage, RefundPage, AdminPage, ReviewPage });




