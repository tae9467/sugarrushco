// Sugar Rush Co. -- shared UI: icons, header, footer, cards, awning, bands
const { useState, useEffect, useMemo } = React;

/* -- Social icons -- */
function InstagramIcon({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="2" y="2" width="20" height="20" rx="5"/>
      <circle cx="12" cy="12" r="4.5"/>
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/>
    </svg>
  );
}
function TikTokIcon({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M19.6 8.6a5.8 5.8 0 0 1-5.8-5.8V2h-3v12.8a2.6 2.6 0 1 1-3.7-2.4V9.2a6 6 0 1 0 6.7 5.9V9.6a9.1 9.1 0 0 0 5.8 2V8.6h-.1Z" opacity=".9"/>
    </svg>
  );
}
function PinterestIcon({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 2C6.477 2 2 6.477 2 12c0 4.236 2.636 7.855 6.356 9.312-.088-.791-.167-2.005.035-2.868.181-.78 1.172-4.97 1.172-4.97s-.299-.598-.299-1.482c0-1.388.806-2.428 1.808-2.428.853 0 1.267.641 1.267 1.408 0 .858-.546 2.141-.828 3.33-.236.995.499 1.806 1.476 1.806 1.771 0 3.135-1.867 3.135-4.561 0-2.385-1.715-4.052-4.163-4.052-2.837 0-4.502 2.127-4.502 4.326 0 .856.33 1.775.741 2.276a.3.3 0 0 1 .069.285c-.076.312-.244.995-.277 1.134-.044.183-.146.222-.337.134-1.249-.581-2.03-2.407-2.03-3.874 0-3.154 2.292-6.052 6.608-6.052 3.469 0 6.165 2.473 6.165 5.776 0 3.447-2.173 6.22-5.19 6.22-1.013 0-1.966-.527-2.292-1.148l-.623 2.378c-.226.869-.835 1.958-1.244 2.621.937.29 1.931.445 2.962.445 5.522 0 10-4.478 10-10S17.522 2 12 2Z"/>
    </svg>
  );
}

/* -- Icons -- */
function I({ children, size = 22 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {children}
    </svg>
  );
}
function CherryIcon({ size = 24 }) {
  return (
    <I size={size}>
      <circle cx="8" cy="16.5" r="4" />
      <circle cx="16.8" cy="15" r="3.5" />
      <path d="M8 12.5 C8 8 10.5 5 14.5 3.2" />
      <path d="M16.8 11.5 C16.2 7.6 15.2 5 14.5 3.2" />
      <path d="M14.5 3.2 C16.6 2.1 19.2 2.9 20.2 4.6 C18.1 5.7 15.8 5.1 14.5 3.2 Z" />
    </I>
  );
}
function BagIcon({ size = 20 }) {
  return (
    <I size={size}>
      <path d="M5.5 8 H18.5 L17.4 21 H6.6 L5.5 8 Z" />
      <path d="M9 8 V7 a3 3 0 0 1 6 0 V8" />
    </I>
  );
}
function XIcon({ size = 16 }) {
  return <I size={size}><path d="M6 6 L18 18 M18 6 L6 18" /></I>;
}
function CatIcon({ kind, size = 20 }) {
  if (kind === "gloss") return (
    <I size={size}>
      <rect x="9" y="11" width="6" height="10" rx="2" />
      <rect x="10.2" y="3" width="3.6" height="6" rx="1.4" />
      <path d="M10.2 9 H13.8" />
    </I>
  );
  if (kind === "candle") return (
    <I size={size}>
      <rect x="8" y="11" width="8" height="10" rx="2" />
      <path d="M12 11 V9" />
      <path d="M12 3 C13.8 5 13.8 6.8 12 8 C10.2 6.8 10.2 5 12 3 Z" />
    </I>
  );
  if (kind === "squish") return (
    <I size={size}>
      <circle cx="12" cy="13.5" r="7" />
      <circle cx="6.5" cy="6.5" r="2.4" />
      <circle cx="17.5" cy="6.5" r="2.4" />
      <path d="M9.5 12.5 h.01 M14.5 12.5 h.01" strokeWidth="2.4" />
      <path d="M10.5 16 C11.3 16.8 12.7 16.8 13.5 16" />
    </I>
  );
  if (kind === "jar") return (
    <I size={size}>
      <rect x="6" y="9" width="12" height="12" rx="3" />
      <rect x="7.5" y="4" width="9" height="3.6" rx="1.6" />
      <path d="M9 14 C10 13 11 15 12 14 C13 13 14 15 15 14" />
    </I>
  );
  if (kind === "perfume") return (
    <I size={size}>
      <circle cx="12" cy="15" r="5.8" />
      <rect x="10.4" y="6" width="3.2" height="3.2" />
      <rect x="9.4" y="2.4" width="5.2" height="3.6" rx="1.4" />
      <path d="M17.5 4 h2 M17.5 6.4 l1.6 1" />
    </I>
  );
  return <CherryIcon size={size} />;
}

