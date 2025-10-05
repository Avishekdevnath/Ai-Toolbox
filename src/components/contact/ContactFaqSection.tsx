'use client';
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { HelpCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { fadeInUp } from '@/components/landing/animations';

interface FAQ {
  question: string;
  answer: string;
}

export default function ContactFaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const faqs: FAQ[] = [
    {
      question: "How do I use the AI features?",
      answer: "Most tools have AI features enabled by default. Simply enter your data and the AI will provide personalized insights and recommendations."
    },
    {
      question: "Is my data secure?",
      answer: "Yes, we prioritize your privacy. We don't store personal information and all calculations happen locally when possible."
    },
    {
      question: "Are these tools really free?",
      answer: "Yes, all our tools are completely free to use. We believe in making AI technology accessible to everyone."
    },
    {
      question: "Can I suggest new tools?",
      answer: "Absolutely! We love hearing from our community. Send us your suggestions and we'll consider adding them to our collection."
    },
    {
      question: "How quickly do you respond to messages?",
      answer: "We typically respond to all inquiries within 24 hours. For urgent matters, please mention it in your message."
    },
    {
      question: "Do you offer technical support?",
      answer: "Yes! Our team provides comprehensive technical support for all our tools and features. Don't hesitate to reach out if you need help."
    }
  ];

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

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
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-green-500 to-emerald-600 flex items-center justify-center">
              <HelpCircle className="w-5 h-5 text-white" />
            </div>
            Frequently Asked Questions
          </h2>
        </motion.div>

        <motion.div 
          initial="initial" 
          whileInView="animate" 
          viewport={{ once: true }}
          variants={fadeInUp}
          transition={{ delay: 0.2 }}
          className="space-y-4"
        >
          {faqs.map((faq, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 dark:border-gray-700/50 overflow-hidden"
            >
              <button
                onClick={() => toggleFAQ(index)}
                className="w-full p-6 text-left flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
              >
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white pr-4">
                  {faq.question}
                </h3>
                <div className="flex-shrink-0">
                  {openIndex === index ? (
                    <ChevronUp className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                  )}
                </div>
              </button>
              
              {openIndex === index && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="px-6 pb-6"
                >
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                    {faq.answer}
                  </p>
                </motion.div>
              )}
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
