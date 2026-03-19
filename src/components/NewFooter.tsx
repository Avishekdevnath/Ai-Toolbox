'use client';

import Link from 'next/link';

const footerSections = [
  {
    title: 'Product',
    links: [
      { label: 'AI Tools', href: '/ai-tools' },
      { label: 'Utilities', href: '/utilities' },
      { label: 'Finance', href: '/tools/finance-advisor' },
      { label: 'Career', href: '/tools/resume-reviewer' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'About', href: '/about' },
      { label: 'Contact', href: '/contact' },
      { label: 'API Docs', href: '/api-docs' },
    ],
  },
  {
    title: 'Legal',
    links: [
      { label: 'Privacy', href: '/privacy' },
      { label: 'Terms', href: '/terms' },
    ],
  },
];

export default function NewFooter() {
  return (
    <footer
      className="border-t border-[var(--color-border)]"
      style={{ backgroundColor: 'var(--color-surface)' }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div className="flex flex-col">
            <div className="flex items-center space-x-3 mb-3">
              <div
                className="w-6 h-6 rounded flex items-center justify-center"
                style={{ backgroundColor: 'var(--color-primary)' }}
              >
                <span className="text-white font-bold text-xs">AI</span>
              </div>
              <span
                className="text-lg font-bold"
                style={{ color: 'var(--color-text-primary)' }}
              >
                AI Toolbox
              </span>
            </div>
            <p
              className="text-sm mb-4 leading-relaxed"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              Your comprehensive collection of AI-powered tools for everyday tasks.
            </p>

            {/* Connect / Social */}
            <div>
              <p
                className="text-xs font-semibold uppercase tracking-wider mb-2"
                style={{ color: 'var(--color-text-secondary)' }}
              >
                Connect
              </p>
              <div className="flex space-x-3">
                <a
                  href="https://github.com/Avishekdevnath/Ai-Toolbox"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="transition-colors"
                  style={{ color: 'var(--color-text-secondary)' }}
                  aria-label="GitHub"
                >
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path
                      fillRule="evenodd"
                      d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                      clipRule="evenodd"
                    />
                  </svg>
                </a>
              </div>
            </div>
          </div>

          {/* Footer link sections */}
          {footerSections.map((section) => (
            <div key={section.title}>
              <h3
                className="text-xs font-semibold uppercase tracking-wider mb-3"
                style={{ color: 'var(--color-text-primary)' }}
              >
                {section.title}
              </h3>
              <ul className="space-y-2">
                {section.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm transition-colors"
                      style={{ color: 'var(--color-text-secondary)' }}
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Bar */}
        <div
          className="pt-6 border-t flex flex-col md:flex-row justify-between items-center gap-4"
          style={{ borderColor: 'var(--color-border)' }}
        >
          <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
            &copy; 2025-2026 AI Toolbox. All rights reserved.
          </p>
          <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
            Powered by Next.js &amp; AI
          </p>
        </div>
      </div>
    </footer>
  );
}
