"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { Category } from "@/lib/data";
import { StaggerReveal } from "./ScrollReveal";

interface CategoriesGridProps {
  categories: Category[];
}

export function CategoriesGrid({ categories }: CategoriesGridProps) {
  return (
    <StaggerReveal
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5"
      stagger={0.08}
    >
      {categories.map((cat) => (
        <Link href={`/tools?category=${cat.id}`} key={cat.id}>
          <div className="glass-card glass-card-hover p-8 rounded-xl group cursor-pointer h-full flex flex-col">
            <div className="w-14 h-14 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-3xl mb-6 group-hover:scale-110 group-hover:bg-blue-500/20 transition-all duration-300">
              {cat.icon}
            </div>
            <h3 className="font-heading font-semibold text-white text-lg mb-2 group-hover:text-blue-100 transition-colors">
              {cat.name}
            </h3>
            <p className="text-sm text-slate-500 leading-relaxed mb-5 flex-grow">
              {cat.description}
            </p>
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-blue-400 bg-blue-500/8 px-2.5 py-1 rounded-full font-medium">
                {cat.toolCount} Tools
              </span>
              <ArrowRight className="w-4 h-4 text-slate-600 group-hover:text-blue-400 group-hover:translate-x-1 transition-all" />
            </div>
          </div>
        </Link>
      ))}
    </StaggerReveal>
  );
}
