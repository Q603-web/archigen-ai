"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Hero3D } from "./Hero3D";

gsap.registerPlugin(ScrollTrigger);

export function HeroSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const subRef = useRef<HTMLParagraphElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);
  const badgeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (prefersReduced) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

      tl.fromTo(
        badgeRef.current,
        { opacity: 0, y: 20, scale: 0.9 },
        { opacity: 1, y: 0, scale: 1, duration: 0.6 }
      )
        .fromTo(
          headingRef.current,
          { opacity: 0, y: 40 },
          { opacity: 1, y: 0, duration: 0.8 },
          "-=0.3"
        )
        .fromTo(
          subRef.current,
          { opacity: 0, y: 30 },
          { opacity: 1, y: 0, duration: 0.7 },
          "-=0.4"
        )
        .fromTo(
          ctaRef.current,
          { opacity: 0, y: 25 },
          { opacity: 1, y: 0, duration: 0.6 },
          "-=0.3"
        )
        .fromTo(
          statsRef.current,
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 0.6 },
          "-=0.2"
        );

      // Parallax on scroll
      if (sectionRef.current) {
        gsap.to(sectionRef.current.querySelector(".hero-content"), {
          y: -60,
          ease: "none",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top top",
            end: "bottom top",
            scrub: true,
          },
        });
      }
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative min-h-[100vh] flex items-center justify-center overflow-hidden"
    >
      <Hero3D />

      <div className="hero-content container relative z-10 px-4 md:px-8 text-center max-w-5xl mx-auto">
        <div ref={badgeRef} className="opacity-0">
          <Badge
            variant="glass"
            className="mb-8 px-4 py-1.5 text-blue-400 border-blue-500/20 bg-blue-500/8 text-xs font-semibold tracking-wide uppercase"
          >
            Directory Updated Weekly
          </Badge>
        </div>

        <h1
          ref={headingRef}
          className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold tracking-tight mb-8 text-white leading-[0.95] opacity-0"
        >
          AI Tools for
          <br className="hidden sm:block" />
          Architects{" "}
          <span className="text-gradient">Who Actually Build</span>
        </h1>

        <p
          ref={subRef}
          className="text-lg md:text-xl text-slate-400 mb-12 max-w-2xl mx-auto font-medium leading-relaxed opacity-0"
        >
          Discover, compare, and master 20+ AI tools curated by
          practitioners&mdash;not marketers.
        </p>

        <div
          ref={ctaRef}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full max-w-xl mx-auto mb-20 opacity-0"
        >
          <div className="relative w-full sm:w-[320px] group">
            <input
              type="text"
              placeholder="Search tools for rendering, 3D..."
              className="w-full h-13 rounded-xl bg-white/5 border border-white/10 pl-6 pr-4 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 backdrop-blur-md transition-all duration-300 group-hover:border-white/20"
            />
          </div>
          <Link href="/tools">
            <Button
              variant="gradient"
              size="lg"
              className="w-full sm:w-auto rounded-xl h-13 px-8 text-base font-semibold shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 transition-shadow duration-300"
            >
              Browse Tools
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </Link>
        </div>

        {/* Stats Bar */}
        <div
          ref={statsRef}
          className="flex flex-wrap justify-center gap-12 md:gap-20 pt-10 border-t border-white/5 opacity-0"
        >
          {[
            { value: "20+", label: "Curated Tools" },
            { value: "8", label: "Categories" },
            { value: "100%", label: "Architect Tested" },
          ].map((stat, i) => (
            <div key={i} className="text-center">
              <p className="text-3xl md:text-4xl font-bold text-white mb-1.5 font-heading">
                {stat.value}
              </p>
              <p className="text-xs text-slate-500 tracking-wider uppercase font-medium">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-40">
        <span className="text-[10px] uppercase tracking-[0.2em] text-slate-500">
          Scroll
        </span>
        <div className="w-px h-8 bg-gradient-to-b from-slate-500 to-transparent" />
      </div>
    </section>
  );
}
