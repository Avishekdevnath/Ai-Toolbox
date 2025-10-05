'use client';

import React from 'react';
import Navbar from '@/components/Navbar';
import NewFooter from '@/components/NewFooter';
import { 
  ContactHero, 
  ContactFormSection, 
  ContactInfoSection, 
  ContactFaqSection, 
  ContactCtaSection 
} from '@/components/contact';

export default function ContactPage() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900">
      <Navbar />
      <main className="flex-1">
        <ContactHero />
        <ContactFormSection />
        <ContactInfoSection />
        <ContactFaqSection />
        <ContactCtaSection />
      </main>
      <NewFooter />
    </div>
  );
} 