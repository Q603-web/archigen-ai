import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { articles, getArticle } from "@/lib/blog";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { ArticleContent } from "@/components/ArticleContent";

export function generateStaticParams() {
  return articles.map((article) => ({
    slug: article.slug,
  }));
}

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const article = getArticle(slug);

  if (!article) {
    notFound();
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <main className="flex-grow pt-16 pb-32">
        <div className="container mx-auto px-4 md:px-8 max-w-3xl">
          <Link
            href="/blog"
            className="inline-flex items-center text-sm text-slate-600 hover:text-white mb-16 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Journal
          </Link>

          {/* Article Header */}
          <header className="mb-16">
            <div className="flex items-center gap-4 mb-8">
              <span className="text-[11px] text-slate-600 font-mono tracking-wide">
                {new Date(article.date).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </span>
              <span className="text-[11px] text-blue-400/70 tracking-wide uppercase font-medium">
                {article.category}
              </span>
              <span className="text-[11px] text-slate-600 font-mono">
                {article.readTime}
              </span>
            </div>

            <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold text-white font-heading tracking-tight leading-[1.05] mb-8">
              {article.title}
            </h1>

            <p className="text-lg text-slate-400 leading-relaxed">
              {article.excerpt}
            </p>
          </header>

          {/* Divider */}
          <div
            className="w-16 h-px mb-16"
            style={{ background: "var(--border-subtle)" }}
          />

          {/* Article Body */}
          <ArticleContent content={article.content} />

          {/* Tags */}
          <div className="mt-20 pt-10 border-t" style={{ borderColor: "var(--border-subtle)" }}>
            <div className="flex flex-wrap gap-2">
              {article.tags.map((tag) => (
                <span
                  key={tag}
                  className="text-[10px] text-slate-600 border rounded-full px-3 py-1 tracking-wide uppercase"
                  style={{ borderColor: "var(--border-subtle)" }}
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
