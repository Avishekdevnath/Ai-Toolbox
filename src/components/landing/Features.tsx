'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Zap, Shield, Users, TrendingUp } from 'lucide-react';
import { fadeInUp, staggerContainer, scaleIn } from './animations';

export default function Features() {
  const features = [
    { icon: <Zap className="w-8 h-8" />, title: 'AI-Powered', description: 'Harness cutting-edge artificial intelligence for smarter, faster results', color: 'from-blue-500 to-cyan-500' },
    { icon: <Shield className="w-8 h-8" />, title: 'Privacy-First', description: 'Your data stays yours. We never sell or misuse your information', color: 'from-green-500 to-emerald-500' },
    { icon: <Users className="w-8 h-8" />, title: 'Community-Driven', description: 'Built by the community, for the community. Open source and transparent', color: 'from-purple-500 to-pink-500' },
    { icon: <TrendingUp className="w-8 h-8" />, title: 'Always Evolving', description: 'Continuously updated with new tools and features based on user feedback', color: 'from-orange-500 to-red-500' },
  ];

  return (
    <section className="py-24 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4">
        <motion.div className="text-center mb-16" initial="initial" whileInView="animate" viewport={{ once: true }} variants={fadeInUp}>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">Why Choose <span className="text-blue-600 dark:text-blue-400">AI Toolbox</span>?</h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">Experience the future of productivity with our cutting-edge AI tools and utilities</p>
        </motion.div>
        <motion.div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8" initial="initial" whileInView="animate" viewport={{ once: true }} variants={staggerContainer}>
          {features.map((feature, idx) => (
            <motion.div key={idx} variants={scaleIn} className="group bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-gray-100 dark:border-gray-700">
              <div className={`inline-flex p-4 rounded-2xl bg-gradient-to-r ${feature.color} text-white mb-6 group-hover:scale-110 transition-transform duration-300`}>{feature.icon}</div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">{feature.title}</h3>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">{feature.description}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}


