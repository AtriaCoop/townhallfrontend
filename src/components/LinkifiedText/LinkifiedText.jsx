import { Fragment } from "react";
import { linkifyText } from "@/utils/linkify";

export default function LinkifiedText({ text }) {
  return linkifyText(text).map((segment, i) => {
    if (segment.type === "link") {
      return (
        <Fragment key={i}>
          {segment.leading}
          <a href={segment.href} target="_blank" rel="noopener noreferrer">
            {segment.value}
          </a>
          {segment.trailing}
        </Fragment>
      );
    }
    return <Fragment key={i}>{segment.value}</Fragment>;
  });
}
