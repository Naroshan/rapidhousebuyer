# Rapid House Buyer — Full SEO & Digital Strategy

## 1. Site Architecture Overview

```
rapidhousebuyer.co.uk/
├── index.html                    (Homepage — priority 1.0)
├── sitemap.xml
├── robots.txt
├── pages/
│   ├── about.html                (Company, EEAT, credentials)
│   ├── how-it-works.html         (Process detail page)
│   ├── services.html             (Services hub)
│   ├── repossession.html         (Top intent — highest urgency)
│   ├── probate.html
│   ├── landlords.html
│   ├── debt.html
│   ├── urgent-sale.html
│   ├── divorce.html
│   ├── relocation.html
│   ├── contact.html
│   ├── faq.html                  (FAQPage schema)
│   ├── locations.html            (Locations hub — 120 links, grouped London + 6 M25 counties)
│   ├── blog.html                 (Content hub)
│   └── [complaints/privacy/terms/cookies]
├── gen/
│   ├── towns_data.py             (Source data for M25 town-page generation)
│   └── generate.py               (Generator script — reuse this pattern for future location pages)
└── locations/
    ├── [60 London borough/sub-area pages]  (Priority 0.85)
    └── [60 M25-corridor town pages]        (Priority 0.7 — Herts, Essex, Kent, Surrey, Bucks, Berks)
```

Coverage note: the business now positions as **England & Wales**-wide (not London-only) — deepest expertise in the 32 London boroughs plus the M25 corridor, with the rest of England & Wales served but without dedicated location pages. Homepage/about/hero copy and JSON-LD `areaServed` already reflect this; keyword targeting below should too.

## 2. Target Keyword Clusters

### Tier 1 — High Intent, Highest Priority
| Keyword | Page | Monthly Volume (est.) |
|---|---|---|
| sell house fast london | homepage | 2,400 |
| cash property buyers london | homepage | 1,600 |
| we buy any house | homepage | 1,900 |
| quick house sale london | homepage | 1,200 |
| cash house buyers | homepage / services.html | 720 |
| sell property fast for cash london | homepage | 900 |
| stop repossession london | repossession.html | 1,100 |
| sell house repossession notice | repossession.html | 800 |

### Tier 2 — Service-Specific Intent
| Keyword | Page |
|---|---|
| sell house probate london | probate.html |
| landlord sell property fast london | landlords.html |
| sell house divorce london | divorce.html |
| sell house due to debt london | debt.html |
| urgent house sale london | urgent-sale.html |
| sell house relocation london | relocation.html |

### Tier 3 — Location Pages (x120 pages)
- London boroughs/sub-areas (60 pages): "cash property buyers [borough]", "sell house fast [area]", "quick sale [area] london"
- M25-corridor towns (60 pages, Herts/Essex/Kent/Surrey/Bucks/Berks): "cash house buyers [town]", "sell house fast [town]", "we buy houses [town]"

### Tier 4 — Informational / Blog
Pattern: how-to guides on repossession, probate, landlord exit, England & Wales property market analysis, plus "property buying company" (590/mo, informational — currently untargeted, good blog fit)

## 3. Topical Authority Clusters

### Cluster A: Cash Property Buyers
- Core: homepage
- Spokes: how-it-works, about, faq, services
- Intent: informational + transactional

### Cluster B: Repossession
- Core: repossession.html
- Spokes: debt.html, urgent-sale.html
- Blog posts: "How repossession works in England", "Your rights when behind on mortgage payments", "Repossession statistics London 2025"
- Intent: urgent transactional

### Cluster C: Landlord Exit
- Core: landlords.html
- Spokes: urgent-sale.html
- Blog posts: "Renters Reform Bill impact for London landlords", "Capital gains tax on London BTL exit", "How to sell tenanted property fast"
- Intent: commercial transactional

### Cluster D: Probate Property
- Core: probate.html
- Spokes: contact.html
- Blog posts: "Complete guide to selling inherited London property", "Grant of Probate: what executors need to know", "Inheritance tax and London property"
- Intent: informational + transactional

### Cluster E: Location Pages
- Core: locations.html (sectioned by London boroughs, then by M25 county)
- Spokes: 60 London borough/sub-area pages
- Spokes: 60 M25-corridor town pages (Hertfordshire, Essex, Kent, Surrey, Buckinghamshire, Berkshire)
- Each location page links to related service pages and to nearby location pages

## 4. Internal Linking Strategy

### Homepage → Service Pages
- 6 audience cards each link to dedicated service pages
- Borough pills all link to borough location pages
- Footer links to all primary services and key boroughs

### Service Pages → Related Services
- Each service page sidebars link to 3-4 related service pages
- All service pages link to how-it-works and faq

### Location Pages → Service Pages
- Each location page sidebar links to all 5 primary service types
- Location pages breadcrumbs link back to locations hub
- Sub-area pages link to parent borough page

### Blog → Commercial Pages
- Each blog post should include at least 2 CTAs linking to relevant service page
- Blog posts on repossession → repossession.html
- Blog posts on landlords → landlords.html
- etc.

