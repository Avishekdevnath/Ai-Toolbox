import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, Eye, Lock, Users, Database, Globe } from 'lucide-react';
import Navbar from "@/components/Navbar";
import NewFooter from "@/components/NewFooter";

export default function PrivacyPage() {
  const lastUpdated = "December 2024";

  const sections = [
    {
      icon: <Eye className="w-6 h-6" />,
      title: "Information We Collect",
      content: [
        "We collect minimal information necessary to provide our services. This includes:",
        "• Usage data to improve our tools and user experience",
        "• Technical information like browser type and device information",
        "• Information you voluntarily provide through our contact forms",
        "• Cookies and similar technologies for functionality and analytics"
      ]
    },
    {
      icon: <Database className="w-6 h-6" />,
      title: "How We Use Your Information",
      content: [
        "We use the collected information for:",
        "• Providing and improving our AI-powered tools",
        "• Personalizing your experience and recommendations",
        "• Analyzing usage patterns to enhance functionality",
        "• Responding to your inquiries and support requests",
        "• Ensuring security and preventing fraud"
      ]
    },
    {
      icon: <Lock className="w-6 h-6" />,
      title: "Data Security",
      content: [
        "We implement industry-standard security measures:",
        "• Encryption of data in transit and at rest",
        "• Regular security audits and updates",
        "• Access controls and authentication",
        "• Secure hosting infrastructure",
        "• Regular backups and disaster recovery"
      ]
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: "Data Sharing",
      content: [
        "We do not sell, trade, or rent your personal information. We may share data only:",
        "• With your explicit consent",
        "• To comply with legal obligations",
        "• With trusted service providers who assist in our operations",
        "• In aggregated, anonymized form for analytics"
      ]
    },
    {
      icon: <Globe className="w-6 h-6" />,
      title: "Third-Party Services",
      content: [
        "We use trusted third-party services:",
        "• Google Analytics for website analytics",
        "• Google Gemini AI for AI-powered features",
        "• Vercel for hosting and deployment",
        "• MongoDB for data storage (when applicable)",
        "All third-party services have their own privacy policies."
      ]
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: "Your Rights",
      content: [
        "You have the right to:",
        "• Access your personal information",
        "• Request correction of inaccurate data",
        "• Request deletion of your data",
        "• Opt-out of marketing communications",
        "• Lodge a complaint with supervisory authorities"
      ]
    }
  ];

  const cookieTypes = [
    {
      name: "Essential Cookies",
      description: "Required for basic website functionality",
      examples: "Authentication, security, session management"
    },
    {
      name: "Analytics Cookies",
      description: "Help us understand how visitors use our site",
      examples: "Google Analytics, usage statistics"
    },
    {
      name: "Functional Cookies",
      description: "Remember your preferences and settings",
      examples: "Language preferences, tool settings"
    }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <Navbar />
      
      {/* Hero Section */}
      <div className="bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <div className="w-20 h-20 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-6">
              <Shield className="w-10 h-10 text-blue-600 dark:text-blue-400" />
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
              Privacy <span className="text-blue-600 dark:text-blue-400">Policy</span>
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto mb-4">
              We respect your privacy and are committed to protecting your personal information. 
              This policy explains how we collect, use, and safeguard your data.
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Last updated: {lastUpdated}
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 flex-grow">
        <div className="space-y-12">
          {/* Introduction */}
          <Card className="border-0 shadow-lg dark:bg-gray-800 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="dark:text-white">Our Commitment to Privacy</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-600 dark:text-gray-300">
                At AI Toolbox, we believe that privacy is a fundamental human right. We are committed to 
                transparency about how we handle your information and to giving you control over your data.
              </p>
              <p className="text-gray-600 dark:text-gray-300">
                This Privacy Policy explains our practices regarding the collection, use, and protection of 
                your information when you use our AI-powered tools and services.
              </p>
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                <p className="text-blue-800 dark:text-blue-200 font-medium">
                  💡 <strong>Key Principle:</strong> We collect only what we need, use it responsibly, 
                  and protect it with industry-standard security measures.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Privacy Sections */}
          <div className="space-y-8">
            {sections.map((section, index) => (
              <Card key={index} className="border-0 shadow-lg dark:bg-gray-800 dark:border-gray-700">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 dark:text-white">
                    <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center text-blue-600 dark:text-blue-400">
                      {section.icon}
                    </div>
                    {section.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {section.content.map((item, itemIndex) => (
                      <li key={itemIndex} className="text-gray-600 dark:text-gray-300">
                        {item}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Cookies Section */}
          <Card className="border-0 shadow-lg dark:bg-gray-800 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="dark:text-white">Cookie Policy</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                We use cookies and similar technologies to enhance your experience on our website. 
                Cookies are small text files stored on your device that help us provide and improve our services.
              </p>
              <div className="space-y-4">
                {cookieTypes.map((cookie, index) => (
                  <div key={index} className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2">{cookie.name}</h4>
                    <p className="text-gray-600 dark:text-gray-300 mb-2">{cookie.description}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      <strong>Examples:</strong> {cookie.examples}
                    </p>
                  </div>
                ))}
              </div>
              <div className="mt-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                <p className="text-yellow-800 dark:text-yellow-200">
                  <strong>Cookie Management:</strong> You can control cookies through your browser settings. 
                  However, disabling certain cookies may affect the functionality of our tools.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Children's Privacy */}
          <Card className="border-0 shadow-lg dark:bg-gray-800 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="dark:text-white">Children's Privacy</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 dark:text-gray-300">
                Our services are not intended for children under 13 years of age. We do not knowingly 
                collect personal information from children under 13. If you are a parent or guardian and 
                believe your child has provided us with personal information, please contact us immediately.
              </p>
            </CardContent>
          </Card>

          {/* International Users */}
          <Card className="border-0 shadow-lg dark:bg-gray-800 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="dark:text-white">International Users</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Our services are hosted in the United States. If you are accessing our services from 
                outside the United States, please be aware that your information may be transferred to, 
                stored, and processed in the United States where our servers are located.
              </p>
              <p className="text-gray-600 dark:text-gray-300">
                We comply with applicable data protection laws and will ensure that your information 
                receives an adequate level of protection.
              </p>
            </CardContent>
          </Card>

          {/* Changes to Policy */}
          <Card className="border-0 shadow-lg dark:bg-gray-800 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="dark:text-white">Changes to This Policy</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                We may update this Privacy Policy from time to time to reflect changes in our practices 
                or for other operational, legal, or regulatory reasons.
              </p>
              <p className="text-gray-600 dark:text-gray-300">
                We will notify you of any material changes by posting the new Privacy Policy on this page 
                and updating the "Last updated" date. We encourage you to review this policy periodically.
              </p>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card className="border-0 shadow-lg bg-blue-50 dark:bg-blue-900/20">
            <CardHeader>
              <CardTitle className="dark:text-white">Contact Us</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                If you have any questions about this Privacy Policy or our data practices, please contact us:
              </p>
              <div className="space-y-2">
                <p className="text-gray-600 dark:text-gray-300">
                  <strong>Email:</strong> privacy@aitoolbox.com
                </p>
                <p className="text-gray-600 dark:text-gray-300">
                  <strong>Address:</strong> AI Toolbox Team, San Francisco, CA
                </p>
                <p className="text-gray-600 dark:text-gray-300">
                  <strong>Response Time:</strong> We aim to respond to privacy inquiries within 48 hours.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <NewFooter />
    </div>
  );
} 