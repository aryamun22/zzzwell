# zzzwell — Cash-Pay Sleep & Jaw Specialist Directory (demo)

A static, transparency-focused directory of providers who treat sleep-disordered breathing, styled after cost-plus healthcare sites.

**Live:** https://zzzwell.surge.sh

## Pages
- `index.html` — landing
- `sleep.html` — community-known sleep/airway physicians + top CMS Medicare sleep-study billers (CY2023)
- `orthodontists.html` — airway orthodontists (MARPE / MSE / DOME), seeded from getExpanded.org
- `omfs.html` — oral & maxillofacial surgeons for MMA / orthognathic OSA correction
- `glp1.html` — GLP-1 (tirzepatide) prescribing channels for OSA
- `pap-labs.html` — PAP suppliers + accredited sleep labs (with ZIP)

## Stack
Plain HTML/CSS/JS. Data in `data/*.json`, rendered client-side by `assets/app.js` (search, tag filters, Google Maps links, Add-to-Calendar links — no API keys/backend).

## Develop
```bash
python3 -m http.server 8011   # then open http://localhost:8011
```

## Deploy
```bash
npx surge ./ zzzwell.surge.sh
```

## Disclaimer
Demo / informational only. No contractual, pricing, referral, or endorsement claims. Listings (including "cash-pay," "insurance," "community-known" labels) are illustrative and unverified, and are not medical advice. CMS-data listings reflect Medicare billing volume only, which is not a quality measure.
