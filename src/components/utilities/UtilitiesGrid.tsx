'use client';
import React from 'react';
import { motion } from 'framer-motion';
import ToolCard from '@/components/ToolCard';
import { utilityTools } from '@/data/tools';
import { fadeInUp, staggerContainer } from '@/components/landing/animations';

interface UtilitiesGridProps {
  className?: string;
}

export default function UtilitiesGrid({ className = '' }: UtilitiesGridProps) {
  return (
    <section className={`py-4 px-4 ${className}`}>
      <div className="max-w-7xl mx-auto">
        <motion.div 
          initial="initial" 
          whileInView="animate" 
          viewport={{ once: true }}
          variants={staggerContainer}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
        >
          {utilityTools.map((tool, index) => (
            <motion.div
              key={tool.id}
              variants={fadeInUp}
              transition={{ delay: index * 0.1 }}
            >
              <ToolCard
                id={tool.id}
                name={tool.name}
                description={tool.description}
                icon={tool.icon}
                href={tool.href}
                features={tool.features}
                colorClass="green"
                userId={undefined}
                status={tool.status}
              />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}


