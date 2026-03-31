"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";

export function Hero3D() {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    // Fade in the video
    if (videoRef.current) {
      gsap.fromTo(
        videoRef.current,
        { opacity: 0, scale: 0.95 },
        { opacity: 1, scale: 1, duration: 1.5, delay: 0.3, ease: "power2.out" }
      );
    }

    // Animate the ambient gradient orbs
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
  }, []);

  return (
    <div ref={containerRef} className="absolute inset-0 -z-10 overflow-hidden">
      {/* Architectural grid pattern */}
      <div className="absolute inset-0 bg-grid opacity-20" />

      {/* Gradient orbs for ambient light */}
      <div className="hero-orb absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px] mix-blend-screen" />
      <div className="hero-orb absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-violet-600/8 rounded-full blur-[100px] mix-blend-screen" />
      <div className="hero-orb absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-cyan-500/5 rounded-full blur-[80px] mix-blend-screen" />

      {/* 3D Logo Video — centered behind hero text */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90vw] max-w-[900px] aspect-video pointer-events-none">
        <video
          ref={videoRef}
          src="/logo-animation.mp4"
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-contain opacity-0"
          style={{ mixBlendMode: "lighten" }}
        />
      </div>

      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-[#030712] to-transparent" />
      {/* Top fade */}
      <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-b from-[#030712] to-transparent" />
    </div>
  );
}
