// Blocks contact channels (phone, email, WhatsApp, enquiry form) for visitors
// outside the United Kingdom. Country-level geolocation is the most reliable
// signal Netlify's edge network provides — it cannot dependably distinguish
// England/Wales from Scotland/Northern Ireland, so the whole UK is allowed.
const ALLOWED_COUNTRY = "GB";

const BANNER_HTML = `<div class="region-block-banner" role="alert">
  Rapid House Buyer currently only operates within the United Kingdom, so we're unable to
  take enquiries or offer our cash-buying service from your region. If you believe this is a
  mistake, please email <a href="mailto:enquiries@rapidhousebuyer.co.uk">enquiries@rapidhousebuyer.co.uk</a>.
</div>`;

export default async (request, context) => {
  const response = await context.next();

  const contentType = response.headers.get("content-type") || "";
  if (!contentType.includes("text/html")) {
    return response;
  }

  const countryCode = context.geo?.country?.code;
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
