# NenoFlex Integration Guide & Antigravity Setup

This guide provides complete instructions for integrating live payments (Razorpay/Stripe), Google OAuth / Transactional Emails, and the best compatible apps/services for running NenoFlex with Google Antigravity.

---

## 1. Live Payment Integration (Razorpay & Stripe)

### A. Razorpay Setup (India UPI, Cards, NetBanking, QR Pre-Paid)
1. **Create Razorpay Account**: Register at [razorpay.com](https://razorpay.com) and complete KYC.
2. **API Keys**: Navigate to **Account & Settings** → **API Keys** → Generate **Key ID** and **Key Secret**.
3. **Environment Variables**:
   Add to `.env.local`:
   ```env
   NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_live_xxxxxxxxxxxx
   RAZORPAY_KEY_SECRET=xxxxxxxxxxxxxxxxxxxxxxxx
   ```
4. **Checkout Integration**:
   Install SDK:
   ```bash
   npm install razorpay
   ```
   Add Razorpay Checkout script in `src/app/layout.tsx`:
   ```html
   <script src="https://checkout.razorpay.com/v1/checkout.js"></script>
   ```

### B. Stripe Setup (International Cards & Wallets)
1. **API Keys**: Obtain `STRIPE_PUBLISHABLE_KEY` and `STRIPE_SECRET_KEY` from your [Stripe Dashboard](https://dashboard.stripe.com).
2. **Environment Variables**:
   ```env
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_xxxxxxxxxxxx
   STRIPE_SECRET_KEY=sk_live_xxxxxxxxxxxx
   ```

---

## 2. Google OAuth & Email Integration

### A. Google OAuth 2.0 (Customer Sign-In)
1. Go to [Google Cloud Console](https://console.cloud.google.com).
2. Create a new project **NenoFlex Official**.
3. Navigate to **APIs & Services** → **OAuth consent screen** → Configure User Type: External.
4. Go to **Credentials** → **Create Credentials** → **OAuth client ID** (Web Application).
5. Authorized JavaScript origins: `http://localhost:3000` (Dev) and `https://nenoflex.in` (Production).
6. Authorized redirect URIs: `https://nenoflex.in/api/auth/callback/google`.
7. **Environment Variables**:
   ```env
   GOOGLE_CLIENT_ID=xxxxxxxxxxxx.apps.googleusercontent.com
   GOOGLE_CLIENT_SECRET=GOCSPX-xxxxxxxxxxxx
   ```

### B. Transactional Email Dispatch (Resend / Nodemailer)
For dispatching order receipts, tracking updates, and admin alerts:
1. Sign up at [resend.com](https://resend.com).
2. Add and verify domain `nenoflex.in`.
3. Install Resend SDK:
   ```bash
   npm install resend
   ```
4. Add API Key:
   ```env
   RESEND_API_KEY=re_123456789_xxxxxxxxxxxx
   ```

---

## 3. Recommended Compatible Stack & Apps for Antigravity

To ensure seamless performance, fast image loading, and persistent state when working with **Google Antigravity (AGY)**, we recommend the following companion apps and services:

| Service / App | Purpose | Compatibility with Antigravity | Setup Notes |
| :--- | :--- | :--- | :--- |
| **Cloudflare R2 / AWS S3** | High-Speed Image & Media Storage | 100% Native | Host product photos and 2nd hover images with global CDN delivery. |
| **Supabase / PostgreSQL** | Persistent Relational Database | 100% Native | Stores catalog, user accounts, cart state, and order tracking. |
| **Vercel / Render** | Zero-Config Hosting & Deployment | 100% Native | Auto-deploys Next.js App Router with automatic SSL certificate. |
| **Postman / Thunder Client** | API Endpoint Testing | Recommended | Test checkout webhook payloads and admin API endpoints directly. |

---

## 4. How Admin Access Works in Production

- **Admin URL**: Navigate to `/login`
- **Default Admin Credentials**:
  - Email: `admin@nenoflex.com`
  - Password: `admin123`
- Logging in with these credentials automatically unlocks the hidden `/admin` console, giving **100% control** to edit site settings, announcement banners, hero titles, product catalog prices/images/sold out states, and promo vouchers.
