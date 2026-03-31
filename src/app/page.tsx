import Link from "next/link";
import { ArrowRight, CheckCircle2, ArrowUpRight } from "lucide-react";

import { HeroSection } from "@/components/HeroSection";
import { Marquee } from "@/components/Marquee";
import { ToolCard } from "@/components/ToolCard";
import { Button } from "@/components/ui/button";
import { tools, categories } from "@/lib/data";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { HomeSections } from "@/components/HomeSections";

export default function Home() {
  const featuredTools = tools.slice(0, 6);
  const topRatedTools = [...tools].sort((a, b) => b.rating - a.rating).slice(0, 6);

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <main className="flex-grow">
        {/* HERO */}
        <HeroSection />

        {/* MARQUEE */}
        <Marquee />

        {/* All scroll-animated sections */}
        <HomeSections
          featuredTools={featuredTools}
          topRatedTools={topRatedTools}
          categories={categories}
        />
      </main>

      <Footer />
    </div>
  );
}
