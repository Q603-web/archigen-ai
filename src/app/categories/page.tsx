import { categories } from "@/lib/data";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { CategoriesGrid } from "@/components/CategoriesGrid";

export default function CategoriesPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <main className="flex-grow pt-16 pb-28">
        <div className="container mx-auto px-4 md:px-8">
          <div className="mb-14">
            <p className="text-xs text-blue-400 tracking-[0.2em] uppercase font-semibold mb-4">
              Browse by Category
            </p>
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-5 tracking-tight font-heading">
              Categories
            </h1>
            <p className="text-slate-500 text-lg max-w-2xl">
              Explore AI tools organized by their primary function in
              architectural workflows.
            </p>
          </div>

          <CategoriesGrid categories={categories} />
        </div>
      </main>

      <Footer />
    </div>
  );
}
