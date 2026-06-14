// Sugar Rush Co. -- app shell
const { useState: useAState, useEffect: useAEffect } = React;

// Tax rate -- Florida state + average county = 7%
const TAX_RATE = 0.07;

// Admin password -- must match ADMIN_SECRET in Render environment variables
const ADMIN_PASSWORD = "StacyBeShein111779!";

Object.assign(window, { TAX_RATE, ADMIN_PASSWORD });

// Config -- fill these in when ready
// 1. Stripe Payment Link from stripe.com/dashboard
const STRIPE_PAYMENT_LINK = "https://buy.stripe.com/9B600laXY7E2exE5Ru3ZK00";
// 2. EmailJS from emailjs.com
const EMAILJS_SERVICE_ID  = "YOUR_SERVICE_ID";
const EMAILJS_TEMPLATE_ID = "YOUR_TEMPLATE_ID";
const EMAILJS_PUBLIC_KEY  = "YOUR_PUBLIC_KEY";
// 3. Your contact email
const CONTACT_EMAIL = "info@sugarrushco.shop";
// 4. Your Render server URL (fill in after deploying to Render)
const ADMIN_SERVER_URL = "https://sugarrushco.onrender.com";
// 5. Social handles (leave blank to hide)
const SOCIAL = {
  instagram: "sugarrushco",
  tiktok:    "sugarrushco",
  pinterest: ""
};

Object.assign(window, {
  STRIPE_PAYMENT_LINK,
  EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, EMAILJS_PUBLIC_KEY,
  CONTACT_EMAIL,
  ADMIN_SERVER_URL,
  SOCIAL
});

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "shopName": "Sugar Rush Co.",
  "homeVariant": "Storefront",
  "accent": ["#C9AAEB", "#9B72D8", "#F0E4FF"],
  "displayFont": "Poltawski",
  "awning": "Accent stripes",
  "tone": "Sweet",
  "checker": true
}/*EDITMODE-END*/;

const ACCENT_OPTIONS = [
  ["#C9AAEB", "#9B72D8", "#F0E4FF"],
  ["#9B72D8", "#C9AAEB", "#F0E4FF"],
  ["#F0E4FF", "#C9AAEB", "#9B72D8"]
];

const ROUTE_KEY = "sugarrush.route";
const CART_KEY  = "sugarrush.cart";

function loadJSON(key, fallback) {
  try { const v = JSON.parse(localStorage.getItem(key)); return v == null ? fallback : v; }
  catch (e) { return fallback; }
}

