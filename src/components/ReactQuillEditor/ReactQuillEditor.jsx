"use client";

import { useEffect, useRef } from "react";
import ReactQuill from "react-quill-new";
import Quill from "quill";

import "react-quill-new/dist/quill.snow.css";
import styles from "./ReactQuillEditor.module.scss";

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
const formats = ["size", "bold", "italic", "underline", "strike"];

const modules = {
  toolbar: [
    [{ size: Size.whitelist }],
    ["bold", "italic", "underline", "strike"],
  ],
};

export default function ReactQuillEditor({
  className,
  hasError = false,
  onChange,
  onEditorReady,
  onFocus,
  placeholder,
  postText,
}) {
  // Reference to the ReactQuill instance.
  const editorRef = useRef(null);

  useEffect(() => {
    const editor = editorRef.current?.getEditor();
    if (!editor) return;

    const insertText = (text) => {
      // Insert at the cursor, or before Quill's final newline if no cursor exists.
      const range = editor.getSelection(true);
      const index = range?.index ?? editor.getLength() - 1;

      editor.insertText(index, text, "user");

      // Move the cursor to the end of the inserted text.
      editor.setSelection(index + text.length, 0, "silent");
    };

    onEditorReady(insertText);
    return () => onEditorReady(null);
  }, [onEditorReady]);

  return (
    <ReactQuill
      ref={editorRef}
      theme="snow"
      // Apply default styles, optional custom styles, and error styling.
      className={`${styles.createPostInput} ${className || ""} ${hasError ? styles.createPostInputError : ""}`}
      value={postText}
      // Send HTML and plain text to the parent when the content changes.
      onChange={(html, _delta, _source, editor) =>
        onChange(html, editor.getText())
      }
      onFocus={onFocus}
      modules={modules}
      formats={formats}
      placeholder={placeholder}
    />
  );
}