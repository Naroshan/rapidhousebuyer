// Blocks contact channels (phone, email, WhatsApp, enquiry form) for visitors
// outside the United Kingdom. Country-level geolocation is the most reliable
// signal Netlify's edge network provides — it cannot dependably distinguish
// England/Wales from Scotland/Northern Ireland, so the whole UK is allowed.
const ALLOWED_COUNTRY = "GB";

// Countries fully blocked from the site (not just contact channels), covering
// every region/state within them — geolocation only resolves to country level.
const FULLY_BLOCKED_COUNTRIES = ["IN"]; // India

const BANNER_HTML = `<div class="region-block-banner" role="alert">
  Rapid House Buyer currently only operates within the United Kingdom, so we're unable to
  take enquiries or offer our cash-buying service from your region. If you believe this is a
  mistake, please email <a href="mailto:enquiries@rapidhousebuyer.co.uk">enquiries@rapidhousebuyer.co.uk</a>.
</div>`;

const BLOCKED_PAGE_HTML = `<!doctype html>
<html lang="en-GB">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1.0">
<meta name="robots" content="noindex,nofollow">
<title>Not Available in Your Region | Rapid House Buyer</title>
<style>
  body{margin:0;min-height:100vh;display:flex;align-items:center;justify-content:center;
    background:#f7f9fc;color:#1f2937;font-family:'DM Sans',-apple-system,'Segoe UI',sans-serif;
    text-align:center;padding:2rem}
  .box{max-width:480px}
  h1{font-family:'DM Sans',-apple-system,sans-serif;font-size:1.6rem;font-weight:600;
    margin-bottom:1rem;color:#111827}
  p{font-size:.95rem;line-height:1.7;color:#4b5563}
  a{color:#2563eb}
</style>
</head>
<body>
  <div class="box">
    <h1>Rapid House Buyer</h1>
    <p>This service operates within the United Kingdom only and is not available in your
    region. If you believe you're seeing this in error, contact
    <a href="mailto:enquiries@rapidhousebuyer.co.uk">enquiries@rapidhousebuyer.co.uk</a>.</p>
  </div>
</body>
</html>`;

export default async (request, context) => {
  const countryCode = context.geo?.country?.code;

  if (countryCode && FULLY_BLOCKED_COUNTRIES.includes(countryCode)) {
    return new Response(BLOCKED_PAGE_HTML, {
      status: 403,
      headers: { "content-type": "text/html; charset=utf-8" },
    });
  }

  const response = await context.next();

  const contentType = response.headers.get("content-type") || "";
  if (!contentType.includes("text/html")) {
    return response;
  }

  const isBlocked = Boolean(countryCode) && countryCode !== ALLOWED_COUNTRY;
  if (!isBlocked) {
    return response;
  }

  let html = await response.text();
  html = html.replace(/<html([^>]*)>/i, (match, attrs) => {
    if (/data-region-blocked=/.test(attrs)) return match;
    return `<html${attrs} data-region-blocked="true">`;
  });
  html = html.replace(/<body([^>]*)>/i, (match, attrs) => `<body${attrs}>${BANNER_HTML}`);

  return new Response(html, {
    status: response.status,
    headers: response.headers,
  });
};

export const config = {
  path: "/*",
  excludedPath: [
    "/css/*",
    "/js/*",
    "/*.png",
    "/*.ico",
    "/*.xml",
    "/*.txt",
  ],
};
