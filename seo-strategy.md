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
│   ├── locations.html            (Locations hub — 1,017 links: 128 base locations grouped London/M25-county,
│   │                               plus a full situation-grouped directory linking directly to all 896
│   │                               combo pages so none of them sit more than one click away)
│   ├── blog.html                 (Property Insights hub — card grid linking to blog/*.html)
│   └── [complaints/privacy/terms/cookies]
├── gen/
│   ├── towns_data.py             (Source data for M25 town-page generation — a dict keyed by slug with
│   │                               descriptive field names, matching situations_data.py /
│   │                               postcode_pilot_data.py's convention, not the list-of-dicts shape it
│   │                               used to be)
│   ├── generate.py               (M25 town-page generator)
│   ├── situations_data.py        (Content source for the Service x Location combo pages)
│   ├── generate_combo.py         (Combo-page generator — one page per situation per location, 896 pages)
│   ├── postcode_pilot_data.py    (Source data for the 8 inner-London postcode pilot pages)
│   └── generate_postcodes.py     (Postcode pilot page generator)
├── locations/
│   ├── [60 London borough/sub-area pages]     (Priority 0.85)
│   ├── [60 M25-corridor town pages]           (Priority 0.7 — Herts, Essex, Kent, Surrey, Bucks, Berks)
│   ├── [8 postcode-pilot pages]               (Priority 0.7 — N1, E1, SE1, SW11, W10, NW3, E8, SE22; see
│   │                                            §2 Tier 3b and §12 for the pending Search Console review)
│   └── [slug]/[situation].html                (896 Service x Location combo pages — 128 locations x 7
│                                                situations: repossession, probate, landlords, debt,
│                                                urgent-sale, divorce, relocation. Priority 0.6)
└── blog/                         (Priority 0.7 — one page per post, Article + BreadcrumbList JSON-LD,
                                    Organization author — no named individual to attribute posts to)
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

### Tier 3 — Location Pages (x120 base pages, x896 combo pages)
- London boroughs/sub-areas (60 pages): "cash property buyers [borough]", "sell house fast [area]", "quick sale [area] london"
- M25-corridor towns (60 pages, Herts/Essex/Kent/Surrey/Bucks/Berks): "cash house buyers [town]", "sell house fast [town]", "we buy houses [town]"
- Service x Location combos (896 pages, `/locations/[slug]/[situation]`): "stop repossession in [area]", "probate property sale [area]", "sell tenanted property [area]" — pairs each of the 7 situation keywords with every location, each with its own genuinely distinct content (real local data, not templated find/replace) and its own on-page enquiry form

### Tier 3b — Postcode Pilot (x8 base pages, x56 combo pages) — pilot, not yet scaled
Targets postcode-district search intent directly rather than area name, e.g. "sell house fast SW11" alongside
"sell house fast Battersea": `N1`, `E1`, `SE1`, `SW11`, `W10`, `NW3`, `E8`, `SE22`. Modelled on a competitor's
location-page architecture where postcode-sector pages were the largest single page bucket. Each postcode page
cross-links to/from its parent borough page and has its own full situation combo set. See `gen/postcode_pilot_data.py`
for the area data and CLAUDE.md's "Postcode pilot" section for the full mechanics. **A Search Console review
(indexing + impressions/clicks for these 64 URLs vs. a comparable borough page) is pending before deciding whether
to extend this to more postcodes or outer London** — see §12.

### Tier 4 — Informational / Blog (blog/*.html, linked from pages/blog.html hub)
- Live: how-fast-can-you-sell-a-house-uk.html (sell house fast, average time to sell a house uk, how long to sell a house uk), what-is-a-property-buying-company.html (property buying company), property-valuation-guide.html (property valuation london, house valuation uk)
- Pattern for future posts: how-to guides on repossession, probate, landlord exit, England & Wales property market analysis

### Keyword-to-Page Map

One primary target URL per keyword cluster, so each high-value topic has a single defined ranking destination rather than competing pages. Search intent: **C** = commercial (buyer/seller ready to act), **I** = informational (research stage).

| Primary keyword | Secondary variants | Intent | Target URL | Conversion goal |
|---|---|---|---|---|
| sell house fast uk | sell house uk, sell my house, selling my house, sell house quickly | C/I | / (homepage) | `generate_lead` form submit |
| cash house buyers | we buy any house, cash property buyers uk | C | / , /pages/services.html | form submit / call |
| property buying company | the property buying company (competitor brand — do not target directly) | I | /blog/what-is-a-property-buying-company.html | click-through to /pages/services.html |
| value my house uk | house worth uk, house valuation uk, house valuation london | C/I | /pages/how-it-works.html (commercial), /blog/property-valuation-guide.html (informational) | form submit / read-through |
| average time to sell a house uk | how long to sell a house uk, selling a house | I | /blog/how-fast-can-you-sell-a-house-uk.html | click-through to /#valuation-form |
| stop repossession | sell house repossession notice | C | /pages/repossession.html | form submit / call (highest urgency) |
| sell house probate | probate property sale | C | /pages/probate.html | form submit |
| landlord sell property fast | sell tenanted property | C | /pages/landlords.html | form submit |
| sell house due to debt | avoid bankruptcy sale | C | /pages/debt.html | form submit |
| urgent house sale | sell house quickly (deadline-driven) | C | /pages/urgent-sale.html | form submit / call |
| sell house divorce | divorce property sale fast | C | /pages/divorce.html | form submit |
| sell house relocation | sell house moving abroad | C | /pages/relocation.html | form submit |
| cash property buyers [area] | sell house fast [area], quick sale [area] | C | /locations/[slug].html (120 pages) | form submit / call |
| [situation] in [area] (e.g. stop repossession in Croydon) | [situation] property sale [area] | C | /locations/[slug]/[situation].html (896 pages) | on-page form submit |
| sell house fast [postcode] (e.g. SW11) | cash buyers [postcode] | C | /locations/[postcode-slug].html (8 pilot pages) | form submit / call |
| sell my house fast london | sell house fast london | C | /pages/faq.html | form submit / call |

Not yet mapped to a page (tracked for future content, no dedicated URL currently): capital gains tax selling rental property, inheritance tax selling property, Renters Reform Bill impact for landlords — see §8 Blog Content Strategy.

**Cannibalization check**: "sell house fast" variants are intentionally split by qualifier — the bare/UK-wide phrase on the homepage, borough/town-qualified phrases on location pages, and the pure timeline question ("how long/average time to sell") on the blog post — so no two indexed pages should compete for an identical exact-match query.

**Still needed**: Google Search Console isn't connected in this environment, so the map above hasn't been validated against actual impression data per Semrush's step 4 (checking which existing pages already receive impressions for these themes, to catch real-world cannibalization the table above can't see from content alone). Pull that from Search Console's Performance report (filter by query, group by page) and flag anything showing 2+ indexed pages both getting impressions for the same query.

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
- Core: locations.html (sectioned by London boroughs, then by M25 county, plus a full situation-grouped
  directory linking directly to all 896 combo pages so none of them sit more than one click from the hub)
- Spokes: 60 London borough/sub-area pages
- Spokes: 60 M25-corridor town pages (Hertfordshire, Essex, Kent, Surrey, Buckinghamshire, Berkshire)
- Spokes: 8 postcode-pilot pages (N1, E1, SE1, SW11, W10, NW3, E8, SE22), cross-linked to/from their parent
  borough page
- Each location page (base and postcode alike) links to its own 7 situation combo pages, and each combo page
  links back to its location, to the situation's full guide page, and to the locations hub
- Each location page links to related service pages and to nearby location pages

## 4. Internal Linking Strategy

### Homepage → Service Pages
- 7 audience cards each link to dedicated service pages (added "Need an Urgent Sale" as the 7th)
- No borough-pill grid on the homepage — removed on request as duplicating the locations hub; use
  `/pages/locations` for the full area directory instead
- Footer links to all primary services and key boroughs

### Service Pages → Related Services
- Each service page sidebars link to 3-4 related service pages
- All service pages link to how-it-works and faq

### Location Pages → Service Pages
- Each location page has a "Situations We Help With in [area]" pill row linking to all 7 of its own combo
  pages (repossession, probate, landlords, debt, urgent-sale, divorce, relocation)
- Location pages breadcrumbs link back to locations hub
- Sub-area pages link to parent borough page
- Postcode-pilot pages link to their parent borough page; the parent borough's "Nearby Areas We Cover" row
  links forward to the postcode page (e.g. Battersea ↔ SW11)
- Combo pages (`/locations/[slug]/[situation]`) link back to their location, sideways to the other 3 related
  situations in that location, up to the situation's full guide page (`/pages/[situation]`), and to the
  locations hub — each also has its own on-page enquiry form (not a redirect to the homepage form)

### Blog → Commercial Pages
- Each blog post should include at least 2 CTAs linking to relevant service page
- Blog posts on repossession → repossession.html
- Blog posts on landlords → landlords.html
- etc.

## 5. Schema Markup Implementation

### Implemented on Homepage
- LocalBusiness schema with aggregateRating
- FAQPage schema (5 key questions, matching the visible accordion exactly)
- WebSite schema with SearchAction

### Implemented on Service Pages
- FAQPage schema on all 7 situation pages, faq page, and all 896 combo pages

### Implemented on Location Pages ✓
- FAQPage schema (borough/town/postcode-specific questions, matching visible content)
- LocalBusiness + BreadcrumbList schema on all 128 base location pages and all 896 combo pages

### Implemented Sitewide ✓
- BreadcrumbList — static JSON-LD (not JS-injected) on every page except the homepage (1,046 of 1,047 HTML
  files; the homepage is the one exception, and reasonably so — it's the root, nothing to show a trail back
  to). Note the homepage is also structurally different from every other page here: it bundles LocalBusiness,
  WebSite+SearchAction and FAQPage into one `"@graph"` array, while every other page (all 128 base locations,
  all 896 combo pages, situation/blog/legal pages) emits 2-3 separate JSON-LD `<script>` blocks instead — don't
  use the homepage's head markup as a template for `@graph` elsewhere, it's not the sitewide pattern
- HowTo schema on how-it-works.html
- Review schema (itemscope/itemtype) on testimonial cards on the 32 rich borough pages and 60 M25 town pages,
  plus AggregateRating on the homepage's LocalBusiness node (96 files carry Review/AggregateRating markup)
- Article + BreadcrumbList schema on all 4 blog posts

### Still to Implement
- HowTo schema elsewhere (currently only on how-it-works.html)
- Review/AggregateRating schema on the ~25 sub-area location pages (Acton, Battersea, Angel, etc. — the
  single-average-price template) and the 8 postcode-pilot pages, which don't carry it yet

## 6. Technical SEO Recommendations

### Core Web Vitals
- **LCP (Largest Contentful Paint):** Hero text renders before images; the site uses no raster `<img>` tags
  anywhere (icons are emoji/inline SVG) so there's no LCP image to optimise. Google Fonts load via the async
  preconnect+preload+`media=print onload` pattern sitewide (not a plain blocking `<link rel=stylesheet>`) ✓
- **FID/INP:** JavaScript is minimal and deferred ✓; no heavy frameworks
- **CLS:** No `<img>` tags to size, and no dynamically injected above-fold content ✓
- **Resolved this way rather than self-hosting fonts:** the async font-loading pattern above was applied
  sitewide instead of self-hosting Google Fonts — it removes the render-blocking request without taking on
  font-file hosting/updates. Self-hosting remains a further option if Search Console still flags fonts as a
  bottleneck after this.
- **Not applicable / already N/A:** "add width/height to `<img>` tags" and "`loading=lazy` on below-fold
  images" — moot, since the site has zero `<img>` elements to apply either to.

### Technical Implementation
```html
<!-- Actual pattern used sitewide (see any page's <head>) -->
<link rel="preconnect" href="https://www.googletagmanager.com">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="preload" as="style" href="https://fonts.googleapis.com/css2?family=DM+Sans:...&display=swap">
<link href="https://fonts.googleapis.com/css2?family=DM+Sans:...&display=swap" rel="stylesheet" media="print" onload="this.media='all'">
<noscript><link href="https://fonts.googleapis.com/css2?family=DM+Sans:...&display=swap" rel="stylesheet"></noscript>
<meta name="theme-color" content="#f7f9fc">
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
- A/B test: Short 3-field form vs current 5-field form (confirmed current: name, phone, email, postcode,
  reason-for-selling — 5 real fields, matching the stated baseline)
- Test: "Get Cash Offer" vs "Get Free Valuation" vs "Request Callback" CTA copy
- Add social proof near form: "247 homeowners contacted us this month" (illustrative copy — do not ship a
  specific number without a real, current source; see the EEAT "needs verification" list in §7)
- "We respond within 2 hours" is already shown prominently near the form sitewide ✓ — still outstanding:
  office hours (08:00-20:00 Mon-Fri, 09:00-17:00 Sat) exist only in JSON-LD `openingHoursSpecification`, not
  as visible on-page text anywhere

### WhatsApp First Strategy
- WhatsApp float button visible on all pages (desktop) ✓
- Persistent mobile contact bar (call + WhatsApp) replaces the float on screens ≤768px ✓
- Nav has a Call button on desktop; no WhatsApp button in the header itself (WhatsApp lives in the floating
  button, mobile contact bar, and hero/page CTAs instead)
- WhatsApp as primary CTA in urgent pages (repossession) ✓
- Pre-filled WhatsApp message text ✓ — personalized per page (names the specific location, and the
  situation too on combo pages), not a single generic message
- Track WhatsApp clicks separately from form submissions in GA4 (not yet instrumented — see §12)

### Trust Trigger Sequencing
Homepage scroll order (current — the boroughs-grid section that used to sit before FAQ was removed on request,
since it duplicated the locations hub without adding conversion value on the homepage itself):
1. Hero (what we do + form) — immediate conversion opportunity
2. Stats bar — credibility
3. Who we help — identification
4. How it works — education
5. Comparison table — rational case
6. Testimonials — social proof
7. Trust signals — authority (NAPB/TPO/ICO credentials)
8. FAQ — objection handling
9. CTA band — final conversion push

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
- Colour contrast: blue accent on light background meets AA (site redesigned from dark/gold to light/blue) ✓
- Form labels explicitly linked to inputs ✓
- N/A: no `<img>` elements exist sitewide (icons are emoji/inline SVG with `aria-hidden`/`aria-label` as
  appropriate) — nothing to alt-text

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
- **Pending**: review indexing + Performance data (impressions/clicks/position) for the 8 postcode-pilot pages
  and their 56 combo pages, filtered to `/locations/n1`, `/locations/e1`, `/locations/se1`, `/locations/sw11`,
  `/locations/w10`, `/locations/nw3`, `/locations/e8`, `/locations/se22` and subpaths, compared against a
  similar-age borough page (e.g. Croydon) for context — this determines whether the postcode approach (§2
  Tier 3b) gets extended to more postcodes/outer London or stays a one-off pilot. No Search Console access
  from this environment, so this has to be pulled and shared manually.

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

*Strategy document prepared for rapidhousebuyer.co.uk. Review quarterly. Last synced to live site: 2026-09-07
(128 base location pages + 896 Service x Location combo pages, including an 8-postcode inner-London pilot with
its own 56 combo pages; England & Wales positioning; GTM/dataLayer analytics; light/blue site redesign).*
