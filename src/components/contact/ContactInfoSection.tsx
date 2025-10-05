'use client';
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, Globe, MessageSquare } from 'lucide-react';
import { fadeInUp } from '@/components/landing/animations';

interface ContactInfo {
  email?: string;
  phone?: string;
  address?: string;
  portfolioUrl?: string;
  liveChatUrl?: string;
  contactMethods?: Array<{
    title: string;
    description: string;
    value: string;
    href: string;
    icon: string;
    isActive: boolean;
    order?: number;
  }>;
}

export default function ContactInfoSection() {
  const [settings, setSettings] = useState<ContactInfo | null>(null);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch('/api/contact/settings', { cache: 'no-store' });
        if (res.ok) {
          const data = await res.json();
          setSettings(data?.data || null);
        }
      } catch (error) {
        console.error('Failed to fetch contact settings:', error);
      }
    };

    fetchSettings();
  }, []);

  const getContactInfo = () => {
    if (settings?.contactMethods && settings.contactMethods.length > 0) {
      return settings.contactMethods
        .filter(method => method.isActive)
        .sort((a, b) => (a.order || 0) - (b.order || 0))
        .map(method => {
          let icon;
          switch (method.icon) {
            case 'Mail': icon = <Mail className="w-6 h-6" />; break;
            case 'Phone': icon = <Phone className="w-6 h-6" />; break;
            case 'MapPin': icon = <MapPin className="w-6 h-6" />; break;
            case 'Globe': icon = <Globe className="w-6 h-6" />; break;
            case 'MessageCircle': icon = <MessageSquare className="w-6 h-6" />; break;
            default: icon = <Mail className="w-6 h-6" />; break;
          }
          return {
            icon,
            title: method.title,
            description: method.description,
            value: method.value,
            href: method.href
          };
        });
    }

    // Fallback to default contact info using settings data
    const contactInfo = [];
    
    if (settings?.email) {
      contactInfo.push({
        icon: <Mail className="w-6 h-6" />,
        title: "Email Us",
        description: "Get in touch via email",
        value: settings.email,
        href: `mailto:${settings.email}`
      });
    }
    
    if (settings?.phone) {
      contactInfo.push({
        icon: <Phone className="w-6 h-6" />,
        title: "Call Us",
        description: "Speak with our team",
        value: settings.phone,
        href: `tel:${settings.phone}`
      });
    }
    
    if (settings?.address) {
      contactInfo.push({
        icon: <MapPin className="w-6 h-6" />,
        title: "Visit Us",
        description: "Our office location",
        value: settings.address,
        href: "#"
      });
    }
    
    if (settings?.portfolioUrl) {
      contactInfo.push({
        icon: <Globe className="w-6 h-6" />,
        title: "Portfolio",
        description: "View our work and projects",
        value: "Visit Portfolio",
        href: settings.portfolioUrl
      });
    }

    // If no settings data, use hardcoded defaults
    if (contactInfo.length === 0) {
      return [
        {
          icon: <Mail className="w-6 h-6" />,
          title: "Email Us",
          description: "Get in touch via email",
          value: "avishekdevnath@gmail.com",
          href: "mailto:avishekdevnath@gmail.com"
        },
        {
          icon: <Phone className="w-6 h-6" />,
          title: "Call Us",
          description: "Speak with our team",
          value: "+8801874819713",
          href: "tel:+8801874819713"
        },
        {
          icon: <MapPin className="w-6 h-6" />,
          title: "Visit Us",
          description: "Our office location",
          value: "Dhaka, Bangladesh",
          href: "#"
        },
        {
          icon: <Globe className="w-6 h-6" />,
          title: "Portfolio",
          description: "View our work and projects",
          value: "Visit Portfolio",
          href: "https://avishekdevnath.com"
        }
      ];
    }

    return contactInfo;
  };

  return (
    <section className="py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <motion.div 
          initial="initial" 
          whileInView="animate" 
          viewport={{ once: true }}
          variants={fadeInUp}
        >
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8 text-center">
            Contact Information
          </h2>
        </motion.div>

        <motion.div 
          initial="initial" 
          whileInView="animate" 
          viewport={{ once: true }}
          variants={fadeInUp}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {getContactInfo().map((info, index) => (
            <motion.a
              key={index}
              href={info.href}
              whileHover={{ y: -8, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 p-6 border border-gray-200/50 dark:border-gray-700/50 hover:border-blue-300 dark:hover:border-blue-500 text-center"
            >
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 text-white">
                {info.icon}
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                {info.title}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                {info.description}
              </p>
              <p className="text-blue-600 dark:text-blue-400 font-medium text-sm">
                {info.value}
              </p>
            </motion.a>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
