'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { aiTools, utilityTools } from '@/data/tools';
import { fadeInUp } from './animations';
import SectionContainer from '@/components/layout/SectionContainer';
import SectionHeader from '@/components/layout/SectionHeader';
import ToolCard from '@/components/tools/ToolCard';
import { Button } from '@/components/ui/button';

export default function ToolsShowcase() {
  const [activeTab, setActiveTab] = useState<'ai' | 'utility'>('ai');

  const tools = activeTab === 'ai' ? aiTools.slice(0, 6) : utilityTools.slice(0, 6);

  return (
    <section>
      <SectionContainer>
        <motion.div initial="initial" whileInView="animate" viewport={{ once: true }} variants={fadeInUp}>
          <SectionHeader
            title="Explore Our Powerful Tools"
            highlight="Powerful Tools"
            subtitle="From AI-powered analysis to essential utilities, discover tools that transform how you work"
          />
          <div className="flex justify-center mb-10">
            <div className="inline-flex rounded-lg overflow-hidden border border-[var(--color-border)]">
              <button
                onClick={() => setActiveTab('ai')}
                className={`px-6 py-2.5 text-sm font-semibold transition-colors ${
                  activeTab === 'ai'
                    ? 'bg-[var(--color-primary)] text-white'
                    : 'bg-[var(--color-muted)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
                }`}
              >
                AI Tools
              </button>
              <button
                onClick={() => setActiveTab('utility')}
                className={`px-6 py-2.5 text-sm font-semibold transition-colors ${
                  activeTab === 'utility'
                    ? 'bg-[var(--color-primary)] text-white'
                    : 'bg-[var(--color-muted)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
                }`}
              >
                Utilities
              </button>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tools.map((tool) => (
            <motion.div key={tool.id} initial="initial" whileInView="animate" viewport={{ once: true }} variants={fadeInUp}>
              <ToolCard
                name={tool.name}
                description={tool.description}
                icon={tool.icon}
                href={tool.href}
                category={tool.category}
                features={tool.features}
                rating={tool.rating}
              />
            </motion.div>
          ))}
        </div>

        <motion.div
          className="text-center mt-10"
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          variants={fadeInUp}
        >
          <Button asChild>
            <Link href={activeTab === 'ai' ? '/ai-tools' : '/utilities'} className="inline-flex items-center gap-2">
              View All {activeTab === 'ai' ? 'AI Tools' : 'Utilities'}
              <ArrowRight className="w-4 h-4" />
            </Link>
          </Button>
        </motion.div>
      </SectionContainer>
    </section>
  );
}
