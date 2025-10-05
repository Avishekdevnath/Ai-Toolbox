'use client';
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Linkedin, Globe, MapPin, Phone, Download, X, CheckCircle } from 'lucide-react';
import { fadeInUp, scaleIn } from '@/components/landing/animations';
import ContactForm from '@/components/forms/ContactForm';

interface AboutHeroProps {
  className?: string;
}

interface AboutInfo {
  name?: string;
  title?: string;
  description?: string;
  avatar?: string;
  email?: string;
  phone?: string;
  location?: string;
  portfolioUrl?: string;
  socialLinks?: {
    linkedin?: string;
    github?: string;
    twitter?: string;
    instagram?: string;
    website?: string;
  };
}

export default function AboutHero({ className = '' }: AboutHeroProps) {
  const [aboutInfo, setAboutInfo] = useState<AboutInfo>({});
  const [showContactModal, setShowContactModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

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

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <section className={`py-20 px-4 ${className}`}>
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Side - Avatar and Basic Info */}
          <motion.div 
            initial="initial" 
            animate="animate" 
            variants={scaleIn}
            className="text-center lg:text-left"
          >
            <div className="relative inline-block mb-8">
              <div className="w-48 h-48 rounded-full bg-gradient-to-r from-blue-500 via-purple-600 to-pink-600 flex items-center justify-center mx-auto lg:mx-0 text-6xl font-bold text-white shadow-2xl relative overflow-hidden">
                {aboutInfo.avatar ? (
                  <img 
                    src={aboutInfo.avatar} 
                    alt={aboutInfo.name || 'Avatar'} 
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  getInitials(aboutInfo.name || 'AD')
                )}
              </div>
              {/* Floating elements */}
              <div className="absolute -top-4 -right-4 w-8 h-8 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full animate-pulse"></div>
              <div className="absolute -bottom-2 -left-2 w-6 h-6 bg-gradient-to-r from-green-400 to-blue-500 rounded-full animate-bounce"></div>
            </div>

            <motion.div 
              initial="initial" 
              animate="animate" 
              variants={fadeInUp}
              transition={{ delay: 0.2 }}
            >
              <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
                {aboutInfo.name || 'Avishek Devnath'}
              </h1>
              <h2 className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 font-semibold mb-6">
                {aboutInfo.title || 'Full-Stack Developer (MERN)'}
              </h2>
            </motion.div>

            {/* Contact Info Cards */}
            <motion.div 
              initial="initial" 
              animate="animate" 
              variants={fadeInUp}
              transition={{ delay: 0.4 }}
              className="space-y-3 mb-8"
            >
              {aboutInfo.email && (
                <div className="flex items-center gap-3 justify-center lg:justify-start">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center">
                    <Mail className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-gray-700 dark:text-gray-300 font-medium">{aboutInfo.email}</span>
                </div>
              )}
              {aboutInfo.phone && (
                <div className="flex items-center gap-3 justify-center lg:justify-start">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-green-500 to-green-600 flex items-center justify-center">
                    <Phone className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-gray-700 dark:text-gray-300 font-medium">{aboutInfo.phone}</span>
                </div>
              )}
              {aboutInfo.location && (
                <div className="flex items-center gap-3 justify-center lg:justify-start">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-purple-600 flex items-center justify-center">
                    <MapPin className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-gray-700 dark:text-gray-300 font-medium">{aboutInfo.location}</span>
                </div>
              )}
            </motion.div>
          </motion.div>

          {/* Right Side - Description and Action Buttons */}
          <motion.div 
            initial="initial" 
            animate="animate" 
            variants={fadeInUp}
            transition={{ delay: 0.3 }}
            className="space-y-8"
          >
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-3xl shadow-xl p-8 border border-gray-200/50 dark:border-gray-700/50">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                Quick Connect
              </h3>
              <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
                Ready to collaborate or have a project in mind? Let's connect and discuss how we can work together to build something amazing.
              </p>
              
              {/* Action Buttons */}
              <div className="flex gap-4 justify-center sm:justify-start">
                {aboutInfo.email && (
                  <motion.button 
                    onClick={() => setShowContactModal(true)}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300"
                    title="Send Message"
                  >
                    <Mail className="w-6 h-6" />
                  </motion.button>
                )}
                {aboutInfo.socialLinks?.linkedin && (
                  <motion.a 
                    href={aboutInfo.socialLinks.linkedin}
                    target="_blank"
                    rel="noopener"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300"
                    title="LinkedIn"
                  >
                    <Linkedin className="w-6 h-6" />
                  </motion.a>
                )}
                {aboutInfo.portfolioUrl && (
                  <motion.a 
                    href={aboutInfo.portfolioUrl}
                    target="_blank"
                    rel="noopener"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300"
                    title="Portfolio"
                  >
                    <Globe className="w-6 h-6" />
                  </motion.a>
                )}
              </div>
            </div>

            {/* Quick Stats */}
            <motion.div 
              initial="initial" 
              animate="animate" 
              variants={fadeInUp}
              transition={{ delay: 0.5 }}
              className="grid grid-cols-2 gap-4"
            >
              <div className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-2xl p-6 text-center">
                <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">3+</div>
                <div className="text-sm text-gray-600 dark:text-gray-300">Years Experience</div>
              </div>
              <div className="bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-2xl p-6 text-center">
                <div className="text-3xl font-bold text-purple-600 dark:text-purple-400 mb-2">50+</div>
                <div className="text-sm text-gray-600 dark:text-gray-300">Projects Completed</div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Contact Modal */}
      {showContactModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Send a Message
              </h2>
              <button
                onClick={() => setShowContactModal(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
              >
                <X className="w-6 h-6 text-gray-500 dark:text-gray-400" />
              </button>
            </div>
            <div className="p-6">
              <ContactForm 
                showTitle={false}
                description="Have a question or want to collaborate? I'd love to hear from you!"
                onSubmit={async (data) => {
                  // Handle form submission
                  try {
                    const res = await fetch('/api/contact/messages', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify(data)
                    });
                    
                    if (res.ok) {
                      setShowContactModal(false);
                      setShowSuccessModal(true);
                      // Auto-hide success modal after 3 seconds
                      setTimeout(() => {
                        setShowSuccessModal(false);
                      }, 3000);
                    }
                  } catch (error) {
                    console.error('Failed to send message:', error);
                  }
                }}
              />
            </div>
          </motion.div>
        </div>
      )}

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl max-w-md w-full p-8 text-center"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="w-20 h-20 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6"
            >
              <CheckCircle className="w-10 h-10 text-white" />
            </motion.div>
            
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Message Sent Successfully!
            </h3>
            
            <p className="text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
              Thank you for reaching out! I've received your message and will get back to you as soon as possible.
            </p>
            
            <div className="flex gap-3 justify-center">
              <motion.button
                onClick={() => setShowSuccessModal(false)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
              >
                Close
              </motion.button>
              {aboutInfo.socialLinks?.linkedin && (
                <motion.a
                  href={aboutInfo.socialLinks.linkedin}
                  target="_blank"
                  rel="noopener"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  Connect on LinkedIn
                </motion.a>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </section>
  );
}