## 5. Schema Markup Implementation

### Implemented on Homepage
- LocalBusiness schema with aggregateRating
- FAQPage schema (5 key questions)
- WebSite schema with SearchAction

### Implemented on Service Pages
- FAQPage schema on repossession, faq pages

### Implement on Location Pages ✓
- FAQPage schema (borough-specific questions)

### Still to Implement
- BreadcrumbList on all inner pages (add via JS)
- HowTo schema on how-it-works.html
- Review/AggregateRating schema on testimonial-heavy pages
- Article schema on blog posts

## 6. Technical SEO Recommendations

### Core Web Vitals
- **LCP (Largest Contentful Paint):** Hero text renders before images; no large above-fold images; Google Fonts preconnect in `<head>` ✓
- **FID/INP:** JavaScript is minimal and deferred ✓; no heavy frameworks
- **CLS:** All images need explicit width/height attributes; avoid dynamically injected content above fold
- **Recommendations:**
  - Serve fonts from self-hosted (remove Google Fonts dependency for production)
  - Implement critical CSS inline (above-fold CSS in `<style>` tag)
  - Use `loading="lazy"` on all below-fold images
  - Add width/height to all `<img>` tags

### Technical Implementation
```html
<!-- Add to all pages for speed -->
<link rel="preload" href="/css/main.css" as="style">
<link rel="dns-prefetch" href="//wa.me">
<meta name="theme-color" content="#0a0a0a">
<link rel="icon" href="/favicon.ico" sizes="any">
<link rel="apple-touch-icon" href="/apple-touch-icon.png">
```

### URL Structure ✓
Netlify's default pretty-URL behaviour already serves clean URLs without needing an explicit rewrite rule — canonical tags, internal links, and JSON-LD all use extensionless paths (`/locations/camden`, `/pages/repossession`) while the actual files remain `.html` on disk. Non-www is forced to the canonical `https://rapidhousebuyer.co.uk` host via `_redirects` (301). Nothing further needed here.

### Canonical Tags ✓
All pages have canonical tags matching the extensionless production URLs.

### Hreflang
Not required (English-language site, England & Wales only).

## 7. EEAT Signals (Experience, Expertise, Authoritativeness, Trustworthiness)

### Implemented
- ✓ Founding date and years of operation stated ("direct cash buyer since 2012")
- ✓ In-house RICS-accredited surveyors mentioned (no named individual credential — avoid inventing one)
- ✓ NAPB, TPO and ICO membership prominently displayed
- ✓ Trading style disclosure: "Rapid House Buyer is a trading style and subsidiary of The LeadGenCo LTD" (Companies House no. 17274904)
- ✓ Physical office address (30 St Mary Axe)
- ✓ Review schema with AggregateRating (4.9★ stated)
- ✓ Transparent pricing disclosure (75-85% of market value)
- ✓ "We recommend independent advice" statements

### Needs verification before further reliance (flagged, not yet confirmed)
- [ ] NAPB / TPO / ICO membership numbers — currently stated but not individually verified against the registers
- [ ] "347+ properties since 2012" and "4.9★" stats — need a source or should be softened/removed if unverifiable
- [ ] Testimonial authenticity/consent

### Still to Implement
- [ ] Add author bylines to blog posts (with real, verifiable credentials only)
- [ ] Obtain and embed Google Business Profile reviews
- [ ] Add Trustpilot widget with live review count
- [ ] Add company photo (registered office) to About page
- [ ] Add LinkedIn company page link to footer
- [ ] Create Wikipedia-eligible profile via NAPB or trade press coverage

## 8. Blog Content Strategy (12-Month Plan)

### Month 1-3: Foundation Content
- "How to Stop Repossession in England: A Complete Guide" (target: 2,500 words)
- "Selling an Inherited London Property: Executor's Guide" (target: 2,000 words)
- "The Renters Reform Bill: What London Landlords Need to Know" (target: 1,800 words)
- "Cash vs Open Market Sale: A Genuine Comparison for London Homeowners" (target: 1,500 words)

### Month 4-6: Location-Specific Content
- "London Property Market By Borough: 2025 Analysis"
- "Best and Worst London Boroughs to Sell Property in 2025"
- "The Impact of Crossrail/Elizabeth Line on Property Values by Station"
- "Selling Property Along the M25 Corridor: A Town-by-Town Guide" (ties into the 60 new M25 town pages)

### Month 7-9: Legal/Financial Depth
- "Capital Gains Tax When Selling a Buy-to-Let Property in London"
- "Inheritance Tax and London Property: What Executors Need to Know"
- "IVA and Selling Your Home: What You Need to Know"

### Month 10-12: Seasonal/News
- "Repossession Statistics UK: Annual Analysis"
- Quarterly London property market updates
- Budget/Autumn Statement property tax commentary

## 9. Conversion Optimisation Strategy

