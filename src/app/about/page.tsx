'use client';

import React from 'react';
import { Briefcase, GraduationCap, Mail, Linkedin, Globe, Phone, MapPin, Code2, Layers, BookOpen, User } from 'lucide-react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import NewFooter from '@/components/NewFooter';

const projects: any[] = []; // Add projects here if available

export default function AboutMePage() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 via-white to-blue-100 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900">
      <Navbar />
      <main className="flex-1 py-12">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="text-center mb-10">
            <div className="w-24 h-24 rounded-full bg-blue-200 dark:bg-blue-900 flex items-center justify-center mx-auto mb-4 text-4xl font-bold text-blue-700 dark:text-blue-200">
              AD
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white mb-2">Avishek Devnath</h1>
            <h2 className="text-xl text-blue-600 font-semibold mb-2">Full-Stack Developer (MERN)</h2>
            <p className="text-gray-700 dark:text-gray-300 max-w-xl mx-auto mb-4">
              I'm a passionate Full-Stack Developer with over 3 years of experience building modern web applications. I specialize in the MERN stack (MongoDB, Express.js, React, Node.js) and love creating intuitive, user-friendly solutions that make a real impact.
            </p>
            <div className="flex flex-wrap justify-center gap-4 mt-4">
              <a href="mailto:avishekdevnath@gmail.com" className="inline-flex items-center gap-2 bg-blue-600 text-white px-5 py-2 rounded-lg font-semibold shadow hover:bg-blue-700 transition"><Mail className="w-5 h-5" />Email</a>
              <a href="https://www.linkedin.com/in/avishekdevnath" target="_blank" rel="noopener" className="inline-flex items-center gap-2 bg-blue-500 text-white px-5 py-2 rounded-lg font-semibold shadow hover:bg-blue-600 transition"><Linkedin className="w-5 h-5" />LinkedIn</a>
              <a href="https://avishekdevnath.com" target="_blank" rel="noopener" className="inline-flex items-center gap-2 bg-fuchsia-600 text-white px-5 py-2 rounded-lg font-semibold shadow hover:bg-fuchsia-700 transition"><Globe className="w-5 h-5" />Portfolio</a>
            </div>
          </div>

          {/* About Me */}
          <section className="mb-12">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2"><User className="w-6 h-6 text-blue-600" />Get to Know Me</h3>
            <p className="text-gray-700 dark:text-gray-300 mb-2">
              Hi, I'm Avishek Devnath! I'm a CSE graduate with a BSc from BGC Trust University Bangladesh, and I'm currently pursuing an MSc at Dhaka University. I specialize in MERN Stack Development and have explored technologies like Docker, Kubernetes, and Django. I'm seeking an internship or junior full-stack web developer role. I'm a quick learner, love to learn and apply new things, and always enjoy teamwork.
            </p>
          </section>

          {/* Experience & Education */}
          <section className="mb-12">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2"><Briefcase className="w-6 h-6 text-green-600" />Experience & Education</h3>
            <div className="space-y-6">
              {/* Work Experience */}
              <div>
                <h4 className="text-lg font-semibold text-gray-800 dark:text-white mb-2 flex items-center gap-2"><Briefcase className="w-5 h-5 text-green-600" />Work Experience</h4>
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 mb-2">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                    <div>
                      <div className="font-bold text-gray-900 dark:text-white">Junior Full Stack MERN Developer</div>
                      <div className="text-gray-600 dark:text-gray-300">DS Legends &mdash; Singapore (remote)</div>
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">Feb 2022 - Mar 2022 &bull; Full-time</div>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-2 text-xs">
                    <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded">React</span>
                    <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded">Node.js</span>
                    <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded">HTML</span>
                    <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded">CSS</span>
                    <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded">JavaScript</span>
                    <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded">Bootstrap</span>
                    <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded">Tailwind</span>
                  </div>
                  <a href="https://dslegends.com" target="_blank" rel="noopener" className="text-blue-600 hover:underline text-sm mt-2 inline-block">Visit Company Website</a>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                    <div>
                      <div className="font-bold text-gray-900 dark:text-white">Senior CS Instructor</div>
                      <div className="text-gray-600 dark:text-gray-300">Programming Hero &mdash; Dhaka, Bangladesh</div>
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">Mar 2022 - Present &bull; Full-time</div>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-2 text-xs">
                    <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded">React</span>
                    <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded">Node.js</span>
                    <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded">Express.js</span>
                    <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded">MongoDB</span>
                    <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded">JavaScript</span>
                    <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded">Python</span>
                    <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded">Next.js</span>
                  </div>
                  <a href="https://programming-hero.com" target="_blank" rel="noopener" className="text-blue-600 hover:underline text-sm mt-2 inline-block">Visit Company Website</a>
                </div>
              </div>
              {/* Education */}
              <div>
                <h4 className="text-lg font-semibold text-gray-800 dark:text-white mb-2 flex items-center gap-2"><GraduationCap className="w-5 h-5 text-fuchsia-600" />Education</h4>
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 mb-2">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                    <div>
                      <div className="font-bold text-gray-900 dark:text-white">Bachelor of Science</div>
                      <div className="text-gray-600 dark:text-gray-300">BGC Trust University Bangladesh &mdash; Computer Science & Engineering</div>
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">Jan 2020 - Feb 2024</div>
                  </div>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                    <div>
                      <div className="font-bold text-gray-900 dark:text-white">Master of Science (Ongoing)</div>
                      <div className="text-gray-600 dark:text-gray-300">University of Dhaka &mdash; Computer Science & Engineering</div>
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">Jul 2024 - Present</div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Skills */}
          <section className="mb-12">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2"><Code2 className="w-6 h-6 text-blue-600" />Skills</h3>
            <div className="flex flex-wrap gap-3">
              <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full">JavaScript</span>
              <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full">TypeScript</span>
              <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full">React</span>
              <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full">Next.js</span>
              <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full">Node.js</span>
              <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full">Express.js</span>
              <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full">MongoDB</span>
              <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full">HTML</span>
              <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full">CSS</span>
              <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full">Bootstrap</span>
              <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full">Tailwind CSS</span>
              <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full">Python</span>
              <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full">Docker</span>
              <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full">Kubernetes</span>
              <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full">Django</span>
            </div>
          </section>

          {/* Projects Section - only if projects exist */}
          {projects.length > 0 && (
            <section className="mb-12">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2"><Layers className="w-6 h-6 text-fuchsia-600" />Projects</h3>
              {/* Render projects here */}
            </section>
          )}

          {/* Contact Section */}
          <section className="mb-12">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2"><BookOpen className="w-6 h-6 text-green-600" />Get in Touch</h3>
            <div className="flex flex-col gap-3 text-gray-700 dark:text-gray-300">
              <div className="flex items-center gap-2"><Mail className="w-5 h-5 text-blue-600" />avishekdevnath@gmail.com</div>
              <div className="flex items-center gap-2"><Phone className="w-5 h-5 text-fuchsia-600" />+8801874819713</div>
              <div className="flex items-center gap-2"><MapPin className="w-5 h-5 text-green-600" />Dhaka, Bangladesh</div>
            </div>
            <div className="mt-6 flex flex-wrap gap-4">
              <a href="mailto:avishekdevnath@gmail.com" className="inline-flex items-center gap-2 bg-blue-600 text-white px-5 py-2 rounded-lg font-semibold shadow hover:bg-blue-700 transition"><Mail className="w-5 h-5" />Email Me</a>
              <a href="https://www.linkedin.com/in/avishekdevnath" target="_blank" rel="noopener" className="inline-flex items-center gap-2 bg-blue-500 text-white px-5 py-2 rounded-lg font-semibold shadow hover:bg-blue-600 transition"><Linkedin className="w-5 h-5" />LinkedIn</a>
              <a href="https://avishekdevnath.com" target="_blank" rel="noopener" className="inline-flex items-center gap-2 bg-fuchsia-600 text-white px-5 py-2 rounded-lg font-semibold shadow hover:bg-fuchsia-700 transition"><Globe className="w-5 h-5" />Portfolio</a>
            </div>
          </section>
        </div>
      </main>
      <NewFooter />
    </div>
  );
} 