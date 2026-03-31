"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";

export function Hero3D() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    // Animate the gradient orbs
    const orbs = el.querySelectorAll(".hero-orb");
    orbs.forEach((orb, i) => {
      gsap.to(orb, {
        y: `${10 + i * 5}`,
        x: `${5 + i * 3}`,
        duration: 4 + i * 0.5,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      });
    });

    // Animate grid lines
    gsap.fromTo(
      el.querySelector(".hero-grid"),
      { opacity: 0 },
      { opacity: 1, duration: 2, delay: 0.5 }
    );
  }, []);

  return (
    <div ref={containerRef} className="absolute inset-0 -z-10 overflow-hidden">
      {/* Architectural grid pattern */}
      <div className="hero-grid absolute inset-0 bg-grid opacity-0" />

      {/* Gradient orbs */}
      <div className="hero-orb absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-blue-600/15 rounded-full blur-[120px] mix-blend-screen" />
      <div className="hero-orb absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-violet-600/12 rounded-full blur-[100px] mix-blend-screen" />
      <div className="hero-orb absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-cyan-500/8 rounded-full blur-[80px] mix-blend-screen" />

      {/* NANO BANANA ASSET HERE — Replace this placeholder with a 3D architectural asset -->
           Dimensions: 800x600px centered, absolute positioned
           Suggested: Abstract wireframe-to-solid architectural form
           Format: WebP or optimized PNG with transparency -->
      */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] pointer-events-none flex items-center justify-center">
        {/* Placeholder geometric shape */}
        <svg
          viewBox="0 0 400 300"
          className="w-full h-full opacity-[0.06]"
          fill="none"
          stroke="currentColor"
          strokeWidth="0.5"
        >
          {/* Architectural wireframe grid */}
          {Array.from({ length: 20 }, (_, i) => (
            <line
              key={`h${i}`}
              x1="0"
              y1={i * 15}
              x2="400"
              y2={i * 15}
              className="text-blue-400"
            />
          ))}
          {Array.from({ length: 27 }, (_, i) => (
            <line
              key={`v${i}`}
              x1={i * 15}
              y1="0"
              x2={i * 15}
              y2="300"
              className="text-blue-400"
            />
          ))}
          {/* Perspective lines */}
          <line
            x1="200"
            y1="50"
            x2="50"
            y2="250"
            className="text-violet-400"
            strokeWidth="1"
          />
          <line
            x1="200"
            y1="50"
            x2="350"
            y2="250"
            className="text-violet-400"
            strokeWidth="1"
          />
          <line
            x1="200"
            y1="50"
            x2="200"
            y2="250"
            className="text-cyan-400"
            strokeWidth="1"
          />
          {/* Building outline */}
          <rect
            x="120"
            y="80"
            width="160"
            height="170"
            className="text-blue-500"
            strokeWidth="1.5"
          />
          <rect
            x="145"
            y="100"
            width="40"
            height="50"
            className="text-slate-400"
            strokeWidth="0.8"
          />
          <rect
            x="215"
            y="100"
            width="40"
            height="50"
            className="text-slate-400"
            strokeWidth="0.8"
          />
          <rect
            x="175"
            y="190"
            width="50"
            height="60"
            className="text-slate-400"
            strokeWidth="0.8"
          />
        </svg>
      </div>

      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-[#030712] to-transparent" />
    </div>
  );
}
