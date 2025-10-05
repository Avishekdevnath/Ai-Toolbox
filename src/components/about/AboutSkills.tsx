'use client';
import React from 'react';
import { motion } from 'framer-motion';
import { Code2 } from 'lucide-react';
import { fadeInUp, staggerContainer } from '@/components/landing/animations';

interface AboutSkillsProps {
  className?: string;
}

export default function AboutSkills({ className = '' }: AboutSkillsProps) {
  const skills = [
    { name: 'JavaScript', category: 'frontend' },
    { name: 'TypeScript', category: 'frontend' },
    { name: 'React', category: 'frontend' },
    { name: 'Next.js', category: 'frontend' },
    { name: 'Node.js', category: 'backend' },
    { name: 'Express.js', category: 'backend' },
    { name: 'MongoDB', category: 'database' },
    { name: 'HTML', category: 'frontend' },
    { name: 'CSS', category: 'frontend' },
    { name: 'Bootstrap', category: 'frontend' },
    { name: 'Tailwind CSS', category: 'frontend' },
    { name: 'Python', category: 'backend' },
    { name: 'Docker', category: 'devops' },
    { name: 'Kubernetes', category: 'devops' },
    { name: 'Django', category: 'backend' }
  ];

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'frontend':
        return 'from-blue-500 to-cyan-500';
      case 'backend':
        return 'from-green-500 to-emerald-500';
      case 'database':
        return 'from-purple-500 to-pink-500';
      case 'devops':
        return 'from-orange-500 to-red-500';
      default:
        return 'from-gray-500 to-gray-600';
    }
  };

  return (
    <section className={`py-12 px-4 ${className}`}>
      <div className="max-w-4xl mx-auto">
        <motion.div 
          initial="initial" 
          whileInView="animate" 
          viewport={{ once: true }}
          variants={fadeInUp}
        >
          <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-8 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
              <Code2 className="w-5 h-5 text-white" />
            </div>
            Skills & Technologies
          </h3>
        </motion.div>

        <motion.div 
          initial="initial" 
          whileInView="animate" 
          viewport={{ once: true }}
          variants={staggerContainer}
          className="flex flex-wrap gap-3"
        >
          {skills.map((skill, index) => (
            <motion.span 
              key={index}
              variants={fadeInUp}
              whileHover={{ scale: 1.05, y: -2 }}
              className={`bg-gradient-to-r ${getCategoryColor(skill.category)} text-white px-4 py-2 rounded-full text-sm font-medium shadow-lg hover:shadow-xl transition-all duration-300 cursor-default`}
            >
              {skill.name}
            </motion.span>
          ))}
        </motion.div>

        {/* Skill Categories */}
        <motion.div 
          initial="initial" 
          whileInView="animate" 
          viewport={{ once: true }}
          variants={fadeInUp}
          className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4"
        >
          <div className="text-center">
            <div className="w-16 h-16 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center mx-auto mb-2">
              <span className="text-white font-bold text-sm">FE</span>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-300">Frontend</p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center mx-auto mb-2">
              <span className="text-white font-bold text-sm">BE</span>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-300">Backend</p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center mx-auto mb-2">
              <span className="text-white font-bold text-sm">DB</span>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-300">Database</p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 rounded-full bg-gradient-to-r from-orange-500 to-red-500 flex items-center justify-center mx-auto mb-2">
              <span className="text-white font-bold text-sm">DO</span>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-300">DevOps</p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
