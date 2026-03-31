"use client";

import { ScrollReveal } from "./ScrollReveal";

interface ArticleContentProps {
  content: string;
}

export function ArticleContent({ content }: ArticleContentProps) {
  // Simple markdown-like rendering for article content
  const sections = content.split("\n\n").filter(Boolean);

  return (
    <ScrollReveal>
      <div className="space-y-6">
        {sections.map((block, i) => {
          const trimmed = block.trim();

          // H2
          if (trimmed.startsWith("## ")) {
            return (
              <h2
                key={i}
                className="text-2xl md:text-3xl font-bold text-white font-heading mt-16 mb-6 first:mt-0"
              >
                {trimmed.replace("## ", "")}
              </h2>
            );
          }

          // H3
          if (trimmed.startsWith("### ")) {
            return (
              <h3
                key={i}
                className="text-xl font-semibold text-white font-heading mt-10 mb-4"
              >
                {trimmed.replace("### ", "")}
              </h3>
            );
          }

          // Bold verdict lines
          if (trimmed.startsWith("**") && trimmed.endsWith("**")) {
            return (
              <p
                key={i}
                className="text-white font-semibold text-base border-l-2 border-blue-500/40 pl-5 py-2"
              >
                {trimmed.replace(/\*\*/g, "")}
              </p>
            );
          }

          // List items (lines starting with - or numbered)
          if (
            trimmed.includes("\n-") ||
            trimmed.startsWith("- ") ||
            trimmed.startsWith("1.")
          ) {
            const items = trimmed.split("\n").filter(Boolean);
            return (
              <ul key={i} className="space-y-3 my-6">
                {items.map((item, j) => (
                  <li
                    key={j}
                    className="text-slate-400 leading-relaxed text-[15px] flex items-start gap-3"
                  >
                    <span className="text-blue-500/60 mt-1.5 text-xs">&#9679;</span>
                    <span>{item.replace(/^[-\d.]\s*/, "")}</span>
                  </li>
                ))}
              </ul>
            );
          }

          // Regular paragraph
          return (
            <p
              key={i}
              className="text-slate-400 leading-[1.85] text-[15px]"
            >
              {trimmed.split("**").map((part, j) =>
                j % 2 === 1 ? (
                  <strong key={j} className="text-white font-medium">
                    {part}
                  </strong>
                ) : (
                  part
                )
              )}
            </p>
          );
        })}
      </div>
    </ScrollReveal>
  );
}
