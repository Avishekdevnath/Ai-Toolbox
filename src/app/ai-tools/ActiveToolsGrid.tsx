'use client';

import { useState, useEffect } from 'react';
import ToolCard from '@/components/tools/ToolCard';
import { aiTools, utilityTools } from '@/data/tools';

const allTools = [...aiTools, ...utilityTools];

export function ActiveToolsGrid() {
  const [disabledSlugs, setDisabledSlugs] = useState<string[]>([]);

  useEffect(() => {
    fetch('/api/tools')
      .then((r) => r.json())
      .then((d) => setDisabledSlugs(d.disabledSlugs ?? []))
      .catch(() => {});
  }, []);

  const activeTools = allTools.filter((t) => !disabledSlugs.includes(t.id));
  const allCategories = ['All', ...Array.from(new Set(activeTools.map((t) => t.category)))];
  const [activeCategory, setActiveCategory] = useState('All');

  const filtered = activeCategory === 'All'
    ? activeTools
    : activeTools.filter((t) => t.category === activeCategory);

  return (
    <>
      {/* Category filter chips */}
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

      {filtered.length === 0 ? (
        <p className="text-center text-sm text-gray-400 py-10">No tools available in this category.</p>
      ) : (
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
      )}
    </>
  );
}
