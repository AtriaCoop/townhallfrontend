import { RICH_TEXT_DETECTOR, SANITIZE_OPTIONS } from "@/constants/richText";
import parse from "html-react-parser";

export function isRichText(text) {
  return RICH_TEXT_DETECTOR.test(text);
}

// Sanitizes the HTML (allowlist only), then converts it to React elements.
// Works on both the server and the client, so there is no flash on hydration.
export function RichText({ html }) {
  return <>{parse(sanitizeHtml(html, SANITIZE_OPTIONS))}</>;
}

// Plain text paragraphs with auto-linked URLs
export function PlainText({ paragraphs }) {
  return paragraphs.map((paragraph, i) => (
    <p key={i}>
      {paragraph.split(/(\s+)/).map((part, j) =>
        /^https?:\/\/\S+$/.test(part) ? (
          <a key={j} href={part} target="_blank" rel="noopener noreferrer">
            {part}
          </a>
        ) : (
          part
        ),
      )}
    </p>
  ));
}