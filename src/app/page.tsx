'use client';

import PageLayout from '@/components/layout/PageLayout';
import Hero from '@/components/landing/Hero';
import TrustBar from '@/components/landing/TrustBar';
import Features from '@/components/landing/Features';
import ToolsShowcase from '@/components/landing/ToolsShowcase';
import HowItWorks from '@/components/landing/HowItWorks';
import Testimonials from '@/components/landing/Testimonials';
import CtaBanner from '@/components/landing/CtaBanner';

export default function Home() {
  return (
    <PageLayout>
      <Hero />
      <TrustBar />
      <Features />
      <ToolsShowcase />
      <HowItWorks />
      <Testimonials />
      <CtaBanner />
    </PageLayout>
  );
}
