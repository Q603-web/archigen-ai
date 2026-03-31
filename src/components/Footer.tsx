import Link from "next/link";

export function Footer() {
  return (
    <footer
      className="border-t pt-20 pb-10"
      style={{ borderColor: "var(--border-subtle)" }}
    >
      <div className="container mx-auto px-6 md:px-10">
        {/* Top — Logo + Nav Groups */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-16 mb-20">
          {/* Brand */}
          <div className="md:col-span-1">
            <Link href="/" className="inline-flex items-center gap-3 mb-6 group">
              <img
                src="/logo-3d.webp"
                alt="ArchiGen AI"
                className="h-8 w-auto rounded group-hover:opacity-80 transition-opacity duration-300"
              />
              <span className="font-heading font-semibold text-sm tracking-wide text-white">
                ArchiGen AI
              </span>
            </Link>
            <p className="text-[13px] text-slate-600 leading-relaxed max-w-xs">
              Shaping the future of architectural design with AI.
              Practitioner-tested. No sponsored picks.
            </p>
          </div>

          {/* Navigate */}
          <div>
            <h4 className="text-[11px] text-slate-500 tracking-[0.15em] uppercase font-medium mb-6">
              Navigate
            </h4>
            <ul className="space-y-4">
              {[
                { label: "Home", href: "/" },
                { label: "Journal", href: "/blog" },
                { label: "Directory", href: "/tools" },
                { label: "About", href: "/about" },
              ].map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-[13px] text-slate-600 hover:text-white transition-colors duration-300"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Directory */}
          <div>
            <h4 className="text-[11px] text-slate-500 tracking-[0.15em] uppercase font-medium mb-6">
              Directory
            </h4>
            <ul className="space-y-4">
              {[
                { label: "Browse Tools", href: "/tools" },
                { label: "Categories", href: "/categories" },
                { label: "Submit a Tool", href: "#" },
              ].map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-[13px] text-slate-600 hover:text-white transition-colors duration-300"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="text-[11px] text-slate-500 tracking-[0.15em] uppercase font-medium mb-6">
              Newsletter
            </h4>
            <p className="text-[13px] text-slate-600 leading-relaxed mb-5">
              Weekly tool picks + one deep-dive tutorial. No spam.
            </p>
            <div className="flex gap-2">
              <input
                type="email"
                placeholder="name@firm.com"
                className="bg-white/[0.03] border rounded-md px-4 py-2.5 text-[13px] text-white placeholder:text-slate-700 focus:outline-none focus:border-slate-500 flex-grow transition-colors"
                style={{ borderColor: "var(--border-subtle)" }}
              />
              <button className="text-[13px] text-white bg-white/[0.06] border rounded-md px-4 py-2.5 hover:bg-white/[0.1] transition-colors" style={{ borderColor: "var(--border-subtle)" }}>
                Join
              </button>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div
          className="pt-8 border-t flex flex-col md:flex-row items-center justify-between gap-4"
          style={{ borderColor: "var(--border-subtle)" }}
        >
          <p className="text-[11px] text-slate-700">
            &copy; {new Date().getFullYear()} ArchiGen AI. Built by Vista Studios.
          </p>
          <div className="flex items-center gap-6">
            {["X", "YouTube", "LinkedIn"].map((social) => (
              <Link
                key={social}
                href="#"
                className="text-[11px] text-slate-700 hover:text-white transition-colors duration-300"
              >
                {social}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
