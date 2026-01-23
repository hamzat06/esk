import React from "react";

export function highlightText(text: string, query: string) {
  if (!query) return text;

  const regex = new RegExp(`(${query})`, "ig");

  return text.split(regex).map((part, i) =>
    part.match(regex) ? (
      <mark
        key={i}
        className="bg-yellow-200 text-black rounded px-0.5"
      >
        {part}
      </mark>
    ) : (
      part
    ),
  );
}
