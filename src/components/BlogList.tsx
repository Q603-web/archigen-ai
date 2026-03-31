"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { Article } from "@/lib/blog";
import { StaggerReveal } from "./ScrollReveal";

interface BlogListProps {
  articles: Article[];
  limit?: number;
}

export function BlogList({ articles, limit }: BlogListProps) {
  const items = limit ? articles.slice(0, limit) : articles;

  return (
    <StaggerReveal className="divide-y divide-white/[0.06]" stagger={0.08}>
      {items.map((article) => (
        <Link
          key={article.slug}
          href={`/blog/${article.slug}`}
          className="group block py-10 first:pt-0 last:pb-0"
        >
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
            <div className="flex-grow max-w-2xl">
              <div className="flex items-center gap-4 mb-4">
                <span className="text-[11px] text-slate-600 font-mono tracking-wide">
                  {new Date(article.date).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </span>
                <span className="text-[11px] text-blue-400/70 tracking-wide uppercase font-medium">
                  {article.category}
                </span>
              </div>

              <h2 className="text-xl md:text-2xl font-bold text-white font-heading mb-3 group-hover:text-blue-100 transition-colors duration-300 leading-tight">
                {article.title}
              </h2>

              <p className="text-sm text-slate-500 leading-relaxed line-clamp-2">
                {article.excerpt}
              </p>
            </div>

            <div className="flex items-center gap-2 text-slate-600 group-hover:text-white transition-colors duration-300 shrink-0 mt-2 md:mt-6">
              <span className="text-xs font-medium">{article.readTime}</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
            </div>
          </div>
        </Link>
      ))}
    </StaggerReveal>
  );
}
