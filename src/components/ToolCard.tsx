"use client";

import Link from "next/link";
import { ExternalLink, Star, ArrowUpRight } from "lucide-react";

import { Tool, categories } from "@/lib/data";
import { Card, CardContent, CardFooter, CardHeader } from "./ui/card";
import { Badge } from "./ui/badge";

interface ToolCardProps {
  tool: Tool;
}

export function ToolCard({ tool }: ToolCardProps) {
  const category = categories.find((c) => c.id === tool.categoryId);

  return (
    <Card className="glass-card glass-card-hover flex flex-col h-full bg-transparent overflow-hidden relative group cursor-pointer">
      {/* Hover gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-violet-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

      {/* Top accent line */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      <CardHeader className="pb-3 relative z-10">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-heading font-semibold text-lg text-white mb-2 group-hover:text-blue-100 transition-colors">
              {tool.name}
            </h3>
            <div className="flex items-center gap-2">
              <Badge
                variant="glass"
                className="text-[10px] px-2 py-0 h-5 text-slate-400 border-white/5 bg-white/3"
              >
                {category?.name}
              </Badge>
              <div className="flex items-center text-amber-400 text-xs font-medium gap-1">
                <Star className="w-3 h-3 fill-current" />
                {tool.rating.toFixed(1)}
              </div>
            </div>
          </div>
          <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-slate-500 group-hover:text-white group-hover:bg-blue-500/20 group-hover:border-blue-500/30 transition-all duration-300">
            <ArrowUpRight className="w-3.5 h-3.5" />
          </div>
        </div>
      </CardHeader>

      <CardContent className="pb-4 flex-grow relative z-10">
        <p className="text-sm text-slate-400 line-clamp-3 leading-relaxed">
          {tool.description}
        </p>

        {tool.badges && tool.badges.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-4">
            {tool.badges.map((badge) => (
              <Badge
                key={badge}
                variant="outline"
                className="text-[10px] border-white/8 text-slate-500 bg-white/3"
              >
                {badge}
              </Badge>
            ))}
          </div>
        )}
      </CardContent>

      <CardFooter className="relative z-10 flex items-center justify-between border-t mt-auto pt-4 pb-4" style={{ borderColor: "var(--border-subtle)" }}>
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
          className="text-[10px]"
        >
          {tool.pricing}
        </Badge>

        <Link
          href={tool.link}
          target="_blank"
          rel="noopener noreferrer"
          className="text-slate-500 hover:text-white transition-colors flex items-center gap-1.5 text-xs font-medium group/link"
        >
          Visit
          <ExternalLink className="w-3 h-3 group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5 transition-transform" />
        </Link>
      </CardFooter>
    </Card>
  );
}
