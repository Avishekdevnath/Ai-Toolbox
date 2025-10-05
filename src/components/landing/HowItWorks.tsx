'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { fadeInUp, staggerContainer, scaleIn } from './animations';

export default function HowItWorks() {
  const steps = [
    { step: '01', title: 'Choose Your Tool', description: 'Browse our collection of AI tools and utilities', color: 'from-blue-500 to-cyan-500' },
    { step: '02', title: 'Input Your Data', description: 'Enter your information or upload files as needed', color: 'from-purple-500 to-pink-500' },
    { step: '03', title: 'Get Instant Results', description: 'Watch AI process your data and generate insights', color: 'from-green-500 to-emerald-500' },
    { step: '04', title: 'Take Action', description: 'Download, share, or use your results immediately', color: 'from-orange-500 to-red-500' },
  ];

  return (
    <section className="py-24 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-7xl mx-auto px-4">
        <motion.div className="text-center mb-16" initial="initial" whileInView="animate" viewport={{ once: true }} variants={fadeInUp}>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">How It <span className="text-blue-600 dark:text-blue-400">Works</span></h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">Get started in minutes with our intuitive, step-by-step process</p>
        </motion.div>
        <motion.div className="grid grid-cols-1 md:grid-cols-4 gap-8" initial="initial" whileInView="animate" viewport={{ once: true }} variants={staggerContainer}>
          {steps.map((s, idx) => (
            <motion.div key={idx} variants={scaleIn} className="text-center group">
              <div className={`inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-r ${s.color} text-white text-2xl font-bold mb-6 group-hover:scale-110 transition-transform duration-300`}>{s.step}</div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">{s.title}</h3>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">{s.description}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}


