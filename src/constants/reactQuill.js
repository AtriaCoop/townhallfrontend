import Quill from "quill";

// Register the font sizes available in the editor.
const Size = Quill.import("attributors/style/size");
Size.whitelist = [
  "10px",
  "12px",
  "14px",
  "16px",
  "18px",
  "20px",
  "24px",
  "28px",
  "32px",
];
Quill.register(Size, true);

// Define supported formatting options and toolbar buttons.
export const formats = ["size", "bold", "italic", "underline", "strike"];

export const modules = {
  toolbar: [
    [{ size: Size.whitelist }],
    ["bold", "italic", "underline", "strike"],
  ],
};