'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Github, Zap } from 'lucide-react';
import { fadeInUp } from './animations';

export default function CtaBanner() {
  return (
    <section className="py-24 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600">
      <div className="max-w-4xl mx-auto text-center px-4">
        <motion.div initial="initial" whileInView="animate" viewport={{ once: true }} variants={fadeInUp}>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">Ready to Transform Your Workflow?</h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">Join thousands of users who are already boosting their productivity with AI Toolbox</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/ai-tools" className="inline-flex items-center gap-2 bg-white text-gray-900 px-8 py-4 rounded-2xl font-semibold text-lg shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
              <Zap className="w-5 h-5" />
              Start Using AI Tools
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link href="https://github.com" className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm text-white px-8 py-4 rounded-2xl font-semibold text-lg border border-white/30 hover:bg-white/30 transition-all duration-300">
              <Github className="w-5 h-5" />
              View on GitHub
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}


