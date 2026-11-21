/* -------------------------------------------------------------------------- */
/*  Rich text helpers                                                         */
/* -------------------------------------------------------------------------- */

export const RICH_TEXT_TAGS = [
  "p",
  "br",
  "strong",
  "b",
  "em",
  "i",
  "u",
  "s",
  "strike",
  "span",
  "ol",
  "ul",
  "li",
  "blockquote",
];

// Matches the first opening rich-text tag, e.g. "<p", "<strong", "<br"
export const RICH_TEXT_DETECTOR = new RegExp(`<(?:${RICH_TEXT_TAGS.join("|")})\\b`, "i");

export const SANITIZE_OPTIONS = {
  allowedTags: RICH_TEXT_TAGS,
  allowedAttributes: { span: ["style"] },
  allowedStyles: {
    span: {
      "font-size": [/^(10|12|14|16|18|20|24|28|32)px$/],
    },
  },
};