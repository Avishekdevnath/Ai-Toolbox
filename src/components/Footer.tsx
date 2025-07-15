'use client';

import React from 'react';
import { Github, Twitter, Linkedin, Mail, Heart } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const tools = [
    { name: 'Age Calculator', href: '/tools/age-calculator' },
    { name: 'URL Shortener', href: '/tools/url-shortener' },
    { name: 'Price Tracker', href: '/tools/price-tracker' },
    { name: 'Diet Planner', href: '/tools/diet-planner' },
    { name: 'Quote Generator', href: '/tools/quote-generator' },
    { name: 'Unit Converter', href: '/tools/unit-converter' },
    { name: 'Finance Tools', href: '/tools/finance' },
    { name: 'SWOT Analysis', href: '/tools/swot-analysis' },
    { name: 'QR Generator', href: '/tools/qr-generator' },
    { name: 'Password Generator', href: '/tools/password-generator' },
    { name: 'Word Counter', href: '/tools/word-counter' },
    { name: 'Tip Calculator', href: '/tools/tip-calculator' },
  ];

  const categories = [
    { name: 'Financial Tools', tools: ['Finance Tools', 'Tip Calculator', 'Price Tracker'] },
    { name: 'Utility Tools', tools: ['URL Shortener', 'QR Generator', 'Password Generator', 'Word Counter'] },
    { name: 'Health & Lifestyle', tools: ['Age Calculator', 'Diet Planner'] },
    { name: 'Business Tools', tools: ['SWOT Analysis', 'Quote Generator', 'Unit Converter'] },
  ];

  const quickLinks = [
    { name: 'About', href: '/about' },
    { name: 'Privacy Policy', href: '/privacy' },
    { name: 'Terms of Service', href: '/terms' },
    { name: 'Contact', href: '/contact' },
    { name: 'API Documentation', href: '/api-docs' },
  ];

  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="space-y-4">
            <div>
              <h3 className="text-xl font-bold text-white">AI Toolbox</h3>
              <p className="text-gray-400 mt-2">
                Your comprehensive collection of AI-powered tools for everyday tasks.
              </p>
            </div>
            <div className="flex space-x-4">
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition-colors"
              >
                <Github className="w-5 h-5" />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition-colors"
              >
                <Twitter className="w-5 h-5" />
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition-colors"
              >
                <Linkedin className="w-5 h-5" />
              </a>
              <a
                href="mailto:contact@aitoolbox.com"
                className="text-gray-400 hover:text-white transition-colors"
              >
                <Mail className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Tools by Category */}
          <div>
            <h4 className="text-lg font-semibold text-white mb-4">Tools by Category</h4>
            <div className="space-y-3">
              {categories.map((category) => (
                <div key={category.name}>
                  <h5 className="text-sm font-medium text-gray-300 mb-2">{category.name}</h5>
                  <ul className="space-y-1">
                    {category.tools.map((toolName) => {
                      const tool = tools.find(t => t.name === toolName);
                      return tool ? (
                        <li key={tool.name}>
                          <a
                            href={tool.href}
                            className="text-sm text-gray-400 hover:text-white transition-colors"
                          >
                            {tool.name}
                          </a>
                        </li>
                      ) : null;
                    })}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          {/* All Tools */}
          <div>
            <h4 className="text-lg font-semibold text-white mb-4">All Tools</h4>
            <div className="grid grid-cols-1 gap-1">
              {tools.slice(0, 6).map((tool) => (
                <a
                  key={tool.name}
                  href={tool.href}
                  className="text-sm text-gray-400 hover:text-white transition-colors"
                >
                  {tool.name}
                </a>
              ))}
            </div>
            {tools.length > 6 && (
              <details className="mt-2">
                <summary className="text-sm text-gray-400 hover:text-white transition-colors cursor-pointer">
                  Show more...
                </summary>
                <div className="mt-2 space-y-1">
                  {tools.slice(6).map((tool) => (
                    <a
                      key={tool.name}
                      href={tool.href}
                      className="block text-sm text-gray-400 hover:text-white transition-colors"
                    >
                      {tool.name}
                    </a>
                  ))}
                </div>
              </details>
            )}
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold text-white mb-4">Quick Links</h4>
            <ul className="space-y-2">
              {quickLinks.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className="text-sm text-gray-400 hover:text-white transition-colors"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-gray-800 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="flex items-center space-x-2 text-gray-400">
              <span>© {currentYear} AI Toolbox. Made with</span>
              <Heart className="w-4 h-4 text-red-500" />
              <span>for the community.</span>
            </div>
            <div className="flex items-center space-x-6 text-sm text-gray-400">
              <span>Powered by Next.js & AI</span>
              <span>•</span>
              <span>Version 1.0.0</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
} 