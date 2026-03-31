import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ExternalLink, Star } from "lucide-react";

import { tools, categories } from "@/lib/data";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ToolCard } from "@/components/ToolCard";

export default async function ToolPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const tool = tools.find((t) => t.id === id);

  if (!tool) {
    notFound();
  }

  const category = categories.find((c) => c.id === tool.categoryId);
  const similarTools = tools
    .filter((t) => t.categoryId === tool.categoryId && t.id !== tool.id)
    .sort((a, b) => b.rating - a.rating)
    .slice(0, 3);

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <main className="flex-grow pt-8 pb-28">
        <div className="container mx-auto px-4 md:px-8 max-w-5xl">
          <Link
            href="/tools"
            className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-white mb-10 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Directory
          </Link>

          {/* Hero */}
          <div className="glass-card rounded-2xl p-8 md:p-12 mb-16 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/8 blur-[80px] rounded-full mix-blend-screen pointer-events-none" />

            <div className="flex flex-col md:flex-row gap-8 items-start justify-between relative z-10">
              <div>
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-14 h-14 rounded-xl bg-white/5 border flex items-center justify-center font-bold text-xl text-white" style={{ borderColor: "var(--border-subtle)" }}>
                    {tool.name.charAt(0)}
                  </div>
                  <div>
                    <h1 className="text-3xl md:text-5xl font-bold text-white mb-2 font-heading">
                      {tool.name}
                    </h1>
                    <div className="flex flex-wrap items-center gap-3">
                      {category && (
                        <Badge
                          variant="glass"
                          className="text-slate-400 text-xs"
                        >
                          {category.name}
                        </Badge>
                      )}
                      <div className="flex items-center text-amber-400 text-sm font-medium">
                        <Star className="w-3.5 h-3.5 fill-current mr-1" />
                        {tool.rating.toFixed(1)} / 5.0
                      </div>
                      <Badge
                        variant={
                          tool.pricing === "Free"
                            ? "free"
                            : tool.pricing === "Freemium"
                              ? "freemium"
                              : tool.pricing === "Free/Open Source"
                                ? "opensource"
                                : "paid"
                        }
                        className="text-xs"
                      >
                        {tool.pricing}
                      </Badge>
                    </div>
                  </div>
                </div>

                <p className="text-lg text-slate-400 max-w-2xl leading-relaxed">
                  {tool.description}
                </p>
              </div>

              <div className="w-full md:w-auto flex flex-col gap-3 shrink-0">
                <Button
                  variant="gradient"
                  size="lg"
                  className="w-full shadow-lg shadow-blue-500/20 rounded-xl font-semibold"
                  asChild
                >
                  <Link
                    href={tool.link}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Try {tool.name}{" "}
                    <ExternalLink className="w-4 h-4 ml-2" />
                  </Link>
                </Button>
                <Button
                  variant="glass"
                  size="lg"
                  className="w-full rounded-xl"
                >
                  Save to List
                </Button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-12">
              <section>
                <h2 className="text-2xl font-bold text-white mb-6 font-heading">
                  Overview
                </h2>
                <div className="space-y-4 text-slate-400 leading-relaxed">
                  <p>
                    {tool.name} represents a significant advancement in the{" "}
                    {category?.name.toLowerCase()} category for architectural
                    workflows. By leveraging cutting-edge models, it allows
                    practitioners to streamline their processes and focus more on
                    design iteration rather than manual execution.
                  </p>
                  <h3 className="text-lg font-semibold text-white pt-4 font-heading">
                    Key Capabilities for Architects
                  </h3>
                  <ul className="space-y-2">
                    {[
                      "Rapid iteration of conceptual designs.",
                      "High-fidelity outputs suitable for client presentations.",
                      "Integration capabilities with existing industry tools.",
                      "Extensive control over stylistic generation parameters.",
                    ].map((item, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm">
                        <span className="text-blue-400 mt-1">&#8226;</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-6 font-heading">
                  Pricing Breakdown
                </h2>
                <div className="glass-card rounded-xl p-6">
                  <div
                    className="flex items-center justify-between mb-4 border-b pb-4"
                    style={{ borderColor: "var(--border-subtle)" }}
                  >
                    <span className="text-slate-300 font-medium text-sm">
                      Model
                    </span>
                    <Badge variant="glass" className="text-xs">
                      {tool.pricing}
                    </Badge>
                  </div>
                  <p className="text-sm text-slate-500 leading-relaxed">
                    {tool.pricing === "Paid"
                      ? "Requires a monthly subscription for access."
                      : tool.pricing === "Freemium"
                        ? "Offers a generous free tier with core features, with premium options for power users."
                        : "Completely free to use, typically community-supported or open source."}
                  </p>
                </div>
              </section>
            </div>

            {/* Sidebar */}
            <div className="space-y-8">
              <div className="glass-card rounded-xl p-6">
                <h3
                  className="font-heading font-semibold text-white mb-5 border-b pb-3 text-sm"
                  style={{ borderColor: "var(--border-subtle)" }}
                >
                  Tool Details
                </h3>
                <ul className="space-y-4 text-sm">
                  <li className="flex justify-between items-center">
                    <span className="text-slate-600">Industry Rating</span>
                    <span className="text-white font-medium flex items-center">
                      <Star className="w-3 h-3 text-amber-400 fill-current mr-1" />{" "}
                      {tool.rating}
                    </span>
                  </li>
                  <li className="flex justify-between items-center">
                    <span className="text-slate-600">Category</span>
                    <span className="text-blue-400 font-medium">
                      {category?.name}
                    </span>
                  </li>
                  <li className="flex justify-between items-center">
                    <span className="text-slate-600">Status</span>
                    <span className="text-emerald-400 font-medium">Active</span>
                  </li>
                </ul>
              </div>

              {tool.badges && tool.badges.length > 0 && (
                <div>
                  <h3 className="text-[10px] font-semibold text-slate-600 uppercase tracking-[0.15em] mb-3">
                    Tags
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {tool.badges.map((b) => (
                      <Badge key={b} variant="glass" className="text-xs">
                        {b}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Similar Tools */}
          {similarTools.length > 0 && (
            <div
              className="mt-28 border-t pt-16"
              style={{ borderColor: "var(--border-subtle)" }}
            >
              <h2 className="text-2xl font-bold text-white mb-8 font-heading">
                Similar in {category?.name}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {similarTools.map((t) => (
                  <ToolCard key={t.id} tool={t} />
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
