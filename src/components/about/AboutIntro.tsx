'use client';
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { User, ExternalLink, Globe, Linkedin } from 'lucide-react';
import { fadeInUp } from '@/components/landing/animations';

interface AboutIntroProps {
  className?: string;
}

interface AboutInfo {
  description?: string;
  portfolioUrl?: string;
  socialLinks?: {
    linkedin?: string;
    github?: string;
    twitter?: string;
    instagram?: string;
    website?: string;
  };
}

export default function AboutIntro({ className = '' }: AboutIntroProps) {
  const [aboutInfo, setAboutInfo] = useState<AboutInfo>({});

  useEffect(() => {
    const fetchAboutInfo = async () => {
      try {
        const res = await fetch('/api/about/info', { cache: 'no-store' });
        if (res.ok) {
          const data = await res.json();
          setAboutInfo(data?.data || {});
        }
      } catch (error) {
        console.error('Failed to fetch about info:', error);
      }
    };

    fetchAboutInfo();
  }, []);

  return (
    <section className={`py-12 px-4 ${className}`}>
      <div className="max-w-4xl mx-auto">
        <motion.div 
          initial="initial" 
          whileInView="animate" 
          viewport={{ once: true }}
          variants={fadeInUp}
        >
          <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
              <User className="w-5 h-5 text-white" />
            </div>
            About Me
          </h3>
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-lg p-8 border border-gray-200/50 dark:border-gray-700/50">
            <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
              {aboutInfo.description || 'Hi, I\'m Avishek Devnath! I am a CSE graduate from BGC Trust University and an MSc student at Dhaka University, specializing in MERN Stack development with experience in Docker, Kubernetes, and Django. As a Senior CS Instructor at Phitron, I\'ve mentored students in C, C++, Python, DSA, SQL, and web development, and built open-source projects like Xerror and Py-OneSend. I am now seeking opportunities as a Software Engineer to build scalable, secure, and user-focused applications.'}
            </p>
            <div className="flex flex-wrap gap-4">
              {aboutInfo.portfolioUrl && (
                <a
                  href={aboutInfo.portfolioUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  <Globe className="w-4 h-4" />
                  View My Portfolio
                </a>
              )}
              {aboutInfo.socialLinks?.linkedin && (
                <a
                  href={aboutInfo.socialLinks.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  <Linkedin className="w-4 h-4" />
                  Connect on LinkedIn
                </a>
              )}
              {aboutInfo.socialLinks?.github && (
                <a
                  href={aboutInfo.socialLinks.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200"
                >
                  <ExternalLink className="w-4 h-4" />
                  View My GitHub
                </a>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
