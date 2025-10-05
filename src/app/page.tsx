'use client';
import Navbar from "@/components/Navbar";
import NewFooter from "@/components/NewFooter";
import Hero from "@/components/landing/Hero";
import Features from "@/components/landing/Features";
import ToolsShowcase from "@/components/landing/ToolsShowcase";
import HowItWorks from "@/components/landing/HowItWorks";
import Testimonials from "@/components/landing/Testimonials";
import CtaBanner from "@/components/landing/CtaBanner";

// Animation variants
const fadeInUp = {
  initial: { opacity: 0, y: 60 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: "easeOut" }
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

const scaleIn = {
  initial: { opacity: 0, scale: 0.8 },
  animate: { opacity: 1, scale: 1 },
  transition: { duration: 0.5, ease: "easeOut" }
};

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900">
      <Navbar />
      <main className="flex-1">
        <Hero />
        <Features />
        <ToolsShowcase />
        <HowItWorks />
        <Testimonials />
        <CtaBanner />
        </main>
      <NewFooter />
    </div>
  );
}