### Form Optimisation
- A/B test: Short 3-field form vs current 5-field form
- Test: "Get Cash Offer" vs "Get Free Valuation" vs "Request Callback" CTA copy
- Add social proof near form: "247 homeowners contacted us this month"
- Add urgency: show office hours and "We respond within 2 hours" prominently

### WhatsApp First Strategy
- WhatsApp float button visible on all pages (desktop) ✓
- Persistent mobile contact bar (call + WhatsApp) replaces the float on screens ≤768px ✓
- Nav WhatsApp button on desktop ✓
- WhatsApp as primary CTA in urgent pages (repossession) ✓
- Pre-filled WhatsApp message text ✓
- Track WhatsApp clicks separately from form submissions in GA4 (not yet instrumented — see §12)

### Trust Trigger Sequencing
Homepage scroll order optimised:
1. Hero (what we do + form) — immediate conversion opportunity
2. Stats bar — credibility
3. Who we help — identification
4. How it works — education
5. Comparison table — rational case
6. Testimonials — social proof
7. Trust signals — authority
8. Boroughs — SEO value + relevance
9. FAQ — objection handling
10. CTA band — final conversion push

### Exit Intent (Production)
Implement exit intent popup with WhatsApp CTA:
```js
document.addEventListener('mouseleave', (e) => {
  if (e.clientY < 0 && !sessionStorage.getItem('exitShown')) {
    showExitPopup();
    sessionStorage.setItem('exitShown', '1');
  }
});
```

## 10. GDPR & Cookie Compliance

### Implemented ✓
- Cookie banner with accept/decline ✓
- Consent stored in localStorage ✓
- Privacy Policy page ✓
- Cookie Policy page ✓
- ICO registration noted ✓
- Form consent checkboxes on all forms ✓
- Link to Privacy Policy in all forms ✓

### Production Checklist
- [ ] Integrate proper Consent Management Platform (OneTrust, Cookiebot)
- [ ] Ensure GA4 only fires after consent is given
- [ ] Implement server-side consent logging
- [ ] Annual DPIA review
- [ ] Privacy Policy review with qualified solicitor

## 11. Accessibility Compliance

### Implemented ✓
- Skip links on all pages ✓
- ARIA labels on forms, navigation, interactive elements ✓
- Semantic HTML (main, nav, header, footer, article) ✓
- Focus-visible styles ✓
- prefers-reduced-motion media query ✓
- Colour contrast: gold on dark background meets AA ✓
- Form labels explicitly linked to inputs ✓
- Alt text pattern established in img elements

### Production Checklist
- [ ] Run automated accessibility audit (axe, Lighthouse)
- [ ] Manual keyboard navigation test
- [ ] Screen reader test (NVDA, VoiceOver)
- [ ] Colour contrast audit for all text/background combinations
- [ ] WCAG 2.1 AA certification via qualified auditor

## 12. Analytics & Tracking Setup

### Tag management ✓
Google Tag Manager (container `GTM-ML5MZDK3`) is installed sitewide — the loader snippet in every page's `<head>` plus the `<noscript>` iframe immediately after `<body>`. All tag config (GA4, Google Ads conversion tag, triggers) lives in the GTM container itself, not in this repo. GTM does not expose a global `gtag()` — pages must never call `gtag(...)` directly.

### Events pushed from page JS
```js
// Enquiry form success handler (homepage + every locations/*.html copy)
window.dataLayer.push({ event: 'generate_lead', event_category: 'Lead' });
```
`generate_lead` is the GA4-recommended event name and is what the Google Ads "Submit lead form" conversion action is wired to in GTM — keep this name in sync with the GTM trigger if either side changes.

### Still to instrument (not yet in page JS)
- [ ] phone_click (tel: link clicks)
- [ ] whatsapp_click (wa.me link clicks)
- [ ] scroll_depth (50%/75%/100%)
- [ ] form_start (on first field focus)

### Google Ads Conversion Tracking
- `generate_lead`: primary conversion, confirm it shows "Recording" (not "Unverified") in the Ads UI
- Phone click / WhatsApp click: intended as micro-conversions once instrumented above

### Search Console Setup
- Verify via DNS TXT record
- Submit sitemap.xml
- Monitor: repossession, cash buyers, sell house fast clusters
- Set up weekly performance report email

## 13. Off-Page / Link Building Strategy

### High-Priority Link Targets
1. NAPB member directory listing — guaranteed link
2. TPO member listing — guaranteed link
3. Citizens Advice resource pages (repossession content)
4. Mortgage broker and IFA referral networks
5. Probate solicitor referral partnerships
6. Local London newspaper property sections (Ham & High, Hackney Gazette, etc.)
7. Property Investor Today, Property118 contributor articles
8. RICS resources / case studies

### Content-Led Link Building
- "London Repossession Statistics" annual data post (journalist bait)
- "London Landlord Exit Survey" original data
- Borough-level property market reports (local press pickup)

---

*Strategy document prepared for rapidhousebuyer.co.uk. Review quarterly. Last synced to live site: 2026-08-20 (120 location pages, England & Wales positioning, GTM/dataLayer analytics).*
