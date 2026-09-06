# -*- coding: utf-8 -*-
"""
Generates locations/[place]/[situation].html combo pages — the Service x
Location matrix for programmatic SEO. Pulls real per-location data (name,
zone/county, avg prices) straight out of the existing locations/[place].html
page rather than re-templating it, and combines it with the reusable
situation content in situations_data.py.

Usage: python3 gen/generate_combo.py <location-slug> [<location-slug> ...]
       python3 gen/generate_combo.py --all
"""
import os, re, sys, html as htmllib
sys.path.insert(0, os.path.dirname(__file__))
from situations_data import SITUATIONS, SITUATION_LABELS

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
LOCATIONS_DIR = os.path.join(ROOT, "locations")

FONT_URL = "https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600;9..40,700&display=swap"


def extract_location_data(slug):
    path = os.path.join(LOCATIONS_DIR, f"{slug}.html")
    html = open(path, encoding="utf-8").read()

    # Name: pull from the BreadcrumbList schema's position-3 entry -- this is
    # the one field that's consistent across all three location-page template
    # generations the site has accumulated (rich borough pages, sub-area
    # pages, M25-town generator pages).
    name_m = re.search(r'"position":3,"name":"([^"]+)"', html)
    if not name_m:
        raise ValueError(f"Could not extract name for {slug}")
    name = name_m.group(1).strip()

    # Zone/region: try the explicit Zone:/County: sidebar label first, then
    # the hero label (used on sub-area pages, e.g. "West London — Ealing"),
    # then fall back to a generic phrase.
    zone_m = re.search(r'(?:Zone|County):</strong>\s*([^<]+)', html)
    if zone_m:
        zone = zone_m.group(1).strip()
    else:
        label_m = re.search(r'page-hero__label">([^<]+)</div>', html)
        zone = label_m.group(1).strip() if label_m else "the surrounding area"

    # Price: try the flat/house pair first (rich borough + M25 town pages),
    # then fall back to the single "Average Property Price" figure used on
    # sub-area pages.
    flat_m = re.search(r'Avg flat:</strong>\s*([^<]+)', html)
    house_m = re.search(r'Avg house:</strong>\s*([^<]+)', html)
    flat = flat_m.group(1).strip() if flat_m else None
    house = house_m.group(1).strip() if house_m else None
    single_price = None
    if not (flat and house):
        single_m = re.search(r'Average Property Price[^£]*£([\d,]+)', html)
        if single_m:
            single_price = f"£{single_m.group(1)}"

    return {"slug": slug, "name": name, "zone": zone, "flat": flat, "house": house, "single_price": single_price}


def render_faq_schema(faq_pairs):
    import json
    entities = [{"@type": "Question", "name": q, "acceptedAnswer": {"@type": "Answer", "text": a}} for q, a in faq_pairs]
    return json.dumps({"@context": "https://schema.org", "@type": "FAQPage", "mainEntity": entities}, ensure_ascii=False, separators=(",", ":"))


def render_local_business_schema(loc, sit_slug, url):
    import json
    desc = f"Rapid House Buyer purchases properties in {loc['name']} for cash, including situations requiring a fast sale such as {SITUATION_LABELS[sit_slug].lower()}. Same-day valuation, 24-hour exchange, zero fees."
    obj = {
        "@context": "https://schema.org", "@type": "LocalBusiness", "@id": url, "name": "Rapid House Buyer",
        "url": url, "telephone": "+442071991698", "email": "enquiries@rapidhousebuyer.co.uk",
        "address": {"@type": "PostalAddress", "streetAddress": "30 St Mary Axe", "addressLocality": "London", "postalCode": "EC3A 8BF", "addressCountry": "GB"},
        "areaServed": {"@type": "AdministrativeArea", "name": loc["name"]},
        "description": desc, "priceRange": "££",
        "sameAs": ["https://www.facebook.com/profile.php?id=61590900291698&locale=en_GB"],
    }
    return json.dumps(obj, ensure_ascii=False, separators=(",", ":"))


