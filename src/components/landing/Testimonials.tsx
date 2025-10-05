'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Star } from 'lucide-react';
import { fadeInUp, staggerContainer, scaleIn } from './animations';

export default function Testimonials() {
  const testimonials = [
    { name: 'Alex Chen', role: 'Product Manager', avatar: 'AC', content: 'AI Toolbox has revolutionized how I approach data analysis. The SWOT tool alone saves me hours every week!', rating: 5 },
    { name: 'Priya Sharma', role: 'Developer', avatar: 'PS', content: 'The privacy-first approach is exactly what I needed. Powerful AI tools without compromising my data security.', rating: 5 },
    { name: 'Sam Rodriguez', role: 'Designer', avatar: 'SR', content: 'Beautiful interface, powerful features. This is what modern productivity tools should look like.', rating: 5 },
  ];

  return (
    <section className="py-24">
      <div className="max-w-7xl mx-auto px-4">
        <motion.div className="text-center mb-16" initial="initial" whileInView="animate" viewport={{ once: true }} variants={fadeInUp}>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">Loved by <span className="text-blue-600 dark:text-blue-400">Thousands</span></h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">See what our users have to say about their experience</p>
        </motion.div>

        <motion.div className="grid grid-cols-1 md:grid-cols-3 gap-8" initial="initial" whileInView="animate" viewport={{ once: true }} variants={staggerContainer}>
          {testimonials.map((t, idx) => (
            <motion.div key={idx} variants={scaleIn} className="bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 dark:border-gray-700">
              <div className="flex items-center gap-1 mb-4">
                {[...Array(t.rating)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                ))}
              </div>
              <p className="text-gray-700 dark:text-gray-200 mb-6 leading-relaxed">"{t.content}"</p>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">{t.avatar}</div>
                <div>
                  <div className="font-semibold text-gray-900 dark:text-white">{t.name}</div>
                  <div className="text-gray-600 dark:text-gray-400 text-sm">{t.role}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}


