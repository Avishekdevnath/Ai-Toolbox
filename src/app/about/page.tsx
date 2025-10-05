'use client';
import React from 'react';
import Navbar from '@/components/Navbar';
import NewFooter from '@/components/NewFooter';
import AboutHero from '@/components/about/AboutHero';
import AboutIntro from '@/components/about/AboutIntro';
import AboutExperience from '@/components/about/AboutExperience';
import AboutSkills from '@/components/about/AboutSkills';
import AboutContact from '@/components/about/AboutContact';

export default function AboutMePage() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900">
      <Navbar />
      <main className="flex-1">
        <AboutHero />
        <AboutIntro />
        <AboutExperience />
        <AboutSkills />
        <AboutContact />
      </main>
      <NewFooter />
    </div>
  );
} 