/* -- Helpers -- */
function catById(id) { return SHOP_DATA.categories.find((c) => c.id === id); }
function productById(id) { return SHOP_DATA.products.find((p) => p.id === id); }
const THUMB_BG = { lipgloss: "var(--acc)", candles: "var(--acc2)", squishies: "var(--acc3)", "body-butter": "var(--acc2)", perfume: "var(--acc)" };

/* -- Product image placeholder -- */
const CAT_GRADIENTS = {
  lipgloss:      "linear-gradient(145deg, #E8D5FF 0%, #C9AAEB 100%)",
  candles:       "linear-gradient(145deg, #FFD6A5 0%, #FFAB6B 100%)",
  squishies:     "linear-gradient(145deg, #DEC8F5 0%, #C29EE8 100%)",
  "body-butter": "linear-gradient(145deg, #F0E4FF 0%, #C9AAEB 100%)",
  perfume:       "linear-gradient(145deg, #E8C8F5 0%, #C89AE8 100%)"
};
function ProductImage({ product, height = 200, radius = 14 }) {
  const bg = CAT_GRADIENTS[product.cat] || CAT_GRADIENTS.lipgloss;
  return (
    <div className="pcard-img" style={{
      background: bg, height: height, borderRadius: radius,
      display: "flex", alignItems: "center", justifyContent: "center",
      color: "rgba(255,255,255,0.85)"
    }}>
      <CatIcon kind={catById(product.cat).icon} size={52} />
    </div>
  );
}

/* -- Awning -- */
const AWNINGS = {
  "Accent stripes": { a: "var(--acc)", b: "#FFFFFF", ink: false },
  "Sky stripes":    { a: "var(--acc3)", b: "#FFFFFF", ink: false },
  "Ink & lace":     { a: "var(--tld-ink)", b: "var(--tld-ink)", ink: true }
};
function Awning({ awning, name }) {
  const cfg = AWNINGS[awning] || AWNINGS["Accent stripes"];
  return (
    <div className={"awning" + (cfg.ink ? " awning--ink" : "")} style={{ "--awnA": cfg.a, "--awnB": cfg.b }}>
      <div className="awning-canopy">
        <div className="awning-sign awning-sign--logo">
          <img src="shop/assets/logo-header.png" alt={name} className="awning-logo-img" />
        </div>
      </div>
      <div className="scallop awning-scallop"></div>
    </div>
  );
}

/* -- Header -- */
function Header({ name, route, go, cartCount, openCart }) {
  const links = [["home", "Home"], ["shop", "Shop"], ["contact", "Contact"]];
  const [menuOpen, setMenuOpen] = useState(false);
  const close = () => setMenuOpen(false);
  return (
    <header className="hdr">
      <div className="hdr-bar">
        <div className="hdr-in">
          <button className="logo" onClick={() => { go("home"); close(); }} aria-label="Go home">
            <img src="shop/assets/logo-header.png" alt={name} className="logo-img" />
          </button>
          <nav className={"hdr-nav" + (menuOpen ? " hdr-nav--open" : "")} aria-label="Main">
            {links.map(([id, label]) => (
              <button key={id} className={"hdr-link" + (route.name === id ? " is-on" : "")}
                onClick={() => { go(id); close(); }}>
                {label}
              </button>
            ))}
          </nav>
          <button className="bag" onClick={openCart} aria-label="Open cart">
            <BagIcon />
            {cartCount > 0 && <span className="bag-n">{cartCount}</span>}
          </button>
          <button className="hdr-burger" onClick={() => setMenuOpen((o) => !o)}
            aria-label="Toggle menu" aria-expanded={menuOpen}>
            <span></span><span></span><span></span>
          </button>
        </div>
      </div>
      <div className="scallop hdr-scallop"></div>
    </header>
  );
}

/* -- Footer -- */
function Footer({ name, go }) {
  return (
    <footer className="ftr">

      {/* logo centred at top */}
      <div className="ftr-logo-row">
        <button className="ftr-logo-btn" onClick={() => go("home")}>
          <img src="shop/assets/logo-footer.png" alt={name} className="logo-img logo-img--ftr" />
        </button>
        <p className="ftr-blurb">Art, glosses, slimes, squishies, body butter &amp; perfume - all wrapped with love.</p>
      </div>

      {/* divider matching header border */}
      <div className="ftr-divider"></div>

      {/* columns */}
      <div className="ftr-in">
        <div>
          <h4 className="ftr-h">The goods</h4>
          <div className="ftr-links">
            {SHOP_DATA.categories.map((c) => (
              <button key={c.id} onClick={() => go("shop", { cat: c.id })}>{c.label}</button>
            ))}
          </div>
        </div>
        <div>
          <h4 className="ftr-h">Explore</h4>
          <div className="ftr-links">
            <button onClick={() => go("shop")}>Shop everything</button>
            <button onClick={() => go("contact")}>Contact us</button>
          </div>
        </div>
        <div>
          <h4 className="ftr-h">Follow us</h4>
          <div className="ftr-social-col">
            {window.SOCIAL && window.SOCIAL.instagram && (
              <a href={"https://instagram.com/" + window.SOCIAL.instagram} target="_blank" rel="noopener" className="ftr-social-link">
                <InstagramIcon size={18} /> Instagram
              </a>
            )}
            {window.SOCIAL && window.SOCIAL.tiktok && (
              <a href={"https://tiktok.com/@" + window.SOCIAL.tiktok} target="_blank" rel="noopener" className="ftr-social-link">
                <TikTokIcon size={18} /> TikTok
              </a>
            )}
            {window.SOCIAL && window.SOCIAL.pinterest && (
              <a href={"https://pinterest.com/" + window.SOCIAL.pinterest} target="_blank" rel="noopener" className="ftr-social-link">
                <PinterestIcon size={18} /> Pinterest
              </a>
            )}
          </div>
        </div>
      </div>

      {/* bottom bar */}
      <div className="ftr-bottom">
        <div className="ftr-bottom-in">
          <span>THINK BUDGET CO, LLC - est. 2026</span>
          <span className="ftr-legal-links">
            <span className="ftr-legal-btn" onClick={() => go("terms")} role="button" tabIndex={0}>Terms of Service</span>
            <span className="ftr-legal-sep">|</span>
            <span className="ftr-legal-btn" onClick={() => go("refunds")} role="button" tabIndex={0}>Refund Policy</span>
          </span>
          <span>made with love &amp; a whole lotta glitter</span>
          <span className="ftr-admin-link" onClick={() => go("admin")} role="button" tabIndex={0}>Admin</span>
        </div>
      </div>
    </footer>
  );
}