def render_breadcrumb_schema(loc, sit):
    import json
    obj = {
        "@context": "https://schema.org", "@type": "BreadcrumbList",
        "itemListElement": [
            {"@type": "ListItem", "position": 1, "name": "Home", "item": "https://rapidhousebuyer.co.uk"},
            {"@type": "ListItem", "position": 2, "name": "Locations", "item": "https://rapidhousebuyer.co.uk/pages/locations"},
            {"@type": "ListItem", "position": 3, "name": loc["name"], "item": f"https://rapidhousebuyer.co.uk/locations/{loc['slug']}"},
            {"@type": "ListItem", "position": 4, "name": sit["label"], "item": f"https://rapidhousebuyer.co.uk/locations/{loc['slug']}/{loc['_sit_slug']}"},
        ],
    }
    return json.dumps(obj, ensure_ascii=False, separators=(",", ":"))


PAGE_TEMPLATE = """<!DOCTYPE html>
<html lang="en-GB">
<head>
<!-- Google Tag Manager -->
<script>(function(w,d,s,l,i){{w[l]=w[l]||[];w[l].push({{'gtm.start':
new Date().getTime(),event:'gtm.js'}});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
}})(window,document,'script','dataLayer','GTM-ML5MZDK3');</script>
<!-- End Google Tag Manager -->

<meta charset="UTF-8">
<link rel="icon" type="image/x-icon" href="/favicon.ico">
<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32.png">
<link rel="icon" type="image/png" sizes="192x192" href="/favicon-192.png">
<meta name="theme-color" content="#f7f9fc">
<meta name="viewport" content="width=device-width,initial-scale=1.0">
<title>{meta_title}</title>
<meta name="description" content="{meta_desc}">
<meta name="robots" content="index,follow">
<link rel="canonical" href="https://rapidhousebuyer.co.uk/locations/{loc_slug}/{sit_slug}">
  <link rel="alternate" hreflang="en-GB" href="https://rapidhousebuyer.co.uk/locations/{loc_slug}/{sit_slug}">
<script type="application/ld+json">{faq_schema}</script>
<link rel="preconnect" href="https://www.googletagmanager.com">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="preload" as="style" href="{font_url}">
<link href="{font_url}" rel="stylesheet" media="print" onload="this.media='all'">
<noscript><link href="{font_url}" rel="stylesheet"></noscript>
<link rel="stylesheet" href="/css/main.css">
<link rel="stylesheet" href="/css/pages.css">
<script type="application/ld+json">{local_business_schema}</script>

  <meta property="og:type"        content="website">
  <meta property="og:url"         content="https://rapidhousebuyer.co.uk/locations/{loc_slug}/{sit_slug}">
  <meta property="og:title"       content="{meta_title}">
  <meta property="og:description" content="{meta_desc}">
  <meta property="og:image"       content="https://rapidhousebuyer.co.uk/favicon-512.png">
  <meta property="og:image:width" content="512">
  <meta property="og:image:height"content="512">
  <meta property="og:site_name"   content="Rapid House Buyer">
  <meta name="twitter:card"        content="summary">
  <meta name="twitter:site"        content="@rapidhousebuyer">
  <meta name="twitter:title"       content="{meta_title}">
  <meta name="twitter:description" content="{meta_desc}">
  <meta name="twitter:image"       content="https://rapidhousebuyer.co.uk/favicon-512.png">
<script type="application/ld+json">{breadcrumb_schema}</script>
</head>
<body>
<!-- Google Tag Manager (noscript) -->
<noscript><iframe src="https://www.googletagmanager.com/ns.html?id=GTM-ML5MZDK3"
height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>
<!-- End Google Tag Manager (noscript) -->

<header class="site-header">
  <div class="header-inner">
    <a href="/" class="logo__main">Rapid <em>House</em> Buyer<span class="logo__sub">Cash Property Buyers &middot; England &amp; Wales</span></a>
    <nav style="display:flex;gap:1.5rem;font-size:.825rem;">
      <a href="/pages/how-it-works" style="color:#4b5563;text-decoration:none;">How It Works</a>
      <a href="/pages/about" style="color:#4b5563;text-decoration:none;">About</a>
      <a href="/pages/contact" style="color:#4b5563;text-decoration:none;">Contact</a>
    </nav>
  </div>
</header>
<main>
  <div class="page-hero">
    <div class="container">
      <p style="font-size:.75rem;color:#2563eb;margin-bottom:.5rem;"><a href="/locations/{loc_slug}" style="color:#2563eb;text-decoration:none;">&larr; {loc_name}</a></p>
      <h1>{h1}</h1>
      <p class="lead">{lead}</p>
      <a href="/#valuation-form" class="btn btn--primary">Get a Free Cash Offer</a>
      <a href="https://wa.me/442071991698" class="btn btn--wa" target="_blank">WhatsApp Us</a>
    </div>
  </div>
  <div class="content-section">
    <div class="container">
      <p>{local_para}</p>
{sections_html}
      <h2>Frequently Asked Questions</h2>
{faq_html}
      <p>To get started, <a href="/#valuation-form" style="color:#2563eb;">request your free cash offer</a> or call us on <a href="tel:+442071991698" style="color:#2563eb;">020 7199 1698</a>.</p>
    </div>
  </div>

{local_facts_html}

  <div class="content-section" style="padding:1.5rem 0 1rem;">
    <div class="container">
      <p style="font-size:.75rem;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:#2563eb;margin-bottom:.875rem;">Other Situations We Help With in {loc_name}</p>
      <div style="display:flex;flex-wrap:wrap;gap:.625rem;">
{related_pills}
      </div>
    </div>
  </div>

  <div class="content-section" style="padding:1.5rem 0 2rem;">
    <div class="container">
      <p style="font-size:.75rem;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:#2563eb;margin-bottom:.875rem;">More on {sit_label}</p>
      <div style="display:flex;flex-wrap:wrap;gap:.625rem;">
        <a href="/pages/{sit_slug}" style="display:inline-block;padding:7px 14px;background:#ffffff;border:1px solid rgba(37,99,235,.2);border-radius:9999px;font-size:.775rem;font-weight:500;color:#2563eb;text-decoration:none;">{sit_label} &mdash; Full Guide</a>
        <a href="/locations/{loc_slug}" style="display:inline-block;padding:7px 14px;background:#ffffff;border:1px solid rgba(37,99,235,.2);border-radius:9999px;font-size:.775rem;font-weight:500;color:#2563eb;text-decoration:none;">All {loc_name} Services</a>
        <a href="/pages/locations" style="display:inline-block;padding:7px 14px;background:rgba(37,99,235,.1);border:1px solid rgba(37,99,235,.35);border-radius:9999px;font-size:.775rem;font-weight:500;color:#2563eb;text-decoration:none;">All Locations &rarr;</a>
      </div>
    </div>
  </div>
</main>
<footer class="site-footer">
  <div class="container">
    <div class="footer__grid">
      <div class="footer__brand">
        <div class="footer__logo">Rapid House Buyer</div>
        <div class="footer__tagline">Cash Property Buyers &middot; England &amp; Wales</div>
        <p class="footer__about">Direct cash buyer purchasing residential properties across England and Wales. In-house surveyors, same-day valuations, 24-hour exchange.</p>
        <div class="footer__contacts">
          <a href="tel:+442071991698" class="footer__contact">&#128222; 020 7199 1698</a>
          <a href="https://wa.me/442071991698" class="footer__contact" target="_blank" rel="noopener">&#128172; WhatsApp</a>
          <a href="mailto:enquiries@rapidhousebuyer.co.uk" class="footer__contact">&#9993;&#65039; enquiries@rapidhousebuyer.co.uk</a>
          <span class="footer__contact">&#128205; 30 St Mary Axe, London EC3A 8BF</span>
        </div>
        <div class="footer__social">
          <a href="https://www.facebook.com/profile.php?id=61590900291698&locale=en_GB" class="footer__social-link" target="_blank" rel="noopener" aria-label="Rapid House Buyer on Facebook">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M22 12.06C22 6.5 17.52 2 12 2S2 6.5 2 12.06c0 5 3.66 9.15 8.44 9.94v-7.03H7.9v-2.91h2.54V9.85c0-2.51 1.49-3.9 3.77-3.9 1.09 0 2.23.2 2.23.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56v1.89h2.78l-.44 2.91h-2.34V22c4.78-.79 8.44-4.94 8.44-9.94z"/></svg>
          </a>
        </div>
      </div>
      <div><h3 class="footer__col-title">Services</h3><nav><a href="/pages/services" class="footer__link">Sell Property Fast</a><a href="/pages/repossession" class="footer__link">Facing Repossession</a><a href="/pages/probate" class="footer__link">Probate Properties</a><a href="/pages/landlords" class="footer__link">Landlord Exit</a><a href="/pages/debt" class="footer__link">Selling Due to Debt</a><a href="/pages/urgent-sale" class="footer__link">Urgent Sale</a><a href="/pages/divorce" class="footer__link">Divorce Sale</a><a href="/pages/relocation" class="footer__link">Relocation Sale</a></nav></div>
      <div><h3 class="footer__col-title">Key Areas</h3><nav><a href="/locations/camden" class="footer__link">Camden</a><a href="/locations/hackney" class="footer__link">Hackney</a><a href="/locations/islington" class="footer__link">Islington</a><a href="/locations/lambeth" class="footer__link">Lambeth</a><a href="/locations/southwark" class="footer__link">Southwark</a><a href="/locations/tower-hamlets" class="footer__link">Tower Hamlets</a><a href="/locations/wandsworth" class="footer__link">Wandsworth</a><a href="/pages/locations" class="footer__link">All 120+ Locations &rarr;</a></nav></div>
      <div><h3 class="footer__col-title">Company</h3><nav><a href="/pages/about" class="footer__link">About Us</a><a href="/pages/how-it-works" class="footer__link">How It Works</a><a href="/pages/faq" class="footer__link">FAQ</a><a href="/pages/blog" class="footer__link">Property Insights</a><a href="/pages/contact" class="footer__link">Contact</a><a href="/pages/privacy" class="footer__link">Privacy Policy</a><a href="/pages/cookies" class="footer__link">Cookie Policy</a><a href="/pages/terms" class="footer__link">Terms</a></nav></div>
    </div>
    <div class="footer__bottom">
      <div class="footer__legal"><p>&copy; <span id="footerYear"></span> Rapid House Buyer, a trading style of The LeadGenCo LTD. Registered in England &amp; Wales No. 17274904. 30 St Mary Axe, London EC3A 8BF.</p><p>NAPB Member &middot; TPO Registered &middot; ICO Registered. Not FCA regulated. We typically offer 75&ndash;85% of open market value. We encourage independent legal and financial advice. <a href="/pages/privacy">Privacy</a> &middot; <a href="/pages/cookies">Cookies</a> &middot; <a href="/pages/complaints">Complaints</a></p></div>
      <div class="footer__badges"><span class="footer__badge">&#127942; NAPB</span><span class="footer__badge">&#10003; TPO</span><span class="footer__badge">&#128274; ICO</span></div>
    </div>
  </div>
</footer>
<div class="mobile-contact-bar">
  <a href="tel:+442071991698" class="mobile-contact-bar__btn mobile-contact-bar__btn--call">&#128222; Call Now</a>
  <a href="https://wa.me/442071991698?text=Hi+I'd+like+a+free+cash+offer" class="mobile-contact-bar__btn mobile-contact-bar__btn--wa" target="_blank" rel="noopener">&#128172; WhatsApp</a>
</div>
<script>var fy=document.getElementById('footerYear'); if(fy) fy.textContent=new Date().getFullYear();</script>
</body>
</html>
"""


