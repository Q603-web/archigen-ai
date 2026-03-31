"use client";

import { useState } from "react";
import { Search, SlidersHorizontal } from "lucide-react";

import { tools, categories } from "@/lib/data";
import { ToolCard } from "@/components/ToolCard";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { ScrollReveal, StaggerReveal } from "@/components/ScrollReveal";

export default function ToolsDirectory() {
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredTools = tools
    .filter((tool) => {
      const matchesCategory =
        activeCategory === "all" || tool.categoryId === activeCategory;
      const matchesSearch =
        tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tool.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    })
    .sort((a, b) => b.rating - a.rating);

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <main className="flex-grow pt-16 pb-28">
        <div className="container mx-auto px-4 md:px-8">
          {/* Header */}
          <ScrollReveal className="mb-14">
            <p className="text-xs text-blue-400 tracking-[0.2em] uppercase font-semibold mb-4">
              Directory
            </p>
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-5 tracking-tight font-heading">
              AI Tools Directory
            </h1>
            <p className="text-slate-500 text-lg max-w-2xl">
              The industry&apos;s most comprehensive database of artificial
              intelligence tools for architects and designers. Sorted by
              practitioner ratings.
            </p>
          </ScrollReveal>

          {/* Stats + Search Bar */}
          <ScrollReveal delay={0.1}>
            <div
              className="glass-card rounded-xl p-5 md:p-6 mb-10 flex flex-wrap items-center justify-between gap-6"
            >
              <div className="flex items-center gap-8">
                <div>
                  <div className="text-[10px] text-slate-600 font-medium tracking-[0.15em] uppercase mb-1">
                    Total Tools
                  </div>
                  <div className="text-2xl font-bold text-white font-heading">
                    {tools.length}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-600 font-medium tracking-[0.15em] uppercase mb-1">
                    Categories
                  </div>
                  <div className="text-2xl font-bold text-white font-heading">
                    {categories.length}
                  </div>
                </div>
                <div className="hidden sm:block">
                  <div className="text-[10px] text-slate-600 font-medium tracking-[0.15em] uppercase mb-1">
                    Top Rated
                  </div>
                  <div className="text-2xl font-bold text-emerald-400 font-heading">
                    4.9
                  </div>
                </div>
              </div>

              <div className="relative w-full md:w-80">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  placeholder="Search tools..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-10 rounded-lg bg-white/5 border pl-10 pr-4 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all"
                  style={{ borderColor: "var(--border-subtle)" }}
                />
              </div>
            </div>
          </ScrollReveal>

          {/* Filters */}
          <ScrollReveal delay={0.15}>
            <div className="flex flex-wrap gap-2 mb-10">
              <Button
                variant={activeCategory === "all" ? "gradient" : "glass"}
                size="sm"
                onClick={() => setActiveCategory("all")}
                className="rounded-lg text-xs font-medium"
              >
                All Tools
              </Button>

              {categories.map((cat) => (
                <Button
                  key={cat.id}
                  variant={activeCategory === cat.id ? "gradient" : "glass"}
                  size="sm"
                  onClick={() => setActiveCategory(cat.id)}
                  className="rounded-lg text-xs font-medium"
                >
                  <span className="mr-1">{cat.icon}</span>
                  <span className="hidden sm:inline">{cat.name}</span>
                </Button>
              ))}
            </div>
          </ScrollReveal>

          {/* Grid */}
          {filteredTools.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {filteredTools.map((tool) => (
                <ToolCard key={tool.id} tool={tool} />
              ))}
            </div>
          ) : (
            <div className="text-center py-24 glass-card rounded-xl border-dashed">
              <h3 className="text-xl font-bold text-white mb-2 font-heading">
                No tools found
              </h3>
              <p className="text-slate-500 text-sm">
                Try adjusting your category filter or search query.
              </p>
              <Button
                variant="glass"
                className="mt-6 rounded-lg"
                onClick={() => {
                  setSearchQuery("");
                  setActiveCategory("all");
                }}
              >
                Clear Filters
              </Button>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
