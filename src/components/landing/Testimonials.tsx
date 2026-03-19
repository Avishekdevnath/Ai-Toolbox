'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Star } from 'lucide-react';
import { fadeInUp } from './animations';
import SectionContainer from '@/components/layout/SectionContainer';
import SectionHeader from '@/components/layout/SectionHeader';

export default function Testimonials() {
  const testimonials = [
    {
      name: 'Alex Chen',
      role: 'Product Manager',
      avatar: 'AC',
      content: 'AI Toolbox has revolutionized how I approach data analysis. The SWOT tool alone saves me hours every week!',
      rating: 5,
    },
    {
      name: 'Priya Sharma',
      role: 'Developer',
      avatar: 'PS',
      content: 'The privacy-first approach is exactly what I needed. Powerful AI tools without compromising my data security.',
      rating: 5,
    },
    {
      name: 'Sam Rodriguez',
      role: 'Designer',
      avatar: 'SR',
      content: 'Beautiful interface, powerful features. This is what modern productivity tools should look like.',
      rating: 5,
    },
  ];

  return (
    <section>
      <SectionContainer>
        <motion.div initial="initial" whileInView="animate" viewport={{ once: true }} variants={fadeInUp}>
          <SectionHeader
            title="Loved by Thousands"
            highlight="Thousands"
            subtitle="See what our users have to say about their experience"
          />
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((t, idx) => (
            <motion.div
              key={idx}
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
              variants={fadeInUp}
              className="bg-[var(--color-surface)] rounded-xl p-6 shadow-sm border border-[var(--color-border)]"
            >
              <div className="flex items-center gap-1 mb-4">
                {[...Array(t.rating)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 text-amber-500 fill-amber-500" />
                ))}
              </div>
              <p className="text-sm text-[var(--color-text-secondary)] mb-6 leading-relaxed">"{t.content}"</p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[var(--color-primary)] rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                  {t.avatar}
                </div>
                <div>
                  <div className="text-sm font-semibold text-[var(--color-text-primary)]">{t.name}</div>
                  <div className="text-xs text-[var(--color-text-secondary)]">{t.role}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </SectionContainer>
    </section>
  );
}
