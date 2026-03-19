'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Zap, Shield, Users, TrendingUp } from 'lucide-react';
import { fadeInUp } from './animations';
import SectionContainer from '@/components/layout/SectionContainer';
import SectionHeader from '@/components/layout/SectionHeader';

export default function Features() {
  const features = [
    {
      icon: <Zap className="w-6 h-6 text-[var(--color-primary)]" />,
      title: 'AI-Powered',
      description: 'Harness cutting-edge artificial intelligence for smarter, faster results',
    },
    {
      icon: <Shield className="w-6 h-6 text-[var(--color-primary)]" />,
      title: 'Privacy-First',
      description: 'Your data stays yours. We never sell or misuse your information',
    },
    {
      icon: <Users className="w-6 h-6 text-[var(--color-primary)]" />,
      title: 'Community-Driven',
      description: 'Built by the community, for the community. Open source and transparent',
    },
    {
      icon: <TrendingUp className="w-6 h-6 text-[var(--color-primary)]" />,
      title: 'Always Evolving',
      description: 'Continuously updated with new tools and features based on user feedback',
    },
  ];

  return (
    <section className="bg-[var(--color-surface)]">
      <SectionContainer>
        <motion.div initial="initial" whileInView="animate" viewport={{ once: true }} variants={fadeInUp}>
          <SectionHeader
            title="Why Choose AI Toolbox?"
            highlight="AI Toolbox?"
            subtitle="Experience the future of productivity with our cutting-edge AI tools and utilities"
          />
        </motion.div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, idx) => (
            <motion.div
              key={idx}
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
              variants={fadeInUp}
              className="bg-[var(--color-surface)] rounded-xl p-6 shadow-sm border border-[var(--color-border)]"
            >
              <div className="p-3 rounded-lg bg-[var(--color-muted)] inline-flex mb-4">
                {feature.icon}
              </div>
              <h3 className="text-lg font-semibold text-[var(--color-text-primary)] mb-2">{feature.title}</h3>
              <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </SectionContainer>
    </section>
  );
}
