'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { fadeInUp } from './animations';
import SectionContainer from '@/components/layout/SectionContainer';
import SectionHeader from '@/components/layout/SectionHeader';

export default function HowItWorks() {
  const steps = [
    {
      step: '01',
      title: 'Choose Your Tool',
      description: 'Browse our collection of AI tools and utilities',
    },
    {
      step: '02',
      title: 'Input Your Data',
      description: 'Enter your information or upload files as needed',
    },
    {
      step: '03',
      title: 'Get Instant Results',
      description: 'Watch AI process your data and generate insights',
    },
    {
      step: '04',
      title: 'Take Action',
      description: 'Download, share, or use your results immediately',
    },
  ];

  return (
    <section className="bg-[var(--color-muted)]">
      <SectionContainer>
        <motion.div initial="initial" whileInView="animate" viewport={{ once: true }} variants={fadeInUp}>
          <SectionHeader
            title="How It Works"
            highlight="Works"
            subtitle="Get started in minutes with our intuitive, step-by-step process"
          />
        </motion.div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {steps.map((s, idx) => (
            <motion.div
              key={idx}
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
              variants={fadeInUp}
              className="text-center"
            >
              <div className="inline-flex items-center justify-center p-3 rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)] mb-4">
                <span className="text-xl font-bold text-[var(--color-primary)]">{s.step}</span>
              </div>
              <h3 className="text-lg font-semibold text-[var(--color-text-primary)] mb-2">{s.title}</h3>
              <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">{s.description}</p>
            </motion.div>
          ))}
        </div>
      </SectionContainer>
    </section>
  );
}
