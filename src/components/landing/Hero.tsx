'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { fadeInUp } from '@/components/landing/animations';

export default function Hero() {
  return (
    <section
      className="relative overflow-hidden"
      style={{
        background:
          'radial-gradient(ellipse at 50% 0%, color-mix(in srgb, var(--color-primary) 8%, transparent) 0%, transparent 70%)',
      }}
    >
      <div className="relative max-w-7xl mx-auto px-4 py-24 lg:py-32">
        <motion.div
          className="text-center"
          initial="initial"
          animate="animate"
        >
          {/* Badge pill */}
          <motion.div variants={fadeInUp} className="mb-8">
            <div
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full border mb-6"
              style={{
                backgroundColor: 'var(--color-muted)',
                borderColor: 'var(--color-border)',
              }}
            >
              <Sparkles
                className="w-4 h-4"
                style={{ color: 'var(--color-primary)' }}
              />
              <span
                className="text-sm font-medium"
                style={{ color: 'var(--color-text-secondary)' }}
              >
                Powered by Advanced AI Technology
              </span>
            </div>

            {/* Headline */}
            <h1
              className="text-5xl md:text-7xl lg:text-8xl font-bold mb-6 tracking-tight"
              style={{ color: 'var(--color-text-primary)' }}
            >
              AI Toolbox
            </h1>

            {/* Subheadline */}
            <p
              className="text-xl md:text-2xl lg:text-3xl mb-8 max-w-4xl mx-auto leading-relaxed"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              The ultimate suite of{' '}
              <span
                className="font-semibold"
                style={{ color: 'var(--color-primary)' }}
              >
                AI-powered tools
              </span>{' '}
              and utilities designed to supercharge your productivity and creativity
            </p>
          </motion.div>

          {/* CTA Buttons */}
          <motion.div
            variants={fadeInUp}
            className="flex flex-col sm:flex-row gap-4 justify-center mb-12"
          >
            <Button variant="primary" size="lg" asChild>
              <Link href="/ai-tools" className="inline-flex items-center gap-2">
                <Zap className="w-5 h-5" />
                Explore AI Tools
                <ArrowRight className="w-5 h-5" />
              </Link>
            </Button>

            <Button variant="outline" size="lg" asChild>
              <Link href="/utilities" className="inline-flex items-center gap-2">
                Browse Utilities
              </Link>
            </Button>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
