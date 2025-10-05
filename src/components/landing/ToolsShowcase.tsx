'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Star } from 'lucide-react';
import { aiTools, utilityTools } from '@/data/tools';
import { fadeInUp, staggerContainer, scaleIn } from './animations';

export default function ToolsShowcase() {
  const [activeTab, setActiveTab] = useState<'ai' | 'utility'>('ai');
  const featuredAITools = aiTools.slice(0, 6);
  const featuredUtilityTools = utilityTools.slice(0, 6);

  const tools = activeTab === 'ai' ? featuredAITools : featuredUtilityTools;

  return (
    <section className="py-24">
      <div className="max-w-7xl mx-auto px-4">
        <motion.div className="text-center mb-16" initial="initial" whileInView="animate" viewport={{ once: true }} variants={fadeInUp}>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">Explore Our <span className="text-blue-600 dark:text-blue-400">Powerful Tools</span></h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto mb-8">From AI-powered analysis to essential utilities, discover tools that transform how you work</p>
          <div className="inline-flex bg-gray-100 dark:bg-gray-800 rounded-2xl p-2">
            <button onClick={() => setActiveTab('ai')} className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${activeTab === 'ai' ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-lg' : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'}`}>AI Tools</button>
            <button onClick={() => setActiveTab('utility')} className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${activeTab === 'utility' ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-lg' : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'}`}>Utilities</button>
          </div>
        </motion.div>

        <motion.div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8" initial="initial" animate="animate" variants={staggerContainer}>
          {tools.map((tool) => (
            <motion.div key={tool.id} variants={scaleIn} className="group bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-gray-100 dark:border-gray-700">
              <div className="flex items-start justify-between mb-4">
                <div className="text-4xl">{tool.icon}</div>
                <div className="flex items-center gap-1 text-yellow-500">
                  <Star className="w-4 h-4 fill-current" />
                  <span className="text-sm font-medium">{tool.rating}</span>
                </div>
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{tool.name}</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4 leading-relaxed">{tool.description}</p>
              <div className="flex flex-wrap gap-2 mb-6">
                {tool.features.slice(0, 2).map((feature, idx) => (
                  <span key={idx} className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-sm rounded-full">{feature}</span>
                ))}
              </div>
              <Link href={tool.href} className="group/link inline-flex items-center gap-2 text-blue-600 dark:text-blue-400 font-semibold hover:text-blue-700 dark:hover:text-blue-300 transition-colors">
                Try Now
                <ArrowRight className="w-4 h-4 group-hover/link:translate-x-1 transition-transform" />
              </Link>
            </motion.div>
          ))}
        </motion.div>

        <motion.div className="text-center mt-12" initial="initial" whileInView="animate" viewport={{ once: true }} variants={fadeInUp}>
          <Link href={activeTab === 'ai' ? '/ai-tools' : '/utilities'} className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-2xl font-semibold text-lg shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
            View All {activeTab === 'ai' ? 'AI Tools' : 'Utilities'}
            <ArrowRight className="w-5 h-5" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}


