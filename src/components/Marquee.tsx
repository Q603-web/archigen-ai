"use client";

import { useRef, useEffect } from "react";
import { tools } from "@/lib/data";

export function Marquee() {
  const scrollerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!scrollerRef.current) return;
    const scrollerContent = Array.from(scrollerRef.current.children);
    scrollerContent.forEach((item) => {
      const duplicatedItem = item.cloneNode(true) as HTMLElement;
      duplicatedItem.setAttribute("aria-hidden", "true");
      scrollerRef.current?.appendChild(duplicatedItem);
    });
  }, []);

  return (
    <div className="w-full relative overflow-hidden border-y py-5" style={{ borderColor: "var(--border-subtle)", background: "var(--surface)" }}>
      <div className="absolute left-0 top-0 bottom-0 w-32 z-10 bg-gradient-to-r from-[#030712] to-transparent pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-32 z-10 bg-gradient-to-l from-[#030712] to-transparent pointer-events-none" />

      <div
        ref={scrollerRef}
        className="flex gap-12 min-w-max animate-marquee whitespace-nowrap px-8 items-center"
      >
        {tools.map((tool) => (
          <div
            key={tool.id}
            className="flex items-center gap-2.5 opacity-30 hover:opacity-80 transition-opacity duration-500 cursor-pointer"
          >
            <div className="w-7 h-7 rounded-md bg-white/5 border border-white/10 flex items-center justify-center font-semibold text-[10px] text-slate-400 uppercase">
              {tool.name.charAt(0)}
            </div>
            <span className="font-medium text-sm text-slate-400 tracking-wide">
              {tool.name}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
