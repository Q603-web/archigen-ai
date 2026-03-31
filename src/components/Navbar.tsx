"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import gsap from "gsap";

export function Navbar() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const navRef = useRef<HTMLElement>(null);

  const navLinks = [
    { name: "Journal", href: "/blog" },
    { name: "Directory", href: "/tools" },
    { name: "About", href: "/about" },
  ];

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      ref={navRef}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        isScrolled
          ? "bg-[#030712]/90 backdrop-blur-xl"
          : "bg-transparent"
      }`}
    >
      <div className="container mx-auto px-6 md:px-10 h-20 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <img
            src="/logo-3d.webp"
            alt="ArchiGen AI"
            className="h-8 w-auto rounded group-hover:opacity-80 transition-opacity duration-300"
          />
          <span className="font-heading font-semibold text-sm tracking-wide text-white hidden sm:block">
            ArchiGen AI
          </span>
        </Link>

        {/* Desktop Nav — Alche-style minimal */}
        <div className="hidden md:flex items-center gap-10">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className={`text-[13px] tracking-wide transition-colors duration-300 ${
                pathname.startsWith(link.href)
                  ? "text-white"
                  : "text-slate-500 hover:text-white"
              }`}
            >
              {link.name}
            </Link>
          ))}
          <Link
            href="#contact"
            className="text-[13px] tracking-wide text-slate-500 hover:text-white transition-colors duration-300"
          >
            Contact
          </Link>
        </div>

        {/* Mobile Toggle */}
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="md:hidden text-slate-400 hover:text-white p-2 transition-colors"
        >
          {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile Menu — full screen overlay */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 top-20 bg-[#030712]/98 backdrop-blur-2xl z-40">
          <div className="flex flex-col px-6 py-12 space-y-8">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className={`text-3xl font-heading font-semibold transition-colors ${
                  pathname.startsWith(link.href)
                    ? "text-white"
                    : "text-slate-500 hover:text-white"
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {link.name}
              </Link>
            ))}
            <Link
              href="#contact"
              className="text-3xl font-heading font-semibold text-slate-500 hover:text-white transition-colors"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Contact
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
