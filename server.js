<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0" />
  <title>Members Card</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link href="https://fonts.googleapis.com/css2?family=Anton&family=Asap+Condensed:wght@400;600;700&family=Cormorant+Garamond:ital,wght@1,400&display=swap" rel="stylesheet" />
  <script src="https://cdn.jsdelivr.net/npm/jsbarcode@3.11.6/dist/JsBarcode.all.min.js"></script>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }

    html, body {
      min-height: 100%;
      font-family: 'Asap Condensed', sans-serif;
      background: var(--bg, #f1ead0);
      transition: background 0.3s;
    }

    body { display: flex; flex-direction: column; align-items: center; }

    .header {
      width: 100%;
      background: var(--dark, #053b27);
      padding: 14px 20px 12px;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .header-logo {
      font-family: 'Anton', sans-serif;
      font-size: 18px;
      color: var(--bg, #f1ead0);
      letter-spacing: 0.02em;
      line-height: 1;
    }

    .header-sub {
      font-size: 10px;
      font-weight: 600;
      letter-spacing: 0.16em;
      text-transform: uppercase;
      color: rgba(255,255,255,0.45);
      margin-top: 2px;
    }

    .header-pill {
      background: var(--mid, #2a9966);
      color: var(--bg, #f1ead0);
      font-size: 9px;
      font-weight: 700;
      letter-spacing: 0.14em;
      text-transform: uppercase;
      padding: 4px 10px;
      border-radius: 100px;
    }

    .card {
      width: 100%;
      max-width: 420px;
      background: var(--paper, #fbf7e8);
      padding: 24px 20px 28px;
      opacity: 0;
      transform: translateY(16px);
      animation: fadeUp 0.45s ease forwards 0.1s;
    }

    @keyframes fadeUp { to { opacity: 1; transform: translateY(0); } }

    .member-row {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 20px;
    }

    .avatar {
      width: 48px;
      height: 48px;
      border-radius: 50%;
      background: var(--primary, #097d4c);
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .avatar span {
      font-size: 15px;
      font-weight: 700;
      color: var(--bg, #f1ead0);
      letter-spacing: 0.04em;
    }

    .member-name {
      font-size: 20px;
      font-weight: 700;
      color: var(--ink, #1a1a17);
      line-height: 1.1;
    }

    .member-since {
      font-size: 12px;
      color: var(--inkLight, #6b6b62);
      margin-top: 2px;
    }

    .divider { height: 1px; background: var(--tan, #e6dcb5); margin: 0 0 20px; }

    .eyebrow {
      font-size: 10px;
      font-weight: 600;
      letter-spacing: 0.18em;
      text-transform: uppercase;
      color: var(--primary, #097d4c);
      margin-bottom: 10px;
    }

    .discount-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 10px;
      margin-bottom: 20px;
    }

    .discount-card {
      background: var(--dark, #053b27);
      border-radius: 10px;
      padding: 16px 12px 12px;
      text-align: center;
    }

    .discount-amount {
      font-family: 'Anton', sans-serif;
      font-size: 38px;
      color: var(--bg, #f1ead0);
      line-height: 1;
    }

    .discount-off {
      font-size: 11px;
      font-weight: 600;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      color: rgba(255,255,255,0.4);
      margin-top: 3px;
    }

    .discount-type {
      font-family: 'Anton', sans-serif;
      font-size: 16px;
      color: var(--accent, #ef90be);
      letter-spacing: 0.06em;
      text-transform: uppercase;
      margin-top: 8px;
      padding-top: 8px;
      border-top: 1px solid rgba(255,255,255,0.1);
    }

    .barcode-block {
      background: #fff;
      border-radius: 10px;
      border: 1px solid var(--tan, #e6dcb5);
      padding: 16px 12px 10px;
      text-align: center;
      margin-bottom: 16px;
    }

    .barcode-block svg { width: 100%; height: auto; display: block; }

    .barcode-id {
      font-size: 11px;
      letter-spacing: 0.14em;
      color: var(--inkLight, #6b6b62);
      margin-top: 8px;
      font-weight: 600;
    }

    .tagline {
      font-family: 'Cormorant Garamond', serif;
      font-style: italic;
      font-size: 14px;
      color: var(--inkMid, #3a3a35);
      text-align: center;
      line-height: 1.6;
    }

    .footer {
      width: 100%;
      max-width: 420px;
      background: var(--dark, #053b27);
      padding: 12px 20px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .footer span { font-size: 11px; font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase; color: rgba(255,255,255,0.4); }
    .footer a    { font-size: 11px; font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase; color: var(--accent, #ef90be); text-decoration: none; }

    .error-state { width: 100%; max-width: 420px; padding: 48px 24px; text-align: center; }
    .error-state h2 { font-family: 'Anton', sans-serif; font-size: 36px; color: var(--dark, #053b27); text-transform: uppercase; margin-bottom: 12px; }
    .error-state p  { font-size: 15px; color: var(--inkLight, #6b6b62); line-height: 1.5; }
  </style>
</head>
<body>
  <div id="app"></div>

  <script>
    const params = new URLSearchParams(window.location.search);
    const token  = params.get('t') || window.location.pathname.split('/').pop();
    const app    = document.getElementById('app');

    let venueMap = {};

    function applyTheme(colors) {
      const root = document.documentElement;
      Object.entries(colors).forEach(([key, val]) => {
        // convert camelCase to kebab-case
        const prop = '--' + key.replace(/([A-Z])/g, '-$1').toLowerCase();
        root.style.setProperty(prop, val);
      });
    }

    function initials(name) {
      return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
    }

    async function load() {
      try {
        // Load venues for branding
        const vRes   = await fetch('/api/venues');
        const venues = await vRes.json();
        venues.forEach(v => { venueMap[v.id] = v; });

        // Load member
        const mRes = await fetch(`/api/member?t=${encodeURIComponent(token)}`);
        if (!mRes.ok) throw new Error('not found');
        const m    = await mRes.json();
        const venue= venueMap[m.venueId];
        if (!venue) throw new Error('venue not found');

        applyTheme(venue.colors);
        renderCard(m, venue);
      } catch {
        renderError();
      }
    }

    function renderCard(m, v) {
      app.innerHTML = `
        <div class="header">
          <div>
            <div class="header-logo">${v.name}.</div>
            <div class="header-sub">Members Card</div>
          </div>
          <div class="header-pill">Member</div>
        </div>

        <div class="card">
          <div class="member-row">
            <div class="avatar"><span>${initials(m.name)}</span></div>
            <div>
              <div class="member-name">${m.name}</div>
              <div class="member-since">Member since ${m.joined}</div>
            </div>
          </div>

          <div class="divider"></div>

          <div class="eyebrow">Your member discounts</div>
          <div class="discount-grid">
            <div class="discount-card">
              <div class="discount-amount">${v.discounts.jug}</div>
              <div class="discount-off">off every</div>
              <div class="discount-type">Jug</div>
            </div>
            <div class="discount-card">
              <div class="discount-amount">${v.discounts.pint}</div>
              <div class="discount-off">off every</div>
              <div class="discount-type">Pint</div>
            </div>
          </div>

          <div class="eyebrow">Scan at the bar</div>
          <div class="barcode-block">
            <svg id="barcode"></svg>
            <div class="barcode-id">${v.prefix} · ${m.barcode}</div>
          </div>

          <p class="tagline">${v.tagline}</p>
        </div>

        <div class="footer">
          <span>${v.address}</span>
          ${v.phone ? `<a href="tel:${v.phone.replace(/\s/g,'')}">${v.phone}</a>` : '<span></span>'}
        </div>
      `;

      JsBarcode(document.getElementById('barcode'), v.prefix + m.barcode, {
        format: 'CODE128', width: 2.2, height: 70,
        displayValue: false, margin: 4,
        background: '#ffffff', lineColor: '#1a1a17'
      });
    }

    function renderError() {
      app.innerHTML = `
        <div class="header"><div><div class="header-logo">Members Card.</div></div></div>
        <div class="error-state">
          <h2>Card not found.</h2>
          <p>This link may be invalid or expired.<br>Ask at the bar to get your members card.</p>
        </div>
      `;
    }

    if (token && token.length > 3) { load(); } else { renderError(); }
  </script>
</body>
</html>
