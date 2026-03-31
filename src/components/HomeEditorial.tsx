"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import { getRecentArticles, getFeaturedArticles } from "@/lib/blog";
import { categories } from "@/lib/data";
import { ScrollReveal, StaggerReveal, Parallax } from "./ScrollReveal";
import { BlogList } from "./BlogList";

gsap.registerPlugin(ScrollTrigger);

export function HomeEditorial() {
  const heroRef = useRef<HTMLElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const taglineRef = useRef<HTMLParagraphElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const recentArticles = getRecentArticles(4);
  const featuredArticles = getFeaturedArticles();

  useEffect(() => {
    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (prefersReduced) return;

    const ctx = gsap.context(() => {
      // Hero entrance timeline
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

      tl.fromTo(
        headingRef.current,
        { opacity: 0, y: 60 },
        { opacity: 1, y: 0, duration: 1.2 }
      )
        .fromTo(
          taglineRef.current,
          { opacity: 0, y: 30 },
          { opacity: 1, y: 0, duration: 0.8 },
          "-=0.5"
        )
        .fromTo(
          scrollRef.current,
          { opacity: 0 },
          { opacity: 0.4, duration: 0.6 },
          "-=0.2"
        );

      // Parallax on hero content
      if (heroRef.current) {
        gsap.to(heroRef.current.querySelector(".hero-text"), {
          y: -80,
          ease: "none",
          scrollTrigger: {
            trigger: heroRef.current,
            start: "top top",
            end: "bottom top",
            scrub: true,
          },
        });
      }
    }, heroRef);

    return () => ctx.revert();
  }, []);

  return (
    <>
      {/* ============================================ */}
      {/* HERO — Alche-style typographic statement     */}
      {/* ============================================ */}
      <section
        ref={heroRef}
        className="relative min-h-[100vh] flex items-center justify-center overflow-hidden"
      >
        {/* Logo video background */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-grid opacity-10" />
          <video
            src="/logo-animation.mp4"
            autoPlay
            loop
            muted
            playsInline
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[85vw] max-w-[800px] opacity-[0.12]"
            style={{ mixBlendMode: "lighten" }}
          />
          <div className="absolute bottom-0 left-0 right-0 h-64 bg-gradient-to-t from-[#030712] to-transparent" />
        </div>

        {/* Hero text */}
        <div className="hero-text container mx-auto px-6 md:px-10 text-center max-w-5xl">
          <h1
            ref={headingRef}
            className="text-5xl sm:text-6xl md:text-7xl lg:text-[5.5rem] xl:text-[6.5rem] font-bold text-white font-heading tracking-tight leading-[0.95] mb-10 opacity-0"
          >
            Shaping the Future
            <br />
            of Design{" "}
            <span className="text-gradient">with AI</span>
          </h1>

          <p
            ref={taglineRef}
            className="text-base md:text-lg text-slate-500 max-w-lg mx-auto leading-relaxed opacity-0"
          >
            Practitioner-written guides, honest tool reviews, and workflow
            intelligence for architects who build.
          </p>
        </div>

        {/* Scroll indicator */}
        <div
          ref={scrollRef}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3 opacity-0"
        >
          <span className="text-[10px] tracking-[0.25em] uppercase text-slate-600">
            scroll to explore
          </span>
          <div className="w-px h-10 bg-gradient-to-b from-slate-600 to-transparent" />
        </div>
      </section>

      {/* ============================================ */}
      {/* LATEST ARTICLES — Alche "News" style         */}
      {/* ============================================ */}
      <section className="py-32 border-t" style={{ borderColor: "var(--border-subtle)" }}>
        <div className="container mx-auto px-6 md:px-10 max-w-5xl">
          <ScrollReveal>
            <div className="flex items-end justify-between mb-16">
              <div>
                <p className="text-[11px] text-slate-600 tracking-[0.2em] uppercase font-medium mb-4">
                  Latest
                </p>
                <h2 className="text-3xl md:text-5xl font-bold text-white font-heading">
                  Journal
                </h2>
              </div>
              <Link
                href="/blog"
                className="text-[13px] text-slate-600 hover:text-white transition-colors duration-300 flex items-center gap-2 group"
              >
                All articles
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform duration-300" />
              </Link>
            </div>
          </ScrollReveal>

          <BlogList articles={recentArticles} />
        </div>
      </section>

      {/* ============================================ */}
      {/* MISSION — Full-screen typographic statement   */}
      {/* ============================================ */}
      <section className="py-40 md:py-52 relative overflow-hidden">
        <Parallax
          className="absolute left-1/4 top-1/2 -translate-y-1/2 w-[400px] h-[400px] pointer-events-none"
          speed={-0.15}
        >
          <div className="w-full h-full bg-blue-600/[0.06] blur-[120px] rounded-full" />
        </Parallax>

        <div className="container mx-auto px-6 md:px-10 max-w-4xl relative z-10">
          <ScrollReveal>
            <p className="text-[11px] text-slate-600 tracking-[0.2em] uppercase font-medium mb-10">
              Mission
            </p>
            <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold text-white font-heading leading-[1.15] mb-10">
              50+ AI tools launched this year.
              <br />
              <span className="text-slate-500">
                Most reviews are written by marketers.
              </span>
              <br />
              We write for architects.
            </h2>
            <p className="text-base text-slate-500 max-w-xl leading-relaxed">
              ArchiGen AI is the single source of truth for architectural AI
              adoption — curated reviews, workflow guides, and prompt libraries
              built by practitioners who use these tools on real projects.
            </p>
          </ScrollReveal>
        </div>
      </section>

      {/* ============================================ */}
      {/* WHAT WE COVER — Alche "Service" style cards  */}
      {/* ============================================ */}
      <section className="py-32 border-t" style={{ borderColor: "var(--border-subtle)" }}>
        <div className="container mx-auto px-6 md:px-10 max-w-5xl">
          <ScrollReveal className="mb-20">
            <p className="text-[11px] text-slate-600 tracking-[0.2em] uppercase font-medium mb-4">
              Coverage
            </p>
            <h2 className="text-3xl md:text-5xl font-bold text-white font-heading">
              What We Cover
            </h2>
          </ScrollReveal>

          <StaggerReveal
            className="grid grid-cols-1 md:grid-cols-2 gap-px bg-white/[0.04]"
            stagger={0.1}
          >
            {[
              {
                title: "Image Generation",
                desc: "Midjourney, Leonardo, FLUX, Stable Diffusion — tested on real schematic design packages.",
                count: "6 tools reviewed",
              },
              {
                title: "Rendering",
                desc: "Chaos Veras, Rendair AI, ReRender — side-by-side comparisons for architectural exteriors and interiors.",
                count: "4 tools reviewed",
              },
              {
                title: "3D Generation",
                desc: "Meshy.ai, Kaedim, 3D AI Studio — from text prompts to production-ready architectural models.",
                count: "3 tools reviewed",
              },
              {
                title: "Floor Planning",
                desc: "Maket.ai, TestFit, Coohom — generative layout tools tested against real residential and commercial briefs.",
                count: "3 tools reviewed",
              },
              {
                title: "Video & Animation",
                desc: "Kling AI, Luma Dream Machine — architectural fly-throughs generated from still renders.",
                count: "3 tools reviewed",
              },
              {
                title: "Advanced Workflows",
                desc: "ComfyUI, custom LoRAs, ControlNet pipelines — for firms ready to build custom AI infrastructure.",
                count: "Expert guides",
              },
            ].map((item, i) => (
              <Link
                href="/tools"
                key={i}
                className="group bg-[#030712] p-10 md:p-12 hover:bg-white/[0.02] transition-colors duration-500"
              >
                <div className="flex items-start justify-between mb-6">
                  <h3 className="text-xl md:text-2xl font-bold text-white font-heading group-hover:text-blue-100 transition-colors duration-300">
                    {item.title}
                  </h3>
                  <ArrowUpRight className="w-5 h-5 text-slate-700 group-hover:text-white transition-colors duration-300 shrink-0 mt-1" />
                </div>
                <p className="text-[13px] text-slate-500 leading-relaxed mb-6">
                  {item.desc}
                </p>
                <span className="text-[11px] text-slate-600 tracking-wide uppercase">
                  {item.count}
                </span>
              </Link>
            ))}
          </StaggerReveal>
        </div>
      </section>

      {/* ============================================ */}
      {/* VISION — Second typographic statement        */}
      {/* ============================================ */}
      <section className="py-40 md:py-52 relative overflow-hidden">
        <Parallax
          className="absolute right-1/4 top-1/2 -translate-y-1/2 w-[350px] h-[350px] pointer-events-none"
          speed={0.12}
        >
          <div className="w-full h-full bg-violet-600/[0.05] blur-[100px] rounded-full" />
        </Parallax>

        <div className="container mx-auto px-6 md:px-10 max-w-4xl relative z-10">
          <ScrollReveal>
            <p className="text-[11px] text-slate-600 tracking-[0.2em] uppercase font-medium mb-10">
              Vision
            </p>
            <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold text-white font-heading leading-[1.15]">
              AI won&apos;t replace architects.
              <br />
              <span className="text-slate-500">
                But architects who use AI
              </span>
              <br />
              will replace those who don&apos;t.
            </h2>
          </ScrollReveal>
        </div>
      </section>

      {/* ============================================ */}
      {/* DIRECTORY CTA — Positioned as a feature      */}
      {/* ============================================ */}
      <section className="py-32 border-t" style={{ borderColor: "var(--border-subtle)" }}>
        <div className="container mx-auto px-6 md:px-10 max-w-5xl">
          <ScrollReveal>
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-8 mb-16">
              <div>
                <p className="text-[11px] text-slate-600 tracking-[0.2em] uppercase font-medium mb-4">
                  Directory
                </p>
                <h2 className="text-3xl md:text-5xl font-bold text-white font-heading mb-5">
                  20+ Tools.
                  <br />
                  Zero Sponsored Picks.
                </h2>
                <p className="text-base text-slate-500 max-w-lg leading-relaxed">
                  Every tool in our directory has been tested on real
                  architectural projects. Browse by category, compare ratings,
                  and find the right tool for your workflow.
                </p>
              </div>
              <Link
                href="/tools"
                className="group flex items-center gap-3 text-white hover:text-blue-200 transition-colors duration-300 shrink-0"
              >
                <span className="text-[13px] font-medium">
                  Browse the Directory
                </span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
              </Link>
            </div>
          </ScrollReveal>

          {/* Category strip */}
          <StaggerReveal
            className="grid grid-cols-2 md:grid-cols-4 gap-px bg-white/[0.04]"
            stagger={0.06}
          >
            {categories.slice(0, 8).map((cat) => (
              <Link
                href="/tools"
                key={cat.id}
                className="group bg-[#030712] p-8 hover:bg-white/[0.02] transition-colors duration-500 text-center"
              >
                <span className="text-3xl mb-3 block group-hover:scale-110 transition-transform duration-300">
                  {cat.icon}
                </span>
                <h4 className="text-[13px] font-heading font-semibold text-white mb-1">
                  {cat.name}
                </h4>
                <span className="text-[11px] text-slate-600">
                  {cat.toolCount} tools
                </span>
              </Link>
            ))}
          </StaggerReveal>
        </div>
      </section>

      {/* ============================================ */}
      {/* NEWSLETTER — Clean CTA                       */}
      {/* ============================================ */}
      <section className="py-40 border-t" style={{ borderColor: "var(--border-subtle)" }}>
        <div className="container mx-auto px-6 md:px-10 max-w-2xl text-center">
          <ScrollReveal>
            <p className="text-[11px] text-slate-600 tracking-[0.2em] uppercase font-medium mb-6">
              Newsletter
            </p>
            <h2 className="text-3xl md:text-5xl font-bold text-white font-heading mb-6 leading-tight">
              Stay Ahead of the Curve
            </h2>
            <p className="text-base text-slate-500 mb-12 max-w-md mx-auto leading-relaxed">
              Top 5 tool picks + one deep-dive tutorial, every week. Written by
              architects, for architects.
            </p>
            <div className="flex gap-3 max-w-sm mx-auto">
              <input
                type="email"
                placeholder="name@firm.com"
                className="flex-grow h-12 bg-white/[0.03] border rounded-md px-5 text-[13px] text-white placeholder:text-slate-700 focus:outline-none focus:border-slate-500 transition-colors"
                style={{ borderColor: "var(--border-subtle)" }}
              />
              <button className="h-12 px-6 text-[13px] font-medium text-white bg-white/[0.06] border rounded-md hover:bg-white/[0.1] transition-colors duration-300" style={{ borderColor: "var(--border-subtle)" }}>
                Subscribe
              </button>
            </div>
          </ScrollReveal>
        </div>
      </section>
    </>
  );
}
