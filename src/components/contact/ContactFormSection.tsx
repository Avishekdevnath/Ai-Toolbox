'use client';
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, CheckCircle } from 'lucide-react';
import { fadeInUp } from '@/components/landing/animations';
import ContactForm from '@/components/forms/ContactForm';

export default function ContactFormSection() {
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  return (
    <section className="py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <motion.div 
          initial="initial" 
          whileInView="animate" 
          viewport={{ once: true }}
          variants={fadeInUp}
        >
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
              <MessageSquare className="w-5 h-5 text-white" />
            </div>
            Send us a Message
          </h2>
        </motion.div>

        <motion.div 
          initial="initial" 
          whileInView="animate" 
          viewport={{ once: true }}
          variants={fadeInUp}
          transition={{ delay: 0.2 }}
          className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-lg p-8 border border-gray-200/50 dark:border-gray-700/50"
        >
          <ContactForm 
            showTitle={false}
            description="Have a question or need support? We'd love to hear from you."
            onSubmit={async (data) => {
              try {
                const res = await fetch('/api/contact/messages', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify(data)
                });
                
                if (res.ok) {
                  setShowSuccessModal(true);
                  setTimeout(() => {
                    setShowSuccessModal(false);
                  }, 3000);
                }
              } catch (error) {
                console.error('Failed to send message:', error);
              }
            }}
          />
        </motion.div>

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
                Thank you for reaching out! We've received your message and will get back to you as soon as possible.
              </p>
              
              <motion.button
                onClick={() => setShowSuccessModal(false)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
              >
                Close
              </motion.button>
            </motion.div>
          </div>
        )}
      </div>
    </section>
  );
}
