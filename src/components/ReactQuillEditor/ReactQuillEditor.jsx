
"use client";

import ReactQuill from "react-quill-new";
import Quill from "quill";

import "react-quill-new/dist/quill.snow.css";
import styles from "./ReactQuillEditor.module.scss";

// Register custom font sizes
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

const formats = [
  "size",
  "bold",
  "italic",
  "underline",
  "strike",
];

const modules = {
  toolbar: [
    [{ size: Size.whitelist }],
    ["bold", "italic", "underline"],
  ],
};



const MAX_POST_LEN = 1000;

export default function ReactQuillEditor({ postText, setPostText }) {

  return (
    <ReactQuill
      theme="snow"
      className={`${styles.createPostInput} ${
        postText.length > MAX_POST_LEN
          ? styles.createPostInputError
          : ""
      }`}
      value={postText}
      onChange={setPostText}
      modules={modules}
      formats={formats}
      placeholder="What's on your mind?"
    />
  );
}