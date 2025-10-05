'use client';
import React from 'react';
import { motion } from 'framer-motion';
import { Briefcase, GraduationCap } from 'lucide-react';
import { fadeInUp, staggerContainer } from '@/components/landing/animations';

interface AboutExperienceProps {
  className?: string;
}

export default function AboutExperience({ className = '' }: AboutExperienceProps) {
  const experiences = [
    {
      title: "Junior Full Stack MERN Developer",
      company: "DS Legends",
      location: "Singapore (remote)",
      period: "Feb 2022 - Mar 2022",
      type: "Full-time",
      skills: ["React", "Node.js", "HTML", "CSS", "JavaScript", "Bootstrap", "Tailwind"],
      website: "https://dslegends.com"
    },
    {
      title: "Senior CS Instructor",
      company: "Programming Hero",
      location: "Dhaka, Bangladesh",
      period: "Mar 2022 - Present",
      type: "Full-time",
      skills: ["React", "Node.js", "Express.js", "MongoDB", "JavaScript", "Python", "Next.js"],
      website: "https://programming-hero.com"
    }
  ];

  const education = [
    {
      title: "Bachelor of Science",
      institution: "BGC Trust University Bangladesh",
      field: "Computer Science & Engineering",
      period: "Jan 2020 - Feb 2024"
    },
    {
      title: "Master of Science (Ongoing)",
      institution: "University of Dhaka",
      field: "Computer Science & Engineering",
      period: "Jul 2024 - Present"
    }
  ];

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
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-green-500 to-emerald-600 flex items-center justify-center">
              <Briefcase className="w-5 h-5 text-white" />
            </div>
            Experience & Education
          </h3>
        </motion.div>

        <motion.div 
          initial="initial" 
          whileInView="animate" 
          viewport={{ once: true }}
          variants={staggerContainer}
          className="space-y-8"
        >
          {/* Work Experience */}
          <motion.div variants={fadeInUp}>
            <h4 className="text-xl font-semibold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-green-600" />
              Work Experience
            </h4>
            <div className="space-y-4">
              {experiences.map((exp, index) => (
                <motion.div 
                  key={index}
                  whileHover={{ y: -4 }}
                  className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-gray-200/50 dark:border-gray-700/50 hover:shadow-xl transition-all duration-300"
                >
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
                    <div>
                      <div className="font-bold text-gray-900 dark:text-white text-lg">{exp.title}</div>
                      <div className="text-gray-600 dark:text-gray-300">{exp.company} — {exp.location}</div>
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400 mt-2 md:mt-0">
                      {exp.period} • {exp.type}
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {exp.skills.map((skill, skillIndex) => (
                      <span key={skillIndex} className="bg-gradient-to-r from-blue-100 to-indigo-100 dark:from-blue-900 dark:to-indigo-900 text-blue-700 dark:text-blue-200 px-3 py-1 rounded-full text-sm font-medium">
                        {skill}
                      </span>
                    ))}
                  </div>
                  <a 
                    href={exp.website} 
                    target="_blank" 
                    rel="noopener" 
                    className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 text-sm font-medium hover:underline transition-colors"
                  >
                    Visit Company Website →
                  </a>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Education */}
          <motion.div variants={fadeInUp}>
            <h4 className="text-xl font-semibold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-purple-600" />
              Education
            </h4>
            <div className="space-y-4">
              {education.map((edu, index) => (
                <motion.div 
                  key={index}
                  whileHover={{ y: -4 }}
                  className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-gray-200/50 dark:border-gray-700/50 hover:shadow-xl transition-all duration-300"
                >
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                    <div>
                      <div className="font-bold text-gray-900 dark:text-white text-lg">{edu.title}</div>
                      <div className="text-gray-600 dark:text-gray-300">{edu.institution}</div>
                      <div className="text-gray-500 dark:text-gray-400 text-sm">{edu.field}</div>
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400 mt-2 md:mt-0">
                      {edu.period}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
