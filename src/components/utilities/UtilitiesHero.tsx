'use client';
import React from 'react';
import { motion } from 'framer-motion';
import EnhancedSearchBar from '@/components/search/EnhancedSearchBar';
import { utilityTools } from '@/data/tools';
import { fadeInUp } from '@/components/landing/animations';

interface UtilitiesHeroProps {
  className?: string;
}

export default function UtilitiesHero({ className = '' }: UtilitiesHeroProps) {
  return (
    <section className={`py-8 px-4 ${className}`}>
      <div className="max-w-7xl mx-auto">
        <motion.div 
          initial="initial" 
          animate="animate" 
          variants={fadeInUp}
          className="text-center mb-8"
        >
          <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-6">
            Utilities
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 max-w-4xl mx-auto leading-relaxed">
            Essential utility tools for everyday tasks. From URL shortening to password generation, 
            these tools make your digital life easier and more efficient.
          </p>
        </motion.div>

        <motion.div 
          initial="initial" 
          animate="animate" 
          variants={fadeInUp}
          transition={{ delay: 0.2 }}
          className="max-w-4xl mx-auto"
        >
          <EnhancedSearchBar
            tools={utilityTools}
            onSearch={() => {}}
            onFilter={() => {}}
            onClear={() => {}}
            placeholder="Search utilities..."
            className="w-full"
          />
        </motion.div>
      </div>
    </section>
  );
}


