"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Search, Menu, X } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import gsap from "gsap";

import { Button } from "./ui/button";

export function Navbar() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const navRef = useRef<HTMLElement>(null);

  const navLinks = [
    { name: "Discover", href: "/tools" },
    { name: "Categories", href: "/categories" },
    { name: "About", href: "/about" },
  ];

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (!navRef.current) return;
    gsap.to(navRef.current, {
      height: isScrolled ? 56 : 72,
      duration: 0.3,
      ease: "power2.out",
    });
  }, [isScrolled]);

  return (
    <nav
      ref={navRef}
      className={`sticky top-0 z-50 w-full transition-all duration-300 ${
        isScrolled
          ? "border-b bg-[#030712]/90 backdrop-blur-xl shadow-lg shadow-black/20"
          : "border-b border-transparent bg-transparent"
      }`}
      style={{ borderColor: isScrolled ? "var(--border-subtle)" : "transparent" }}
    >
      <div className="container mx-auto px-4 md:px-8 h-full flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <img
            src="/logo-3d.webp"
            alt="ArchiGen AI"
            className="h-9 w-auto rounded-lg shadow-lg shadow-blue-500/10 group-hover:shadow-blue-500/30 transition-all duration-300 group-hover:scale-105"
          />
          <span className="font-heading font-bold text-lg tracking-tight text-white hidden sm:block">
            ArchiGen AI
          </span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-6">
          <div className="flex items-center gap-1 text-sm font-medium">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className={`relative px-4 py-2 rounded-lg transition-all duration-200 ${
                  pathname === link.href
                    ? "text-white bg-white/5"
                    : "text-slate-400 hover:text-white hover:bg-white/5"
                }`}
              >
                {link.name}
                {pathname === link.href && (
                  <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-0.5 bg-blue-500 rounded-full" />
                )}
              </Link>
            ))}
          </div>

          <div className="h-5 w-px bg-white/10 mx-1" />

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="text-slate-400 hover:text-white hover:bg-white/5 rounded-lg"
            >
              <Search className="w-4 h-4" />
            </Button>
            <Button
              variant="gradient"
              size="sm"
              className="hidden lg:flex rounded-lg text-xs font-semibold tracking-wide uppercase"
            >
              Submit Tool
            </Button>
          </div>
        </div>

        {/* Mobile Toggle */}
        <div className="md:hidden flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            className="text-slate-400 rounded-lg"
          >
            <Search className="w-4 h-4" />
          </Button>
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="text-slate-400 hover:text-white p-2 rounded-lg hover:bg-white/5 transition-colors"
          >
            {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t bg-[#030712]/98 backdrop-blur-2xl" style={{ borderColor: "var(--border-subtle)" }}>
          <div className="flex flex-col px-4 py-6 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className={`py-3 px-4 rounded-lg font-medium text-lg transition-colors ${
                  pathname === link.href
                    ? "text-white bg-white/5"
                    : "text-slate-300 hover:text-white hover:bg-white/5"
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {link.name}
              </Link>
            ))}
            <div className="pt-4">
              <Button
                variant="gradient"
                className="w-full justify-center rounded-lg"
              >
                Submit Tool
              </Button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
