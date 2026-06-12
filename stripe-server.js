// Sugar Rush Co. — Stripe payment server
// ─────────────────────────────────────────────────────────────────────────────
// SETUP (one-time):
//   1. npm install stripe express cors
//   2. Replace STRIPE_SECRET_KEY below with your secret key from:
//      stripe.com/dashboard → Developers → API keys → Secret key
//   3. node stripe-server.js
//   4. In shop/app.jsx set: STRIPE_BACKEND_URL = "http://localhost:4242"
//
// When you're ready to go live, deploy this file to any Node host
// (Railway, Render, Fly.io, etc.) and update STRIPE_BACKEND_URL to
// your deployed URL. Switch both keys to live keys (pk_live_ / sk_live_).
// ─────────────────────────────────────────────────────────────────────────────

require("dotenv").config(); // loads .env file

const express = require("express");
const cors    = require("cors");
const stripe  = require("stripe")(process.env.STRIPE_SECRET_KEY); // reads from .env, never hardcoded

const app  = express();
const PORT = 4242;

app.use(cors());
app.use(express.json());

// POST /create-payment-intent
// Body: { amount: number (cents), currency: string }
// Returns: { clientSecret: string }
app.post("/create-payment-intent", async (req, res) => {
  try {
    const { amount, currency = "usd" } = req.body;
    if (!amount || amount < 50) {
      return res.status(400).json({ error: "Amount must be at least 50 cents." });
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount:   Math.round(amount),
      currency: currency,
      automatic_payment_methods: { enabled: true },
      metadata: { shop: "Sugar Rush Co." }
    });

    res.json({ clientSecret: paymentIntent.client_secret });
  } catch (err) {
    console.error("Stripe error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// Health check
app.get("/", (req, res) => res.json({ status: "Sugar Rush Co. payment server is running 🍬" }));

app.listen(PORT, () => {
  console.log(`Sugar Rush Co. payment server running on http://localhost:${PORT}`);
  console.log("Make sure STRIPE_PUBLISHABLE_KEY in shop/app.jsx matches your Stripe account.");
});
