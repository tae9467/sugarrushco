# Sugar Rush Co.

**Live shop: [sugarrushco.shop](https://sugarrushco.shop)**

A full-stack e-commerce shop for handmade lip gloss, slime, body butter, and perfume, designed and built in 4 days. I paired my own design and coding skills with Claude Design and Claude Code to speed up the workflow, then iterated on and improved that foundation by hand: a custom storefront, secure checkout, and a complete admin dashboard for running the business day to day.

## Features

### Storefront
- Product catalog with category filtering, product detail pages, and image galleries
- Cart and Stripe Checkout with server-side stock validation, so items can never oversell even under concurrent orders
- Customer reviews with star ratings, collected through tokenized email invites sent after delivery
- Order confirmation and transactional emails
- "Coming soon" states across the site between drops
- SEO-ready: meta and Open Graph tags, sitemap.xml, robots.txt, canonical URLs
- Fully responsive with skeleton loading and image preloading for a fast feel on mobile

### Admin dashboard
- Order management with search, status filters, and one-click CSV export
- Inventory control: create, edit, hide, and delete products, including bulk actions
- Review moderation with public replies
- Hardened access: environment-based credentials, IP whitelisting, rate limiting, and automatic lockout after repeated failed logins

### Operations
- Monthly automated dependency security audit and patching via GitHub Actions

## Tech stack

| Layer | Technology |
|---|---|
| Frontend | React 18, HTML, CSS |
| Frontend hosting | GitHub Pages with a custom domain behind Cloudflare |
| Backend | Node.js with Express, hosted on Render |
| Database | Supabase (PostgreSQL) |
| Payments | Stripe Checkout with signature-verified webhooks |
| Email | Resend |
| Automation | GitHub Actions |
| Design and workflow | Figma, Claude Design, Claude Code |

## Architecture

The frontend is a React single-page app served statically from GitHub Pages, with Cloudflare providing DNS, HTTPS, and CDN caching. It talks to an Express API on Render that owns all business logic: product data, checkout session creation with stock checks, order lifecycle, review tokens, and the admin endpoints.

Payments run through Stripe Checkout. A signature-verified webhook confirms successful payments before an order is marked paid, and stock is validated server-side before any checkout session is created. Products, orders, and reviews live in Supabase (PostgreSQL), and Resend delivers confirmation, contact, and review invite emails.

Admin routes sit behind multiple layers: credentials stored only in server environment variables, an IP whitelist resolved from Cloudflare headers, per-route rate limiting, and HSTS across the API.

---

Made with love (and a lot of sugar) in Florida 💜
