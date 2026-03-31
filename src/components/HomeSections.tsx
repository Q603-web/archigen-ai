"use client";

import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  ArrowUpRight,
  Zap,
  Eye,
  BookOpen,
} from "lucide-react";

import { ToolCard } from "./ToolCard";
import { Button } from "./ui/button";
import {
  ScrollReveal,
  StaggerReveal,
  CountUp,
  Parallax,
} from "./ScrollReveal";
import { Tool, Category } from "@/lib/data";

interface HomeSectionsProps {
  featuredTools: Tool[];
  topRatedTools: Tool[];
  categories: Category[];
}

export function HomeSections({
  featuredTools,
  topRatedTools,
  categories,
}: HomeSectionsProps) {
  return (
    <>
      {/* HOW IT WORKS */}
      <section className="py-28 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid opacity-30 pointer-events-none" />
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-blue-900/5 to-transparent pointer-events-none" />

        <div className="container mx-auto px-4 md:px-8 relative z-10">
          <ScrollReveal className="text-center mb-20">
            <p className="text-xs text-blue-400 tracking-[0.2em] uppercase font-semibold mb-4">
              Simple Process
            </p>
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-5 font-heading">
              Three Steps to the Right Tool
            </h2>
            <p className="text-slate-500 max-w-xl mx-auto">
              Your streamlined path from discovery to mastery.
            </p>
          </ScrollReveal>

          <StaggerReveal
            className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto"
            stagger={0.15}
          >
            {[
              {
                step: "01",
                title: "Discover",
                desc: "Browse our curated directory of AI tools tested on real architecture projects.",
                icon: <Eye className="w-5 h-5" />,
              },
              {
                step: "02",
                title: "Compare",
                desc: "Read honest reviews, pricing details, and side-by-side comparisons.",
                icon: <BookOpen className="w-5 h-5" />,
              },
              {
                step: "03",
                title: "Master",
                desc: "Follow workflow guides and tutorials from industry practitioners.",
                icon: <Zap className="w-5 h-5" />,
              },
            ].map((item, i) => (
              <div
                key={i}
                className="glass-card glass-card-hover p-8 rounded-2xl relative overflow-hidden group"
              >
                <div className="absolute -right-4 -top-4 text-8xl font-bold text-white/[0.02] transition-all duration-500 group-hover:text-white/[0.05] group-hover:scale-110 font-heading">
                  {item.step}
                </div>
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 mb-5 group-hover:bg-blue-500/20 transition-colors">
                  {item.icon}
                </div>
                <h3 className="text-xl font-semibold text-white mb-3 font-heading">
                  {item.title}
                </h3>
                <p className="text-slate-500 text-sm leading-relaxed">
                  {item.desc}
                </p>
              </div>
            ))}
          </StaggerReveal>
        </div>
      </section>

      {/* FEATURED TOOLS */}
      <section className="py-28" style={{ background: "var(--background-alt)" }}>
        <div className="container mx-auto px-4 md:px-8">
          <ScrollReveal>
            <div className="flex flex-col md:flex-row justify-between items-end mb-14">
              <div>
                <p className="text-xs text-blue-400 tracking-[0.2em] uppercase font-semibold mb-4">
                  Curated Selection
                </p>
                <h2 className="text-3xl md:text-5xl font-bold text-white mb-4 font-heading">
                  Featured Tools
                </h2>
                <p className="text-slate-500 max-w-lg">
                  The most essential AI capabilities for modern architectural
                  workflows.
                </p>
              </div>
              <Link
                href="/tools"
                className="group flex items-center gap-2 text-blue-400 font-medium mt-6 md:mt-0 text-sm hover:text-blue-300 transition-colors"
              >
                View All Tools
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </ScrollReveal>

          <StaggerReveal
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
            stagger={0.08}
          >
            {featuredTools.map((tool) => (
              <ToolCard key={tool.id} tool={tool} />
            ))}
          </StaggerReveal>
        </div>
      </section>

      {/* PROBLEM / SOLUTION + CATEGORIES */}
      <section className="py-28 relative overflow-hidden">
        <Parallax
          className="absolute left-0 bottom-0 w-[500px] h-[500px] pointer-events-none"
          speed={-0.2}
        >
          <div className="w-full h-full bg-blue-600/8 blur-[120px] rounded-full mix-blend-screen" />
        </Parallax>

        <div className="container mx-auto px-4 md:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center mb-28">
            <ScrollReveal x={-30} y={0}>
              <div>
                <p className="text-xs text-blue-400 tracking-[0.2em] uppercase font-semibold mb-4">
                  Why ArchiGen
                </p>
                <h2 className="text-3xl md:text-5xl font-bold text-white mb-8 font-heading leading-tight">
                  Cut Through
                  <br />
                  the Noise
                </h2>
                <div className="glass-card p-6 rounded-xl border-l-2 border-l-red-500/50 mb-8">
                  <p className="text-slate-300 text-sm font-medium leading-relaxed">
                    &ldquo;50+ AI tools launched in 2024 alone. 67% of firms
                    cite tool overload as a barrier to adoption.&rdquo;
                  </p>
                </div>
                <p className="text-slate-500 mb-10 leading-relaxed">
                  We are the single source of truth&mdash;providing curated
                  reviews, pragmatic workflow guides, and practical prompt
                  libraries built by architects who use these tools daily.
                </p>
                <ul className="space-y-4">
                  {[
                    "No sponsored placements",
                    "Tested on real project phases",
                    "Clear pricing breakdowns",
                  ].map((benefit, i) => (
                    <li
                      key={i}
                      className="flex items-center gap-3 text-slate-300 text-sm"
                    >
                      <CheckCircle2 className="text-emerald-500 w-4 h-4 flex-shrink-0" />
                      {benefit}
                    </li>
                  ))}
                </ul>
              </div>
            </ScrollReveal>

            <StaggerReveal
              className="grid grid-cols-2 gap-4"
              stagger={0.12}
            >
              {categories.slice(0, 4).map((cat) => (
                <div
                  key={cat.id}
                  className="glass-card glass-card-hover p-7 rounded-xl text-center flex flex-col items-center justify-center group cursor-pointer"
                >
                  <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform duration-300">
                    {cat.icon}
                  </div>
                  <h4 className="font-heading font-semibold text-white mb-2 text-sm">
                    {cat.name}
                  </h4>
                  <span className="text-[10px] text-blue-400 bg-blue-500/8 px-2 py-1 rounded-full font-medium">
                    {cat.toolCount} Tools
                  </span>
                </div>
              ))}
            </StaggerReveal>
          </div>
        </div>
      </section>

      {/* TOP RATED */}
      <section className="py-28" style={{ background: "var(--background-alt)" }}>
        <div className="container mx-auto px-4 md:px-8">
          <ScrollReveal className="text-center mb-14">
            <p className="text-xs text-amber-400 tracking-[0.2em] uppercase font-semibold mb-4">
              Community Favorites
            </p>
            <h2 className="text-3xl md:text-5xl font-bold text-white font-heading">
              Highest Rated by Architects
            </h2>
          </ScrollReveal>

          <StaggerReveal
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
            stagger={0.08}
          >
            {topRatedTools.map((tool) => (
              <ToolCard key={tool.id} tool={tool} />
            ))}
          </StaggerReveal>
        </div>
      </section>

      {/* BUILT FOR */}
      <section className="py-28 border-t" style={{ borderColor: "var(--border-subtle)" }}>
        <div className="container mx-auto px-4 md:px-8">
          <ScrollReveal className="text-center mb-16">
            <p className="text-xs text-blue-400 tracking-[0.2em] uppercase font-semibold mb-4">
              Who It&apos;s For
            </p>
            <h2 className="text-3xl md:text-5xl font-bold text-white font-heading">
              Built for Practice, Not Theory
            </h2>
          </ScrollReveal>

          <StaggerReveal
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5"
            stagger={0.1}
          >
            {[
              {
                title: "Architects",
                desc: "Streamline design visualization and concept iteration.",
              },
              {
                title: "Interior Designers",
                desc: "Rapidly test materials, lighting, and moodboards.",
              },
              {
                title: "Students",
                desc: "Learn the industry-standard AI tools and stay competitive.",
              },
              {
                title: "Firms",
                desc: "Evaluate and adopt the right tech stack efficiently.",
              },
            ].map((persona, i) => (
              <div
                key={i}
                className="glass-card glass-card-hover p-7 rounded-xl border-t-2 border-t-blue-500/40 group"
              >
                <h3 className="text-lg font-bold text-white mb-2 font-heading group-hover:text-blue-100 transition-colors">
                  {persona.title}
                </h3>
                <p className="text-sm text-slate-500 leading-relaxed">
                  {persona.desc}
                </p>
              </div>
            ))}
          </StaggerReveal>
        </div>
      </section>

      {/* NEWSLETTER CTA */}
      <section className="py-28 relative overflow-hidden">
        <Parallax
          className="absolute right-0 top-0 w-[400px] h-[400px] pointer-events-none"
          speed={0.15}
        >
          <div className="w-full h-full bg-violet-600/10 blur-[100px] rounded-full mix-blend-screen" />
        </Parallax>

        <div className="container mx-auto px-4 md:px-8 relative z-10">
          <ScrollReveal className="max-w-2xl mx-auto text-center">
            <p className="text-xs text-violet-400 tracking-[0.2em] uppercase font-semibold mb-4">
              Newsletter
            </p>
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-6 font-heading">
              Stay Ahead of the Curve
            </h2>
            <p className="text-slate-500 mb-10 max-w-lg mx-auto">
              Join architects getting our top 5 tool picks + one deep-dive
              tutorial every week. No spam, just signal.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <input
                type="email"
                placeholder="name@firm.com"
                className="flex-grow h-12 rounded-xl bg-white/5 border px-5 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 text-sm transition-all"
                style={{ borderColor: "var(--border-subtle)" }}
              />
              <Button
                variant="gradient"
                className="h-12 px-8 rounded-xl font-semibold shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 transition-shadow"
              >
                Subscribe
                <ArrowRight className="w-4 h-4 ml-1.5" />
              </Button>
            </div>
          </ScrollReveal>
        </div>
      </section>
    </>
  );
}
