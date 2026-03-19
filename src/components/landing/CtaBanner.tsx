'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Github, Zap } from 'lucide-react';
import { fadeInUp } from './animations';
import { Button } from '@/components/ui/button';

export default function CtaBanner() {
  return (
    <section className="bg-[var(--color-primary)] py-20">
      <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
        <motion.div initial="initial" whileInView="animate" viewport={{ once: true }} variants={fadeInUp}>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Transform Your Workflow?
          </h2>
          <p className="text-lg text-white/80 mb-8 max-w-2xl mx-auto">
            Join thousands of users who are already boosting their productivity with AI Toolbox
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild variant="secondary" className="rounded-lg">
              <Link href="/ai-tools" className="inline-flex items-center gap-2">
                <Zap className="w-4 h-4" />
                Start Using AI Tools
                <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" className="rounded-lg border-white/40 text-white hover:bg-white/10 hover:text-white bg-transparent">
              <Link href="https://github.com" className="inline-flex items-center gap-2">
                <Github className="w-4 h-4" />
                View on GitHub
              </Link>
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