function App() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const [productsLoaded, setProductsLoaded] = useAState(false);

  // Load products from server on startup, fall back to hardcoded data.js
  useAEffect(() => {
    fetch((window.ADMIN_SERVER_URL || "https://sugarrushco.onrender.com") + "/products")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          // Convert server products to match SHOP_DATA format
          SHOP_DATA.products = data.map((p) => ({
            id:    String(p.id),
            cat:   p.cat,
            name:  p.name,
            price: Number(p.price),
            stock: p.stock || 0,
            blurb: p.blurb || "",
            notes: (p.notes || "").split(",").map((n) => n.trim()).filter(Boolean),
            image_url: p.image_url || ""
          }));
          // Update featured to use first 4 product ids
          SHOP_DATA.featured = SHOP_DATA.products.slice(0, 4).map((p) => p.id);
        }
        setProductsLoaded(true);
      })
      .catch(() => setProductsLoaded(true)); // on error use hardcoded fallback
  }, []);

  const initialRoute = React.useMemo(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("payment") === "success") {
      window.history.replaceState({}, "", window.location.pathname);
      return { name: "confirm" };
    }
    if (params.get("admin") === "1") {
      window.history.replaceState({}, "", window.location.pathname);
      return { name: "admin" };
    }
    return loadJSON(ROUTE_KEY, { name: "home" });
  }, []);

  const [route, setRoute] = useAState(initialRoute);
  const [cart, setCart]   = useAState(() => loadJSON(CART_KEY, []));
  const [cartOpen, setCartOpen] = useAState(false);

  useAEffect(() => { localStorage.setItem(ROUTE_KEY, JSON.stringify(route)); }, [route]);
  useAEffect(() => { localStorage.setItem(CART_KEY,  JSON.stringify(cart));  }, [cart]);

  const go = (name, params) => {
    setRoute(Object.assign({ name }, params || {}));
    setCartOpen(false);
    window.scrollTo({ top: 0 });
  };

  const addToCart = (id, qty) => {
    const n = qty || 1;
    setCart((c) => {
      const hit = c.find((l) => l.id === id);
      if (hit) return c.map((l) => (l.id === id ? { ...l, qty: l.qty + n } : l));
      return [...c, { id, qty: n }];
    });
    setCartOpen(true);
  };
  const setQty    = (id, qty) => setCart((c) => qty <= 0 ? c.filter((l) => l.id !== id) : c.map((l) => l.id === id ? { ...l, qty } : l));
  const removeLine = (id) => setCart((c) => c.filter((l) => l.id !== id));

  const cartCount = cart.reduce((s, l) => s + l.qty, 0);
  const subtotal  = cart.reduce((s, l) => { const p = productById(l.id); return s + (p ? p.price * l.qty : 0); }, 0);

  const tone      = SHOP_DATA.tones[t.tone] || SHOP_DATA.tones.Sweet;
  const themeVars = {
    "--acc":  t.accent[0], "--acc2": t.accent[1], "--acc3": t.accent[2],
    "--disp": t.displayFont === "Metal" ? "'Metal','Poltawski Nowy',serif" : "'Poltawski Nowy','Times New Roman',serif"
  };

  let page = null;
  if      (route.name === "shop")     page = <ShopPage route={route} go={go} onAdd={addToCart} />;
  else if (route.name === "product")  page = <ProductPage key={route.id} route={route} go={go} onAdd={addToCart} />;
  else if (route.name === "checkout") page = <CheckoutPage cart={cart} subtotal={subtotal} go={go} onPlaced={() => { setCart([]); go("confirm"); }} />;
  else if (route.name === "confirm")  page = <ConfirmPage go={go} />;
  else if (route.name === "contact")  page = <ContactPage go={go} />;
  else if (route.name === "terms")    page = <TermsPage go={go} />;
  else if (route.name === "refunds")  page = <RefundPage go={go} />;
  else if (route.name === "admin")   page = <AdminPage go={go} />;
  else page = <HomePage t={t} tone={tone} go={go} onAdd={addToCart} />;

  return (
    <div className={"shop-root" + (route.name === "contact" ? " is-contact" : "")} style={themeVars}>
      <Header name={t.shopName} route={route} go={go} cartCount={cartCount} openCart={() => setCartOpen(true)} />
      <main className="page" key={route.name + (route.id || "") + (route.cat || "")}>{page}</main>
      <div className="scallop scallop--up" style={{ "--sc": route.name === "contact" ? "#000" : "var(--acc)" }}></div>
      <Footer name={t.shopName} go={go} />
      <CartDrawer open={cartOpen} cart={cart} setQty={setQty} remove={removeLine} subtotal={subtotal}
        onClose={() => setCartOpen(false)} onCheckout={() => go("checkout")} />
      <TweaksPanel>
        <TweakSection label="Brand" />
        <TweakText  label="Shop name"    value={t.shopName}     onChange={(v) => setTweak("shopName", v)} />
        <TweakRadio label="Display font" value={t.displayFont}  options={["Poltawski","Metal"]}                         onChange={(v) => setTweak("displayFont", v)} />
        <TweakColor label="Palette"      value={t.accent}       options={ACCENT_OPTIONS}                                onChange={(v) => setTweak("accent", v)} />
        <TweakSection label="Home page" />
        <TweakRadio  label="Layout"      value={t.homeVariant}  options={["Storefront","Circus","Coquette"]}            onChange={(v) => setTweak("homeVariant", v)} />
        <TweakSelect label="Awning"      value={t.awning}       options={["Accent stripes","Sky stripes","Ink & lace"]} onChange={(v) => setTweak("awning", v)} />
        <TweakRadio  label="Copy tone"   value={t.tone}         options={["Sweet","Elegant","Sparkle"]}                 onChange={(v) => setTweak("tone", v)} />
        <TweakToggle label="Checkerboard accents" value={t.checker} onChange={(v) => setTweak("checker", v)} />
      </TweaksPanel>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);