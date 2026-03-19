'use client';
import React, { useState } from 'react';
import PageLayout from '@/components/layout/PageLayout';
import SectionContainer from '@/components/layout/SectionContainer';
import SectionHeader from '@/components/layout/SectionHeader';
import ToolCard from '@/components/tools/ToolCard';
import { utilityTools } from '@/data/tools';

const allCategories = ['All', ...Array.from(new Set(utilityTools.map((t) => t.category)))];

export default function UtilitiesPage() {
  const [activeCategory, setActiveCategory] = useState('All');

  const filtered = activeCategory === 'All'
    ? utilityTools
    : utilityTools.filter((t) => t.category === activeCategory);

  return (
    <PageLayout>
      <SectionContainer size="lg" padding="normal">
        <SectionHeader
          title="Utility Tools"
          highlight="Utility"
          subtitle="A collection of practical tools to simplify everyday tasks, manage your data, and keep your workflow running smoothly."
        />

        <div className="flex flex-wrap gap-2 justify-center mb-10">
          {allCategories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={[
                'px-4 py-1.5 rounded-full text-sm font-medium border transition-colors',
                activeCategory === cat
                  ? 'bg-[var(--color-primary)] text-white border-[var(--color-primary)]'
                  : 'bg-transparent text-[var(--color-text-secondary)] border-[var(--color-border)] hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]',
              ].join(' ')}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((tool) => (
            <ToolCard
              key={tool.id}
              name={tool.name}
              description={tool.description}
              icon={tool.icon}
              href={tool.href}
              category={tool.category}
              features={tool.features}
              rating={tool.rating}
              status={tool.status}
            />
          ))}
        </div>
      </SectionContainer>
    </PageLayout>
  );
}
