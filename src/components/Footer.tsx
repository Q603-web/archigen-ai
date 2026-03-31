import Link from "next/link";
import { ArrowRight, Github, Twitter } from "lucide-react";

import { Button } from "./ui/button";

export function Footer() {
  return (
    <footer
      className="border-t pt-20 pb-8"
      style={{
        borderColor: "var(--border-subtle)",
        background: "var(--background)",
      }}
    >
      <div className="container mx-auto px-4 md:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-20">
          {/* Brand & Newsletter */}
          <div className="col-span-1 md:col-span-2">
            <Link
              href="/"
              className="inline-flex items-center gap-2.5 mb-5 group"
            >
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-500 to-violet-600 flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-blue-500/20 group-hover:shadow-blue-500/40 transition-all">
                A
              </div>
              <span className="font-heading font-bold text-xl tracking-tight text-white">
                ArchiGen AI
              </span>
            </Link>
            <p className="text-slate-500 mb-8 max-w-sm leading-relaxed text-sm">
              Discover, compare, and master AI tools curated by practicing
              architects&mdash;not marketers.
            </p>

            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-white font-heading">
                Stay Ahead of the Curve
              </h4>
              <p className="text-xs text-slate-500 max-w-sm">
                Join architects getting our top 5 tool picks + one deep-dive
                tutorial every week.
              </p>
              <div className="flex flex-col sm:flex-row gap-2 max-w-md">
                <input
                  type="email"
                  placeholder="name@firm.com"
                  className="bg-white/3 border rounded-lg px-4 py-2.5 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 flex-grow transition-all"
                  style={{ borderColor: "var(--border-subtle)" }}
                />
                <Button
                  variant="gradient"
                  className="whitespace-nowrap rounded-lg font-semibold text-sm"
                >
                  Subscribe <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                </Button>
              </div>
            </div>
          </div>

          {/* Links: Directory */}
          <div>
            <h4 className="font-heading font-semibold text-white mb-6 text-sm">
              Directory
            </h4>
            <ul className="space-y-3.5">
              {[
                { label: "Browse All Tools", href: "/tools" },
                { label: "Categories", href: "/categories" },
                { label: "Top Rated", href: "/tools" },
                { label: "Free Options", href: "/tools", badge: "Popular" },
              ].map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-slate-500 hover:text-white transition-colors text-sm flex items-center gap-2"
                  >
                    {link.label}
                    {link.badge && (
                      <span className="bg-emerald-500/10 text-emerald-400 text-[9px] px-1.5 py-0.5 rounded border border-emerald-500/15 font-medium">
                        {link.badge}
                      </span>
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Links: Resources */}
          <div>
            <h4 className="font-heading font-semibold text-white mb-6 text-sm">
              Resources
            </h4>
            <ul className="space-y-3.5">
              {[
                { label: "About Us", href: "/about" },
                { label: "Workflow Guides", href: "#" },
                { label: "Submit a Tool", href: "#" },
                { label: "Contact", href: "#" },
              ].map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-slate-500 hover:text-white transition-colors text-sm"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div
          className="pt-8 border-t flex flex-col md:flex-row items-center justify-between gap-4"
          style={{ borderColor: "var(--border-subtle)" }}
        >
          <p className="text-[11px] text-slate-600">
            &copy; {new Date().getFullYear()} ArchiGen AI. Built by the team
            behind Vista Studios.
          </p>

          <div className="flex items-center gap-3">
            <Link
              href="#"
              className="text-slate-600 hover:text-white transition-colors p-1.5 rounded-md hover:bg-white/5"
            >
              <Twitter className="w-3.5 h-3.5" />
              <span className="sr-only">Twitter</span>
            </Link>
            <Link
              href="#"
              className="text-slate-600 hover:text-white transition-colors p-1.5 rounded-md hover:bg-white/5"
            >
              <Github className="w-3.5 h-3.5" />
              <span className="sr-only">GitHub</span>
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
