"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { ScrollReveal, Parallax } from "@/components/ScrollReveal";

export default function AboutPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <main className="flex-grow pt-32 pb-32">
        <div className="container mx-auto px-6 md:px-10 max-w-4xl">
          {/* Header */}
          <ScrollReveal className="mb-32">
            <p className="text-[11px] text-slate-600 tracking-[0.2em] uppercase font-medium mb-8">
              About
            </p>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white font-heading tracking-tight leading-[0.95] mb-10">
              Tools for Architects
              <br />
              <span className="text-slate-500">Who Actually Build</span>
            </h1>
            <p className="text-lg text-slate-500 max-w-2xl leading-relaxed">
              We&apos;re cutting through the noise of the AI hype cycle to bring
              you the tools that actually work in professional practice.
            </p>
          </ScrollReveal>

          {/* Why — Typographic statement */}
          <ScrollReveal className="mb-32">
            <div className="border-l-2 border-blue-500/30 pl-8 md:pl-12">
              <p className="text-[11px] text-slate-600 tracking-[0.2em] uppercase font-medium mb-6">
                Why We Exist
              </p>
              <div className="space-y-6 text-base text-slate-400 leading-[1.85]">
                <p>
                  The AI tool landscape for architects is overwhelming. Over 50+
                  new tools launched in the last year alone, each promising to
                  revolutionize the industry.
                </p>
                <p>
                  The problem? Most directories are generic aggregators built by
                  marketers. They list everything without context, leaving
                  practitioners to figure out what actually works through painful
                  trial and error.
                </p>
                <p className="text-white text-xl md:text-2xl font-heading font-semibold leading-snug">
                  We built ArchiGen AI to be the single source of truth for
                  architectural AI adoption.
                </p>
              </div>
            </div>
          </ScrollReveal>

          {/* Values — Minimal list */}
          <ScrollReveal className="mb-32">
            <p className="text-[11px] text-slate-600 tracking-[0.2em] uppercase font-medium mb-10">
              Core Values
            </p>
            <div className="space-y-12">
              {[
                {
                  title: "Independence",
                  desc: "We don't accept paid placements. If a tool is featured, it's because we tested it and believe it's useful.",
                },
                {
                  title: "Practicality",
                  desc: "We evaluate tools based on their utility in actual schematic design, DD, CD, and visualization phases.",
                },
                {
                  title: "Community",
                  desc: "The directory is continually refined based on submissions and feedback from practicing architects.",
                },
              ].map((value, i) => (
                <div
                  key={i}
                  className="border-t pt-8"
                  style={{ borderColor: "var(--border-subtle)" }}
                >
                  <h3 className="text-xl md:text-2xl font-bold text-white font-heading mb-3">
                    {value.title}
                  </h3>
                  <p className="text-[15px] text-slate-500 leading-relaxed max-w-xl">
                    {value.desc}
                  </p>
                </div>
              ))}
            </div>
          </ScrollReveal>

          {/* Origin */}
          <ScrollReveal className="mb-32 relative">
            <Parallax
              className="absolute -right-20 top-0 w-[300px] h-[300px] pointer-events-none"
              speed={0.1}
            >
              <div className="w-full h-full bg-violet-600/[0.04] blur-[80px] rounded-full" />
            </Parallax>

            <p className="text-[11px] text-slate-600 tracking-[0.2em] uppercase font-medium mb-10 relative z-10">
              Origin
            </p>
            <h2 className="text-3xl md:text-5xl font-bold text-white font-heading leading-[1.15] mb-8 relative z-10">
              Built by Vista Studios.
              <br />
              <span className="text-slate-500">
                An architectural visualization practice
              </span>
              <br />
              that uses these tools daily.
            </h2>
            <p className="text-base text-slate-500 max-w-xl leading-relaxed relative z-10">
              Every review, every workflow guide, every rating comes from hands-on
              experience with real client projects. Not marketing copy.
            </p>
          </ScrollReveal>

          {/* CTA */}
          <ScrollReveal>
            <div
              className="border-t pt-16 flex flex-col md:flex-row md:items-center md:justify-between gap-8"
              style={{ borderColor: "var(--border-subtle)" }}
            >
              <h3 className="text-2xl md:text-3xl font-bold text-white font-heading">
                Ready to find the right tool?
              </h3>
              <div className="flex items-center gap-8">
                <Link
                  href="/tools"
                  className="group text-[13px] font-medium text-white hover:text-blue-200 flex items-center gap-2 transition-colors duration-300"
                >
                  Browse Directory
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
                </Link>
                <Link
                  href="/blog"
                  className="group text-[13px] font-medium text-slate-500 hover:text-white flex items-center gap-2 transition-colors duration-300"
                >
                  Read Journal
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
                </Link>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </main>

      <Footer />
    </div>
  );
}