/* -- Stock helper: reads from localStorage overrides, falls back to data.js -- */
function getStock(productId) {
  try {
    const overrides = JSON.parse(localStorage.getItem("sugarrush.inventory") || "{}");
    const base = SHOP_DATA.products.find((p) => p.id === productId);
    return overrides[productId] !== undefined ? overrides[productId] : (base ? base.stock : 0);
  } catch { return 0; }
}

/* -- Product card -- */
function ProductCard({ p, go, onAdd, showBlurb }) {
  const stock = getStock(p.id);
  const outOfStock = stock === 0;
  const lowStock = stock > 0 && stock <= 3;

  return (
    <article className={"pcard" + (outOfStock ? " pcard--oos" : "")} onClick={() => !outOfStock && go("product", { id: p.id })}>
      <div className="pcard-img-wrap">
        <ProductImage product={p} />
        {outOfStock && <div className="oos-badge">Out of Stock</div>}
        {lowStock && <div className="low-badge">Only {stock} left!</div>}
      </div>
      <div className="pcard-body">
        <div className="pcard-meta">{catById(p.cat).label} - ${p.price}</div>
        <h3 className="pcard-name">{p.name}</h3>
        {showBlurb && <p className="pcard-blurb">{p.blurb}</p>}
        <div className="pcard-foot">
          <button className="btn btn--sm btn--ghost"
            onClick={(e) => { e.stopPropagation(); go("product", { id: p.id }); }}
            disabled={outOfStock}>
            View product
          </button>
          {!outOfStock && (
            <button className="btn btn--sm"
              onClick={(e) => { e.stopPropagation(); onAdd(p.id); }}>
              Add to cart
            </button>
          )}
        </div>
      </div>
    </article>
  );
}

/* -- Section head -- */
function SectionHead({ title }) {
  return (
    <div className="sec-head">
      <h2 className="sec-title">{title}</h2>
      <div className="sec-rule"></div>
    </div>
  );
}

/* -- Reviews -- */
function ReviewStrip() {
  return (
    <div className="rev-grid">
      {SHOP_DATA.reviews.map((r, i) => (
        <figure key={i} className="rev" style={{ margin: 0 }}>
          <div className="rev-quote">{r.q}</div>
            <div className="rev-stars">&#9733;&#9733;&#9733;&#9733;&#9733;</div>
          <figcaption>
            <div className="rev-by">- {r.by}</div>
            <div className="rev-bought">bought: {r.bought}</div>
          </figcaption>
        </figure>
      ))}
    </div>
  );
}

/* -- Sweetlist signup -- */
function Sweetlist({ tone }) {
  const [email, setEmail] = useState("");
  const [joined, setJoined] = useState(false);
  const join = () => { if (email.trim()) setJoined(true); };
  return (
    <section className="sweetlist sec">
      <div className="rail">
        <div className="sweetlist-card">
          <h2 className="sweetlist-title">{tone.sweetTitle}</h2>
          <p className="sweetlist-sub">{tone.sweetSub}</p>
          {joined ? (
            <div className="sweetlist-ok">You are on the list - sweet! Keep an eye on your inbox.</div>
          ) : (
            <div className="sweetlist-row">
              <input className="input" type="email" placeholder="your@email.com" value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") join(); }} />
              <button className="btn" onClick={join}>Sign me up</button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

Object.assign(window, {
  I, CherryIcon, BagIcon, XIcon, CatIcon, InstagramIcon, TikTokIcon, PinterestIcon,
  catById, productById, THUMB_BG, CAT_GRADIENTS, AWNINGS, getStock,
  ProductImage, Awning, Header, Footer, ProductCard, SectionHead, ReviewStrip, Sweetlist
});

