'use client';
import React from 'react';
import { motion } from 'framer-motion';
import { fadeInUp } from '@/components/landing/animations';

interface AiToolsCtaProps {
  className?: string;
}

export default function AiToolsCta({ className = '' }: AiToolsCtaProps) {
  return (
    <section className={`py-10 px-4 ${className}`}>
      <div className="max-w-4xl mx-auto text-center">
        <motion.div 
          initial="initial" 
          whileInView="animate" 
          viewport={{ once: true }}
          variants={fadeInUp}
        >
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
            Ready to Boost Your Productivity?
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
            Start using these AI tools today and experience the power of artificial intelligence in your workflow.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <motion.a
              href="/utilities"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-2xl font-semibold text-lg shadow-xl hover:shadow-2xl transition-all duration-300"
            >
              Explore Utilities
            </motion.a>
            <motion.a
              href="/dashboard"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm text-gray-900 dark:text-white px-8 py-4 rounded-2xl font-semibold text-lg border border-gray-300 dark:border-gray-600 hover:bg-white/30 transition-all duration-300"
            >
              Go to Dashboard
            </motion.a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
