'use client';
import React from 'react';
import { motion } from 'framer-motion';
import EnhancedSearchBar from '@/components/search/EnhancedSearchBar';
import { aiTools } from '@/data/tools';
import { fadeInUp } from '@/components/landing/animations';

interface AiToolsHeroProps {
  className?: string;
}

export default function AiToolsHero({ className = '' }: AiToolsHeroProps) {
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
            AI Tools
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 max-w-4xl mx-auto leading-relaxed">
            Discover powerful AI-powered tools for productivity, creativity, and problem-solving. 
            From business analysis to health planning, our AI tools help you work smarter.
          </p>
        </motion.div>

        {/* Enhanced Search Bar */}
        <motion.div 
          initial="initial" 
          animate="animate" 
          variants={fadeInUp}
          transition={{ delay: 0.2 }}
          className="max-w-4xl mx-auto"
        >
          <EnhancedSearchBar
            tools={aiTools}
            onSearch={() => {}}
            onFilter={() => {}}
            onClear={() => {}}
            placeholder="Search AI tools..."
            className="w-full"
          />
        </motion.div>
      </div>
    </section>
  );
}
