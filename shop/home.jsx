// Sugar Rush Co. -- home page: 3 variants + shared sections

function HomeStorefront({ t, tone, go, onAdd }) {
  const featured = SHOP_DATA.featured.slice(0, 3).map(productById);
  return (
    <div data-screen-label="Home - Storefront">
      <section className="sec center" style={{ paddingBottom: 70 }}>
        <div className="rail">
          <div className="eyebrow">{tone.eyebrow}</div>
          <h1 className="hero-title">{tone.title}</h1>
          <p className="hero-sub">{tone.sub}</p>
          <Awning awning={t.awning} name={t.shopName} />
          <div className="window-card">
            <div className="window-row">
              {featured.map((p, i) => (
                <button key={p.id} className="window-item"
                  style={{ background: "none", border: "none", padding: 0, cursor: "pointer", color: "var(--ink)" }}
                  onClick={() => go("product", { id: p.id })}>
                  <ProductImage product={p} height={170} radius={12} />
                  <span className="window-item-name">{p.name} - ${p.price}</span>
                </button>
              ))}
            </div>
            <hr className="window-shelf" />
            <p className="window-caption">{tone.window} - tap anything to come inside</p>
          </div>
        </div>
      </section>
    </div>
  );
}

function HomeCircus({ t, tone, go, onAdd }) {
  const cats = SHOP_DATA.categories.map((c) => c.label);
  return (
    <div data-screen-label="Home - Circus">
      <section className="circus-hero">
        <div className="scallop scallop--big circus-valance"></div>
        <div className="dots"></div>
        <div className="rail center" style={{ paddingTop: 46 }}>
          <span className="ticket">Admit one - {t.shopName}</span>
          <h1 className="hero-title" style={{ fontSize: "clamp(46px, 7.4vw, 80px)" }}>{tone.title}</h1>
          <p className="hero-sub">{tone.sub}</p>
          <div className="btn-row">
            <button className="btn" onClick={() => go("shop")}>{tone.cta}</button>
          </div>
        </div>
        <div className="marquee-strip">
          {cats.map((label, i) => (
            <React.Fragment key={label}>
              {i > 0 && <CherryIcon size={16} />}
              <span>{label}</span>
            </React.Fragment>
          ))}
        </div>
      </section>
    </div>
  );
}

function HomeCoquette({ t, tone, go, onAdd }) {
  return (
    <div data-screen-label="Home - Coquette">
      <section className="coq-hero sec" style={{ padding: "76px 24px" }}>
        <div className="coq-frame">
          <img className="coq-flower coq-flower--tl" src="shop/assets/contactflower1.png" alt="" />
          <img className="coq-flower coq-flower--br" src="shop/assets/contactflower2.png" alt="" />
          <div className="coq-crest"><CherryIcon size={44} /></div>
          <div className="coq-est">est. {t.shopName} 2026</div>
          <h1 className="coq-title">{tone.title}</h1>
          <div className="coq-motto">
            <span className="tld-wc-rule"></span>
            <span>{tone.eyebrow.replace(/!/g, "").trim()}</span>
            <span className="tld-wc-rule"></span>
          </div>
          <p className="hero-sub">{tone.sub}</p>
          <div className="btn-row">
            <button className="btn" onClick={() => go("shop")}>{tone.cta}</button>
          </div>
        </div>
      </section>
    </div>
  );
}

function HomePage(props) {
  const v = props.t.homeVariant;
  if (v === "Circus")   return <HomeCircus   {...props} />;
  if (v === "Coquette") return <HomeCoquette {...props} />;
  return <HomeStorefront {...props} />;
}

Object.assign(window, { HomePage, HomeStorefront, HomeCircus, HomeCoquette });