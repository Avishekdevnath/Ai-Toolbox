'use client';
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, BookOpen, Globe, X, CheckCircle } from 'lucide-react';
import { fadeInUp } from '@/components/landing/animations';
import ContactForm from '@/components/forms/ContactForm';

interface AboutContactProps {
  className?: string;
}

interface AboutInfo {
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

export default function AboutContact({ className = '' }: AboutContactProps) {
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
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            Get in Touch
          </h3>
        </motion.div>

        <motion.div 
          initial="initial" 
          whileInView="animate" 
          viewport={{ once: true }}
          variants={fadeInUp}
          transition={{ delay: 0.2 }}
          className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-lg p-4 sm:p-6 lg:p-8 border border-gray-200/50 dark:border-gray-700/50"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            {aboutInfo.email && (
              <motion.div 
                whileHover={{ scale: 1.05 }}
                className="flex items-start gap-3 p-4 rounded-xl bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20"
              >
                <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center flex-shrink-0">
                  <Mail className="w-6 h-6 text-white" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-gray-500 dark:text-gray-400">Email</p>
                  <p className="text-gray-900 dark:text-white font-medium break-all text-sm">{aboutInfo.email}</p>
                </div>
              </motion.div>
            )}

            {aboutInfo.phone && (
              <motion.div 
                whileHover={{ scale: 1.05 }}
                className="flex items-start gap-3 p-4 rounded-xl bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20"
              >
                <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                  <Phone className="w-6 h-6 text-white" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-gray-500 dark:text-gray-400">Phone</p>
                  <p className="text-gray-900 dark:text-white font-medium break-all text-sm">{aboutInfo.phone}</p>
                </div>
              </motion.div>
            )}

            {aboutInfo.location && (
              <motion.div 
                whileHover={{ scale: 1.05 }}
                className="flex items-start gap-3 p-4 rounded-xl bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20"
              >
                <div className="w-12 h-12 rounded-full bg-gradient-to-r from-green-500 to-green-600 flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-6 h-6 text-white" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-gray-500 dark:text-gray-400">Location</p>
                  <p className="text-gray-900 dark:text-white font-medium break-words text-sm">{aboutInfo.location}</p>
                </div>
              </motion.div>
            )}
          </div>

          <motion.div 
            initial="initial" 
            whileInView="animate" 
            viewport={{ once: true }}
            variants={fadeInUp}
            transition={{ delay: 0.4 }}
            className="text-center"
          >
            <p className="text-lg text-gray-600 dark:text-gray-300 mb-6">
              Ready to collaborate or have a project in mind? Let's connect!
            </p>
            <div className="flex flex-col sm:flex-row flex-wrap justify-center gap-3">
              {aboutInfo.email && (
                <motion.button 
                  onClick={() => setShowContactModal(true)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-2xl font-semibold shadow-xl hover:shadow-2xl transition-all duration-300 text-sm sm:text-base min-w-0 flex-1 sm:flex-none"
                >
                  <Mail className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                  <span className="truncate">Send Email</span>
                </motion.button>
              )}
              {aboutInfo.socialLinks?.linkedin && (
                <motion.a 
                  href={aboutInfo.socialLinks.linkedin}
                  target="_blank"
                  rel="noopener"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-3 rounded-2xl font-semibold shadow-xl hover:shadow-2xl transition-all duration-300 text-sm sm:text-base min-w-0 flex-1 sm:flex-none"
                >
                  <span className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0 text-xs sm:text-sm font-bold">in</span>
                  <span className="truncate">LinkedIn</span>
                </motion.a>
              )}
              {aboutInfo.portfolioUrl && (
                <motion.a 
                  href={aboutInfo.portfolioUrl}
                  target="_blank"
                  rel="noopener"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-2xl font-semibold shadow-xl hover:shadow-2xl transition-all duration-300 text-sm sm:text-base min-w-0 flex-1 sm:flex-none"
                >
                  <Globe className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                  <span className="truncate">Portfolio</span>
                </motion.a>
              )}
            </div>
          </motion.div>
        </motion.div>
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