def render_page(loc_slug, sit_slug):
    loc = extract_location_data(loc_slug)
    loc["_sit_slug"] = sit_slug
    sit = SITUATIONS[sit_slug]

    def fmt(s):
        return s.format(place=loc["name"], zone=loc["zone"])

    sections_html = "\n".join(
        f'      <h2>{fmt(h2)}</h2>\n      <p>{fmt(p)}</p>' for h2, p in sit["sections"]
    )
    faq_html = "\n".join(
        f'      <p><strong>{q}</strong> {a}</p>' for q, a in sit["faq"]
    )
    local_facts_html = ""
    if loc["flat"] and loc["house"]:
        local_facts_html = f'''  <section class="section section--charcoal" style="padding:1.5rem 0">
    <div class="container">
      <div class="local-facts">
        <div class="local-fact"><div class="local-fact__val">{loc["flat"]}</div><div class="local-fact__lbl">Avg Flat Price in {loc["name"]}</div></div>
        <div class="local-fact"><div class="local-fact__val">{loc["house"]}</div><div class="local-fact__lbl">Avg House Price in {loc["name"]}</div></div>
      </div>
    </div>
  </section>'''
    elif loc.get("single_price"):
        local_facts_html = f'''  <section class="section section--charcoal" style="padding:1.5rem 0">
    <div class="container">
      <div class="local-facts">
        <div class="local-fact"><div class="local-fact__val">{loc["single_price"]}</div><div class="local-fact__lbl">Average Property Price in {loc["name"]}</div></div>
      </div>
    </div>
  </section>'''

    related_pills = "\n".join(
        f'        <a href="/locations/{loc_slug}/{r}" style="display:inline-block;padding:7px 14px;background:#ffffff;border:1px solid rgba(37,99,235,.2);border-radius:9999px;font-size:.775rem;font-weight:500;color:#2563eb;text-decoration:none;">{SITUATION_LABELS[r]} in {loc["name"]}</a>'
        for r in sit["related"]
    )

    faq_schema = render_faq_schema([(q, a) for q, a in sit["faq"]])
    lb_schema = render_local_business_schema(loc, sit_slug, f"https://rapidhousebuyer.co.uk/locations/{loc_slug}/{sit_slug}")
    bc_schema = render_breadcrumb_schema(loc, sit)

    return PAGE_TEMPLATE.format(
        meta_title=fmt(sit["meta_title"]), meta_desc=fmt(sit["meta_desc"]),
        loc_slug=loc_slug, sit_slug=sit_slug, loc_name=loc["name"], sit_label=sit["label"],
        h1=fmt(sit["h1"]), lead=fmt(sit["lead"]), local_para=fmt(sit["local_para"]),
        sections_html=sections_html, faq_html=faq_html, local_facts_html=local_facts_html,
        related_pills=related_pills, font_url=FONT_URL,
        faq_schema=faq_schema, local_business_schema=lb_schema, breadcrumb_schema=bc_schema,
    )


def generate_for_location(loc_slug):
    out_dir = os.path.join(LOCATIONS_DIR, loc_slug)
    os.makedirs(out_dir, exist_ok=True)
    for sit_slug in SITUATIONS:
        html = render_page(loc_slug, sit_slug)
        with open(os.path.join(out_dir, f"{sit_slug}.html"), "w", encoding="utf-8") as f:
            f.write(html)
    print(f"Generated 7 combo pages for {loc_slug}")


if __name__ == "__main__":
    args = sys.argv[1:]
    if not args:
        print("Usage: generate_combo.py <location-slug> [...] | --all")
        sys.exit(1)
    if args == ["--all"]:
        for fname in sorted(os.listdir(LOCATIONS_DIR)):
            if fname.endswith(".html"):
                generate_for_location(fname[:-5])
    else:
        for slug in args:
            generate_for_location(slug)
