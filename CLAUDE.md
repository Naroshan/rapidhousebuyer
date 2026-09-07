# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository state (important)

The site's source files (`index.html`, `css/`, `js/`, `pages/`, `locations/`, etc.) are committed directly
at the repo root — there is no `package.json` and no build tooling. Edit files in place; there is no
zip/package step required before committing.

Note: this repo previously stored the site as a single zipped deploy archive
(`deploy-*.zip`) instead of extracted source. That archive was extracted and committed directly to `main`
after it became clear Netlify's continuous deployment builds straight from this repo's root — shipping the
zip (with no `index.html` at root) produced a live 404 on the production site. Do not reintroduce a
zip-only repo state; keep the actual site files committed.

## What the site is

Rapid House Buyer (rapidhousebuyer.co.uk) — a marketing site for a UK cash property-buying business
(London boroughs + M25 corridor). It is a **static HTML/CSS/JS site with no framework, no bundler, and no
package manager** — every page is hand-authored HTML with shared `css/` and `js/` assets. It's deployed to
Netlify (see `_headers` / `_redirects` at the site root).

### Site structure

```
index.html                 Homepage
sitemap.xml, robots.txt, llms.txt
_headers, _redirects        Netlify config (security headers, caching, non-www redirect)
seo-strategy.md             SEO/content strategy notes (keyword clusters, internal linking plan)
css/
  main.css                  Production stylesheet actually linked from every page's <head> (all 1,047 HTML
                             files). The original stylesheet is one ~30KB minified line (line 1) — most of
                             the site's actual CSS rules live there, so grep/read that line specifically
                             rather than assuming `wc -l`'s line count reflects where the rules are. Fixes
                             and new rules added since (the light/blue redesign overrides, the locations-hub
                             directory styling, region-block-banner, mobile-contact-bar) were appended as
                             their own readable lines rather than minified into line 1 — prefer that pattern
                             (a new appended block, not a rewrite of line 1) for further changes, since :root
                             custom-property redeclarations later in the cascade override earlier ones
                             regardless of source line
  pages.css                 Minified per-page-type overrides, linked alongside main.css — not just on
                             `pages/*.html` as the name suggests, but also on all 896 combo pages
                             (`locations/{slug}/{situation}.html`) and the blog posts (918 files total).
                             Redeclares its own `:root` subset (colours, fonts) that takes precedence over
                             main.css's on every page that loads both, since it's linked second — keep the
                             two in sync when changing shared tokens (this bit both files during the
                             light/blue redesign and had to be fixed in each separately)
  style.css, global.css     Stale/unused — use a different, non-matching class naming convention
                             (dash-case `.footer-grid` etc. vs. the BEM `.footer__grid` etc. actually used in
                             the HTML) and are not `<link>`ed from any page. Edit main.css/pages.css directly
                             (append a new readable block rather than minifying into the existing line) rather
                             than these files.
js/main.js                  All interactive behavior (nav scroll state, hamburger menu, FAQ accordion, etc.),
                             wrapped in a single DOMContentLoaded handler, vanilla JS, ES5-style (var, function)
pages/                      Secondary pages: about, contact, faq, how-it-works, services, and one page per
                             "situation" (repossession, probate, landlords, debt, divorce, urgent-sale,
                             relocation), plus locations.html (hub), blog.html (Property Insights hub — card
                             grid linking to blog/*.html, not an article itself), legal pages (privacy, terms,
                             cookies, complaints)
locations/                  One HTML page per London borough + notable sub-area (~60 pages) plus ~60 M25-corridor
                             town pages across Hertfordshire, Essex, Kent, Surrey, Buckinghamshire and Berkshire,
                             plus 8 pilot postcode-district pages (see "Postcode pilot" below) — 128 base location
                             pages total, e.g. locations/hackney.html, locations/watford.html, locations/sw11.html.
                             These follow a shared structural template, but each carries genuinely distinct
                             per-location data (prices, transport, landmarks, testimonial, seller-profile copy)
                             rather than a pure name find/replace — see gen/towns_data.py and gen/generate.py for
                             the M25 town-page generator and its source data.
locations/{slug}/           Service x Location combo pages — one per situation (repossession, probate, landlords,
                             debt, urgent-sale, divorce, relocation) for every base location, e.g.
                             locations/croydon/repossession.html, locations/sw11/repossession.html. 128 locations
                             x 7 situations = 896 pages, all generated (not hand-authored) by gen/generate_combo.py
                             from gen/situations_data.py — see "Generators" below before editing any of these by
                             hand, since a direct edit will be silently overwritten by the next regeneration.
blog/                       One HTML page per blog post (e.g. blog/how-fast-can-you-sell-a-house-uk.html),
                             linked from the pages/blog.html hub. Each carries Article + BreadcrumbList JSON-LD
                             with an Organization (not named-person) author — no named individual with real
                             credentials exists on the site to attribute posts to; do not invent one.
```

### Content architecture

- **Topical clusters**: homepage + how-it-works/about/faq/services form the core cluster; each "situation"
  page (repossession, probate, landlords, debt, divorce, urgent-sale, relocation) is its own cluster with
  cross-links back to `how-it-works.html` and `faq.html`. See `seo-strategy.md` for the full internal-linking
  and keyword-targeting plan — consult it before adding/renaming pages or changing URL structure.
- **Location pages** (`locations/*.html`) are near-identical templates swapping in borough/area name, so when
  fixing a bug or changing shared markup/copy on one location page, check whether the same change is needed
  across all of them. The 120 borough/sub-area/M25-town pages are static, hand-duplicated files (not
  regenerated from `gen/generate.py` — see "Generators" below for why); the 8 postcode-pilot pages *are*
  generator-produced from `gen/generate_postcodes.py` and should be edited via that generator, not by hand.
- **Structured data**: JSON-LD in `<head>` on effectively every page (1,046 of 1,047 HTML files carry
  `BreadcrumbList`). The homepage is the one exception that bundles everything into a single `"@graph"` array
  (`LocalBusiness`, `WebSite`+`SearchAction`, `FAQPage`); every other page — all 128 base location pages, all
  896 combo pages, the situation/blog/legal pages — instead emits 2-3 separate `<script type="application/
  ld+json">` blocks (typically `FAQPage`, `LocalBusiness`, `BreadcrumbList`), not a single `@graph`. Don't
  assume the `@graph` pattern when copying homepage head markup to another page. Keep NAP (name/address/phone)
  and business details consistent across pages when editing.
- **Analytics**: Google Tag Manager is installed on every page — the loader script inline in `<head>` plus a
  `<noscript>` iframe right after the opening `<body>` tag, container ID `GTM-ML5MZDK3`. Preserve both
  snippets and the container ID when copying/editing head/body markup. GTM does not expose a global `gtag()`
  function, so don't call `gtag(...)` from page JS — push events to `window.dataLayer` instead (see below).
  All actual tag config (Google Ads conversion tag, GA4, triggers) lives in the GTM container itself
  (tagmanager.google.com), not in this repo. The homepage's enquiry form (and each `locations/*.html` copy of
  it) pushes `{event:'generate_lead', event_category:'Lead'}` to `window.dataLayer` on successful submission —
  keep that event name in sync with whatever trigger/tag is configured against it in GTM.

### Postcode pilot (inner London)

In addition to the 120 borough/sub-area/M25-town location pages, there are 8 pilot pages targeting inner-London
postcode-district search intent directly (e.g. "sell house fast SW11") rather than area names: `n1`, `e1`, `se1`,
`sw11`, `w10`, `nw3`, `e8`, `se22` (see `locations/sw11.html` etc.). This was modelled on a competitor's location-page
architecture, where postcode-sector pages were the single largest page bucket. Each postcode page:

- Is generated by `gen/generate_postcodes.py` from data in `gen/postcode_pilot_data.py` (area name, compass region,
  parent borough, an indicative average price, transport, and a short description of the real neighbourhoods the
  postcode covers) — edit the data file and re-run the generator rather than hand-editing the HTML.
- Links back to its parent borough page (e.g. SW11 → `battersea.html`), and the parent borough's own "Nearby Areas
  We Cover" pill row links forward to it (added by hand, not the generator — see the git history for which 8
  borough pages carry a `{CODE} postcode` pill).
- Has its own full Service x Location combo set (all 7 situations), generated the same way as any other location
  via `gen/generate_combo.py` — postcode pages are indistinguishable from borough pages as far as that generator
  is concerned, since it reads location data out of the BreadcrumbList schema / hero label / average-price markup
  rather than assuming a specific location-page template.
- Is listed in `sitemap.xml` and in the full situation-grouped directory on `pages/locations.html` (see below).

This is a deliberately small, explicitly-labelled pilot — not yet extended to more postcodes or outer-London areas.
A Search Console check (indexing + impressions/clicks for these 64 URLs vs. a comparable borough page) was
scheduled for ~3 weeks after launch to inform whether to scale it up; if you're asked to expand the postcode
approach, check whether that data has been reviewed first.

### Generators (`gen/`)

Several parts of `locations/` are generated from data files rather than hand-authored — running the wrong one, or
hand-editing generated output, will either be silently clobbered on the next run or drift out of sync with its
siblings:

- `gen/generate.py` + `gen/towns_data.py` — the 60 M25-corridor town pages. `TOWNS` is a dict keyed by slug with
  descriptive field names (`m25_junction`, `distance_miles`, `rental_yield`, `testimonial_*`), matching the
  convention below — not the list-of-dicts-with-a-repeated-slug-field shape it used to be.
- `gen/generate_combo.py` + `gen/situations_data.py` — the 896 Service x Location combo pages
  (`locations/{slug}/{situation}.html`) for every base location (boroughs, sub-areas, M25 towns, and the 8
  postcode-pilot pages alike). Usage: `python3 gen/generate_combo.py <location-slug> [...]` or `--all` to
  regenerate every location's combo set. Pulls each location's name/zone/price straight out of its own
  `locations/{slug}.html` page, so it stays in sync automatically as long as that page's BreadcrumbList schema,
  hero label, and price markup follow the existing conventions.
- `gen/generate_postcodes.py` + `gen/postcode_pilot_data.py` — the 8 postcode-pilot base pages (see above).

All three embed the current site design directly in their Python template strings (colours, font stack, page
structure) rather than relying solely on `css/main.css` — if the sitewide design changes again, these generators
need the same treatment or they'll start shipping pages in the old look. This has already happened once: the
initial dark/gold-themed generators were missed by the light/blue redesign and had to be patched separately
before generating any new pages.

## Working conventions

- No build/lint/test commands exist for this project — it's static files served as-is. Validate changes by
  opening the HTML directly or serving the repo root (e.g. `python3 -m http.server`).
- Keep new/edited pages consistent with the existing head boilerplate (favicons, meta description, canonical,
  Open Graph/Twitter tags, JSON-LD) found in `index.html` and `pages/*.html`.
