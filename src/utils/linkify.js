const LEADING_PUNCTUATION = /^[([{'"]+/;
const TRAILING_PUNCTUATION = /[).,!?;:'"\]}]+$/;
const URL_PATTERN =
  /^(?:https?:\/\/)?(?:www\.)?[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*\.[a-zA-Z]{2,}(?::\d+)?(?:\/[a-zA-Z0-9\-._~:/?#[\]@!$&'()*+,;=%]*)?$/i;

// Text without "http(s)://" or "www." is only linked when it ends in one of
// these TLDs, so "home.Then" or "notes.txt" stay plain text.
// Two-letter TLDs that are also common English words (me, us, in, it, to...)
// are left out on purpose so "call.Me" isn't linked.
const COMMON_TLDS = new Set([
  "com", "org", "net", "edu", "gov", "info", "biz",
  "io", "co", "ai", "app", "dev", "tech", "xyz",
  "news", "blog", "shop", "store", "online", "site",
  "coop", "ca", "uk", "jp", "au", "de", "fr", "tv",
]);

function isLikelyUrl(candidate) {
  if (!URL_PATTERN.test(candidate)) return false;
  if (/^(?:https?:\/\/|www\.)/i.test(candidate)) return true;

  const host = candidate.split(/[/:?#]/)[0];
  const tld = host.slice(host.lastIndexOf(".") + 1).toLowerCase();
  return COMMON_TLDS.has(tld);
}

export function linkifyText(text) {
  return text.split(/(\s+)/).map((token) => {
    if (!token || /^\s+$/.test(token)) {
      return { type: "text", value: token };
    }

    const leadingMatch = token.match(LEADING_PUNCTUATION);
    const leading = leadingMatch ? leadingMatch[0] : "";
    const rest = token.slice(leading.length);

    const trailingMatch = rest.match(TRAILING_PUNCTUATION);
    const trailing = trailingMatch ? trailingMatch[0] : "";
    const candidate = trailing ? rest.slice(0, -trailing.length) : rest;

    if (candidate && isLikelyUrl(candidate)) {
      const href = /^https?:\/\//i.test(candidate)
        ? candidate
        : `https://${candidate}`;
      return { type: "link", value: candidate, href, leading, trailing };
    }

    return { type: "text", value: token };
  });
}
