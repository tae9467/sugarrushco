// Sugar Rush Co. -- shop data
window.SHOP_DATA = {
  categories: [
    { id: "lipgloss",     label: "Lip Gloss",    icon: "gloss"   },
    { id: "candles",      label: "Candles",       icon: "candle"  },
    { id: "squishies",    label: "Squishies",     icon: "squish"  },
    { id: "body-butter",  label: "Body Butter",   icon: "jar"     },
    { id: "perfume",      label: "Perfume",       icon: "perfume" }
  ],

  products: [
    { id: "gloss-strawberry", cat: "lipgloss", name: "Strawberry Shortcake Gloss", price: 8,
      blurb: "High-shine, non-sticky, and it smells exactly like the dessert. Dangerous.",
      notes: ["strawberry", "whipped cream", "vanilla sponge"],
      pair: ["butter-strawberry", "squish-shortcake"] },
    { id: "gloss-cherry", cat: "lipgloss", name: "Cherry Cola Gloss", price: 8,
      blurb: "A juicy red tint with a fizzy cherry-cola scent. Pop the cap, you will see.",
      notes: ["black cherry", "cola fizz", "vanilla"],
      pair: ["perfume-cherry", "candle-cherries"] },
    { id: "gloss-cotton", cat: "lipgloss", name: "Cotton Candy Cloud Gloss", price: 9,
      blurb: "Sheer pink shimmer that smells like the fairground at 8pm.",
      notes: ["spun sugar", "marshmallow", "a tiny bit of sparkle"],
      pair: ["perfume-cotton", "candle-carnival"] },
    { id: "candle-bigtop", cat: "candles", name: "Big Top Birthday Candle", price: 14,
      blurb: "Funfetti cake, buttercream, and a wish. Burns about 40 cozy hours.",
      notes: ["birthday cake", "buttercream", "sprinkles", "40hr burn"],
      pair: ["squish-cherry", "butter-vanilla"] },
    { id: "candle-cherries", cat: "candles", name: "Cherries Jubilee Candle", price: 14,
      blurb: "Dark cherries over vanilla ice cream, but make it a candle.",
      notes: ["black cherry", "caramelized sugar", "vanilla bean"],
      pair: ["gloss-cherry", "perfume-cherry"] },
    { id: "candle-carnival", cat: "candles", name: "Cotton Candy Carnival Candle", price: 12,
      blurb: "One match and your whole room is a pastel midway.",
      notes: ["pink sugar", "raspberry", "warm vanilla"],
      pair: ["gloss-cotton", "perfume-cotton"] },
    { id: "squish-shortcake", cat: "squishies", name: "Strawberry Shortcake Squishy", price: 6,
      blurb: "Slow-rising and softer than it has any right to be.",
      notes: ["slow-rising", "palm-size", "scented!"],
      pair: ["gloss-strawberry", "squish-bear"] },
    { id: "squish-cherry", cat: "squishies", name: "Cherry Cupcake Squishy", price: 7,
      blurb: "A frosted cupcake with a cherry on top that you can squish forever.",
      notes: ["slow-rising", "jumbo", "cherry scented"],
      pair: ["squish-bear", "candle-cherries"] },
    { id: "squish-bear", cat: "squishies", name: "Circus Bear Squishy", price: 8,
      blurb: "The shop mascot. Wears a tiny ruffled collar. Non-negotiable bestseller.",
      notes: ["slow-rising", "extra squishy", "ruffled collar"],
      pair: ["squish-cherry", "gloss-cotton"] },
    { id: "butter-strawberry", cat: "body-butter", name: "Whipped Strawberry Body Butter", price: 12,
      blurb: "Whipped like frosting, melts in like a dream. Strawberries-and-cream everything.",
      notes: ["shea + cocoa butter", "strawberries & cream", "all-day soft"],
      pair: ["gloss-strawberry", "perfume-cotton"] },
    { id: "butter-vanilla", cat: "body-butter", name: "Vanilla Buttercream Body Butter", price: 12,
      blurb: "Smells like the frosting bowl. Sinks in fast, zero grease.",
      notes: ["shea + cocoa butter", "vanilla buttercream", "all-day soft"],
      pair: ["candle-bigtop", "gloss-strawberry"] },
    { id: "perfume-cotton", cat: "perfume", name: "Cotton Candy Mist", price: 16,
      blurb: "A big soft cloud of spun sugar you can wear. Layer it with everything.",
      notes: ["spun sugar", "pear", "white musk"],
      pair: ["gloss-cotton", "butter-strawberry"] },
    { id: "perfume-cherry", cat: "perfume", name: "Cherry Bow Eau de Parfum", price: 18,
      blurb: "Cherries, ribbon-tied. The fancy one on the shelf.",
      notes: ["griotte cherry", "almond blossom", "tonka"],
      pair: ["gloss-cherry", "candle-cherries"] }
  ],

  featured: ["gloss-strawberry", "candle-cherries", "squish-bear", "perfume-cotton"],

  reviews: [
    { q: "The strawberry gloss literally smells like shortcake. I own three and I am not sorry.", by: "mia", bought: "Strawberry Shortcake Gloss" },
    { q: "Lit the carnival candle once and my whole room is a funfair now. Obsessed.", by: "priya", bought: "Cotton Candy Carnival Candle" },
    { q: "Slowest-rising squishy I have ever owned. The bear is my son now.", by: "jordan", bought: "Circus Bear Squishy" }
  ],

  tones: {
    Sweet: {
      eyebrow: "welcome to Sugar Rush Co.!",
      title: "A little shop of sweet things!!",
      sub: "Lip gloss that tastes like dessert, candles that smell like the fair, squishies you will absolutely hug first. All made and wrapped with love.",
      cta: "Treat yourself",
      cta2: "Peek inside",
      window: "in the window today",
      sweetTitle: "join the sweetlist!",
      sweetSub: "First dibs on new drops, restocks & secret discount codes straight to your inbox."
    },
    Elegant: {
      eyebrow: "douceur - sweetness - joie",
      title: "Sweet little luxuries",
      sub: "A small collection of gloss, candlelight, perfume and soft things, each one made by hand and tied with a bow.",
      cta: "Browse the collection",
      cta2: "Our story",
      window: "currently in the window",
      sweetTitle: "Keep in touch",
      sweetSub: "Quiet little letters about new pieces and seasonal scents. No noise, ever."
    },
    Sparkle: {
      eyebrow: "step right up, step right up!",
      title: "The cutest shop under the big top!",
      sub: "Cotton-candy everything!! Cherry-topped anything!! Gloss, candles, squishies & spritzes - the carnival is open.",
      cta: "Let's gooo",
      cta2: "What's inside?",
      window: "today's main attractions",
      sweetTitle: "join the sweetlist!",
      sweetSub: "Be first in line for new drops, restocks + secret codes. Free cotton candy for your inbox."
    }
  }
};