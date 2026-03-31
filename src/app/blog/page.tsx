import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { articles } from "@/lib/blog";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { BlogList } from "@/components/BlogList";

export default function BlogPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <main className="flex-grow pt-24 pb-32">
        <div className="container mx-auto px-4 md:px-8 max-w-5xl">
          {/* Header */}
          <div className="mb-24">
            <p className="text-xs text-slate-500 tracking-[0.2em] uppercase font-medium mb-6">
              Journal
            </p>
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold text-white tracking-tight font-heading leading-[0.9] mb-8">
              Insights
            </h1>
            <p className="text-lg text-slate-500 max-w-xl leading-relaxed">
              Practitioner-written guides, tool comparisons, and industry
              analysis. No fluff.
            </p>
          </div>

          <BlogList articles={articles} />
        </div>
      </main>

      <Footer />
    </div>
  );
}
