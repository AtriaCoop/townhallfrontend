const LEADING_PUNCTUATION = /^[([{'"]+/;
const TRAILING_PUNCTUATION = /[).,!?;:'"\]}]+$/;
const URL_PATTERN =
  /^(?:https?:\/\/)?(?:www\.)?[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*\.[a-zA-Z]{2,}(?::\d+)?(?:\/[a-zA-Z0-9\-._~:/?#[\]@!$&'()*+,;=%]*)?$/i;

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

    if (candidate && URL_PATTERN.test(candidate)) {
      const href = /^https?:\/\//i.test(candidate)
        ? candidate
        : `https://${candidate}`;
      return { type: "link", value: candidate, href, leading, trailing };
    }

    return { type: "text", value: token };
  });
}
