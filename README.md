# Bellevue Gardens · Loyalty Card System

A lightweight loyalty card system. Customers access their personal
barcode via a unique private link on their phone — no app, no login.

---

## What's included

| File | Purpose |
|---|---|
| `server.js` | Node.js backend — all API routes |
| `public/card.html` | Customer-facing loyalty card page |
| `public/admin.html` | Admin panel to manage members |
| `data/members.json` | Member database (auto-created) |

---

## How it works

1. You add a member in the admin panel
2. The system generates a unique private link, e.g.:
   `https://yoursite.com/card.html?t=abc123def456`
3. You send that link to the customer (text, email, printed QR)
4. They open it on their phone — their barcode and discounts appear
5. Staff scan the barcode at the bar

---

## Local development (test on your computer first)

**Requirements:** Node.js 18 or newer — download free at nodejs.org

```bash
# 1. Open Terminal, navigate to this folder
cd bellevue-loyalty

# 2. Start the server
node server.js

# 3. Open in your browser
#    Customer card:  http://localhost:3000/card.html?t=abc123demo456def
#    Admin panel:    http://localhost:3000/admin
#    Admin password: bellevue2024
```

---

## Deploy to Render (recommended — free tier available)

Render is a hosting platform that runs your server 24/7. Free tier
sleeps after inactivity; the $7 USD/month (~$12 NZD) plan stays awake.

### Step 1 — Put your code on GitHub

1. Go to github.com and create a free account
2. Create a new repository called `bellevue-loyalty`
3. Upload all files from this folder into that repository

### Step 2 — Deploy on Render

1. Go to render.com and sign up (free)
2. Click **New → Web Service**
3. Connect your GitHub account and select `bellevue-loyalty`
4. Fill in the settings:
   - **Name:** bellevue-loyalty
   - **Runtime:** Node
   - **Build Command:** *(leave blank)*
   - **Start Command:** `node server.js`
5. Under **Environment Variables**, add:
   - `ADMIN_PASSWORD` → choose a strong password (e.g. `Bellevue#2024`)
6. Click **Create Web Service**
7. Render gives you a URL like `https://bellevue-loyalty.onrender.com`

### Step 3 — Add your custom domain (optional)

In Render → your service → Settings → Custom Domains:
- Add `members.bellevuegardens.co.nz` (or similar)
- Follow the DNS instructions Render provides

---

## Changing the admin password

**Locally:** Edit `server.js` line ~15:
```js
const ADMIN_PASSWORD = 'your-new-password';
```

**On Render:** Go to your service → Environment → edit `ADMIN_PASSWORD`

---

## Admin panel usage

Visit `/admin` on your site. Log in with your admin password.

- **Add member** → enter name + optional email → click Add
- A unique card link is automatically copied to your clipboard
- Send that link to the customer via text or email
- **Copy link** button re-copies any member's link at any time
- **Remove** deletes a member (their link stops working immediately)

---

## Sending links to customers

The easiest options:

**Text message** — paste the link directly:
> "Hey [name], here's your Bellevue Gardens members card —
> shows your discount at the bar. Save it to your phone!
> https://members.bellevuegardens.co.nz/card.html?t=..."

**Printed card with QR code** — go to qrcode-monkey.com, paste
the link, download the QR, print it on a small card to hand out.

**Email** — paste the link into an email with a short note.

---

## Data & backups

Member data is stored in `data/members.json`.

On Render, this file resets on each deploy unless you use a
**Render Disk** (add one under your service → Disks → $1 USD/month).

Alternatively, download `members.json` from Render's shell
periodically as a backup.

---

## Cost summary (NZD approx.)

| Item | Cost |
|---|---|
| Render free tier | $0 (sleeps after 15min idle) |
| Render Starter plan | ~$12/month (stays awake) |
| Render Disk (data persistence) | ~$2/month |
| Domain (optional) | ~$25–35/year |
| **Total running cost** | **~$14–16/month** |

---

## Need help?

Any issues — bring this README and the folder to a local web
developer or post in the Render community forums (free, helpful).

Bellevue Gardens · 140 Woburn Road · Lower Hutt · 04 569 7010
