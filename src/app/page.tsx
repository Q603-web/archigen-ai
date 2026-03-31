import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { HomeEditorial } from "@/components/HomeEditorial";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow">
        <HomeEditorial />
      </main>
      <Footer />
    </div>
  );
}
