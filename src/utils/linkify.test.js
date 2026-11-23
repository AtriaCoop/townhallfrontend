import { describe, expect, it } from "vitest";
import { linkifyText } from "@/utils/linkify";

// Returns just the parts of the text that were detected as links.
const linksIn = (text) =>
  linkifyText(text)
    .filter((segment) => segment.type === "link")
    .map((segment) => segment.value);

describe("linkifyText", () => {
  describe("detects URLs", () => {
    it.each([
      ["Check google.com", "google.com"],
      ["Google.COM rocks", "Google.COM"],
      ["bbc.co.uk/news", "bbc.co.uk/news"],
      ["atria.ca:8080/page?x=1", "atria.ca:8080/page?x=1"],
    ])("links schemeless text with a common TLD: %s", (text, expected) => {
      expect(linksIn(text)).toEqual([expected]);
    });

    it("links anything starting with http(s):// regardless of TLD", () => {
      expect(linksIn("see https://home.then/x")).toEqual([
        "https://home.then/x",
      ]);
    });

    it("links anything starting with www. regardless of TLD", () => {
      expect(linksIn("www.example.xyz/path")).toEqual(["www.example.xyz/path"]);
    });
  });

  describe("does not treat ordinary text as URLs", () => {
    it.each([
      // Missing space after a period (reported in review on #86)
      "I went home.Then I slept",
      "Great event.See you",
      "Hello.World",
      // File names
      "Open notes.txt",
      "readme.md",
      "photo.zip",
      // Two-letter TLDs that are also English words are excluded on purpose
      "call.Me later",
      // Numbers and normal punctuation
      "version 1.5 is out",
      "end of sentence. Next",
    ])("%s", (text) => {
      expect(linksIn(text)).toEqual([]);
    });
  });

  describe("link segments", () => {
    it("adds https:// to the href of schemeless links", () => {
      const [link] = linkifyText("google.com");
      expect(link).toMatchObject({ type: "link", href: "https://google.com" });
    });

    it("keeps the original scheme in the href", () => {
      const [link] = linkifyText("http://example.com");
      expect(link.href).toBe("http://example.com");
    });

    it("strips surrounding punctuation from the link", () => {
      const link = linkifyText("(github.com/AtriaCoop).").find(
        (segment) => segment.type === "link",
      );
      expect(link).toMatchObject({
        value: "github.com/AtriaCoop",
        leading: "(",
        trailing: ").",
      });
    });

    it("keeps the full original text when segments are joined back", () => {
      const text = "Visit (google.com), then home.Then  rest.";
      const joined = linkifyText(text)
        .map((segment) =>
          segment.type === "link"
            ? segment.leading + segment.value + segment.trailing
            : segment.value,
        )
        .join("");
      expect(joined).toBe(text);
    });
  });
});
