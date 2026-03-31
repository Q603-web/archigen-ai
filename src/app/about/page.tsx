"use client";

import Link from "next/link";
import { ArrowRight, CheckCircle2, Shield, Eye, Zap } from "lucide-react";

import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { ScrollReveal, StaggerReveal, CountUp } from "@/components/ScrollReveal";

export default function AboutPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <main className="flex-grow pt-20 pb-28">
        <div className="container mx-auto px-4 md:px-8 max-w-4xl">
          {/* Header */}
          <ScrollReveal className="text-center mb-24">
            <p className="text-xs text-blue-400 tracking-[0.2em] uppercase font-semibold mb-6">
              Our Story
            </p>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-8 tracking-tight font-heading leading-[0.95]">
              Tools for Architects
              <br className="hidden md:block" />
              <span className="text-gradient">Who Actually Build</span>
            </h1>
            <p className="text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
              We&apos;re cutting through the noise of the AI hype cycle to bring
              you the tools that actually work in professional practice.
            </p>
          </ScrollReveal>

          {/* Why We Exist */}
          <ScrollReveal className="mb-24">
            <div className="glass-card rounded-2xl p-8 md:p-12 border-l-2 border-l-blue-500/50 relative overflow-hidden">
              <div className="absolute right-0 top-0 w-64 h-64 bg-blue-500/8 blur-[80px] rounded-full mix-blend-screen pointer-events-none" />

              <h2 className="text-3xl font-bold text-white mb-8 relative z-10 font-heading">
                Why We Exist
              </h2>
              <div className="space-y-5 text-slate-400 relative z-10 leading-relaxed">
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
                <p className="text-white font-medium text-lg">
                  We built ArchiGen AI to be the single source of truth for
                  architectural AI adoption.
                </p>
              </div>
            </div>
          </ScrollReveal>

          {/* Stats */}
          <ScrollReveal className="mb-24">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
              {[
                { value: 20, suffix: "+", label: "Curated Tools" },
                { value: 8, suffix: "", label: "Categories" },
                { value: 100, suffix: "%", label: "Architect Tested" },
                { value: 0, suffix: "", label: "Sponsored Picks", prefix: "" },
              ].map((stat, i) => (
                <div
                  key={i}
                  className="glass-card rounded-xl p-6 text-center"
                >
                  <div className="text-3xl font-bold text-white mb-1 font-heading">
                    {stat.value === 0 ? (
                      "Zero"
                    ) : (
                      <CountUp
                        end={stat.value}
                        suffix={stat.suffix}
                        prefix={stat.prefix}
                      />
                    )}
                  </div>
                  <div className="text-[10px] text-slate-500 tracking-[0.15em] uppercase font-medium">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </ScrollReveal>

          {/* Mission */}
          <div className="mb-24">
            <ScrollReveal className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-white font-heading">
                Our Mission
              </h2>
            </ScrollReveal>

            <StaggerReveal
              className="grid grid-cols-1 md:grid-cols-3 gap-5"
              stagger={0.12}
            >
              {[
                {
                  title: "Curate",
                  desc: "Hand-pick tools that have been rigorously tested on real-world architectural projects.",
                  icon: <Eye className="w-5 h-5" />,
                },
                {
                  title: "Educate",
                  desc: "Provide clear tutorials, pragmatic workflows, and honest side-by-side comparisons.",
                  icon: <Shield className="w-5 h-5" />,
                },
                {
                  title: "Accelerate",
                  desc: "Help firms adopt AI confidently without wasting time on the hype.",
                  icon: <Zap className="w-5 h-5" />,
                },
              ].map((pillar, i) => (
                <div
                  key={i}
                  className="glass-card glass-card-hover rounded-xl p-8 text-center flex flex-col items-center"
                >
                  <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 mb-6">
                    {pillar.icon}
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3 font-heading">
                    {pillar.title}
                  </h3>
                  <p className="text-slate-500 leading-relaxed text-sm">
                    {pillar.desc}
                  </p>
                </div>
              ))}
            </StaggerReveal>
          </div>

          {/* Values */}
          <ScrollReveal className="mb-24">
            <div className="glass-card rounded-2xl p-8 md:p-12">
              <h2 className="text-3xl font-bold text-white mb-10 font-heading">
                Our Core Values
              </h2>

              <div className="space-y-8">
                {[
                  {
                    title: "Independence",
                    desc: "We don't accept paid placements for tools. If it's featured, it's because we believe it's useful.",
                  },
                  {
                    title: "Practicality",
                    desc: "We evaluate tools based on their utility in actual schematic design, DD, CD, and visualization phases.",
                  },
                  {
                    title: "Community Driven",
                    desc: "The directory is continually refined based on submissions and feedback from practicing architects.",
                  },
                ].map((value, i) => (
                  <div key={i} className="flex gap-4">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-1 font-heading">
                        {value.title}
                      </h3>
                      <p className="text-slate-500 text-sm leading-relaxed">
                        {value.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </ScrollReveal>

          {/* Built by Practitioners */}
          <ScrollReveal className="text-center">
            <h2 className="text-2xl font-bold text-white mb-4 font-heading">
              Built by Practitioners
            </h2>
            <p className="text-slate-500 max-w-2xl mx-auto mb-8 leading-relaxed">
              ArchiGen AI is built and maintained by the team behind Vista
              Studios, an architectural visualization practice that utilizes
              these AI suites daily in production.
            </p>
            <Link
              href="/tools"
              className="text-blue-400 hover:text-blue-300 font-medium flex items-center transition-colors justify-center gap-2 text-sm"
            >
              Explore the Directory{" "}
              <ArrowRight className="w-4 h-4" />
            </Link>
          </ScrollReveal>
        </div>
      </main>

      <Footer />
    </div>
  );
}
