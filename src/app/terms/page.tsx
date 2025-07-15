import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Shield, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';

export default function TermsPage() {
  const lastUpdated = "December 2024";

  const sections = [
    {
      icon: <CheckCircle className="w-6 h-6" />,
      title: "Acceptance of Terms",
      content: [
        "By accessing and using AI Toolbox, you accept and agree to be bound by the terms and provision of this agreement.",
        "If you do not agree to abide by the above, please do not use this service.",
        "We reserve the right to modify these terms at any time, and such modifications shall be effective immediately upon posting."
      ]
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: "Use License",
      content: [
        "Permission is granted to temporarily use AI Toolbox for personal, non-commercial transitory viewing only.",
        "This is the grant of a license, not a transfer of title, and under this license you may not:",
        "• Modify or copy the materials",
        "• Use the materials for any commercial purpose or for any public display",
        "• Attempt to reverse engineer any software contained on AI Toolbox",
        "• Remove any copyright or other proprietary notations from the materials"
      ]
    },
    {
      icon: <AlertTriangle className="w-6 h-6" />,
      title: "Disclaimer",
      content: [
        "The materials on AI Toolbox are provided on an 'as is' basis. AI Toolbox makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.",
        "Further, AI Toolbox does not warrant or make any representations concerning the accuracy, likely results, or reliability of the use of the materials on its website or otherwise relating to such materials or on any sites linked to this site."
      ]
    },
    {
      icon: <XCircle className="w-6 h-6" />,
      title: "Limitations",
      content: [
        "In no event shall AI Toolbox or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on AI Toolbox, even if AI Toolbox or an AI Toolbox authorized representative has been notified orally or in writing of the possibility of such damage.",
        "Because some jurisdictions do not allow limitations on implied warranties, or limitations of liability for consequential or incidental damages, these limitations may not apply to you."
      ]
    }
  ];

  const userObligations = [
    "Provide accurate and truthful information when using our tools",
    "Use the services in compliance with applicable laws and regulations",
    "Not attempt to gain unauthorized access to our systems",
    "Not use our services for any illegal or harmful purposes",
    "Respect intellectual property rights",
    "Not interfere with the proper functioning of our services"
  ];

  const prohibitedUses = [
    "Using our tools for illegal activities",
    "Attempting to hack or compromise our systems",
    "Spreading malware or harmful code",
    "Harassing or abusing other users",
    "Violating any applicable laws or regulations",
    "Using automated tools to access our services excessively"
  ];

  const intellectualProperty = [
    "All content on AI Toolbox is owned by us or our licensors",
    "Our trademarks, service marks, and logos are our property",
    "You retain ownership of any content you create using our tools",
    "We may use anonymized usage data to improve our services",
    "You grant us a license to use feedback you provide"
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Hero Section */}
      <div className="bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <FileText className="w-10 h-10 text-blue-600" />
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Terms of <span className="text-blue-600">Service</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-4">
              Please read these terms carefully before using our services. 
              By using AI Toolbox, you agree to be bound by these terms.
            </p>
            <p className="text-sm text-gray-500">
              Last updated: {lastUpdated}
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="space-y-12">
          {/* Introduction */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle>Agreement to Terms</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-600">
                These Terms of Service ("Terms") govern your use of AI Toolbox ("Service") operated by AI Toolbox Team.
              </p>
              <p className="text-gray-600">
                By accessing or using our Service, you agree to be bound by these Terms. If you disagree with any part of these terms, then you may not access the Service.
              </p>
              <div className="bg-yellow-50 p-4 rounded-lg">
                <p className="text-yellow-800 font-medium">
                  ⚠️ <strong>Important:</strong> These terms constitute a legally binding agreement between you and AI Toolbox. 
                  Please read them carefully.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Main Sections */}
          <div className="space-y-8">
            {sections.map((section, index) => (
              <Card key={index} className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600">
                      {section.icon}
                    </div>
                    {section.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {section.content.map((item, itemIndex) => (
                      <li key={itemIndex} className="text-gray-600">
                        {item}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* User Obligations */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center text-green-600">
                  <CheckCircle className="w-6 h-6" />
                </div>
                Your Obligations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                When using our services, you agree to:
              </p>
              <ul className="space-y-2">
                {userObligations.map((obligation, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-600">{obligation}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Prohibited Uses */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center text-red-600">
                  <XCircle className="w-6 h-6" />
                </div>
                Prohibited Uses
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                You may not use our services for any of the following purposes:
              </p>
              <ul className="space-y-2">
                {prohibitedUses.map((use, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <XCircle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-600">{use}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Intellectual Property */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle>Intellectual Property Rights</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {intellectualProperty.map((item, index) => (
                  <li key={index} className="text-gray-600">
                    • {item}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Privacy */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle>Privacy</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                Your privacy is important to us. Please review our Privacy Policy, which also governs your use of the Service, to understand our practices.
              </p>
              <a 
                href="/privacy" 
                className="text-blue-600 hover:text-blue-800 underline"
              >
                View Privacy Policy
              </a>
            </CardContent>
          </Card>

          {/* Termination */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle>Termination</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                We may terminate or suspend your access immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms.
              </p>
              <p className="text-gray-600">
                Upon termination, your right to use the Service will cease immediately. If you wish to terminate your account, you may simply discontinue using the Service.
              </p>
            </CardContent>
          </Card>

          {/* Governing Law */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle>Governing Law</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                These Terms shall be interpreted and governed by the laws of the United States, without regard to its conflict of law provisions. Our failure to enforce any right or provision of these Terms will not be considered a waiver of those rights.
              </p>
            </CardContent>
          </Card>

          {/* Changes to Terms */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle>Changes to Terms</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a revision is material, we will try to provide at least 30 days notice prior to any new terms taking effect.
              </p>
              <p className="text-gray-600">
                What constitutes a material change will be determined at our sole discretion. By continuing to access or use our Service after those revisions become effective, you agree to be bound by the revised terms.
              </p>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card className="border-0 shadow-lg bg-blue-50">
            <CardHeader>
              <CardTitle>Contact Us</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                If you have any questions about these Terms of Service, please contact us:
              </p>
              <div className="space-y-2">
                <p className="text-gray-600">
                  <strong>Email:</strong> legal@aitoolbox.com
                </p>
                <p className="text-gray-600">
                  <strong>Address:</strong> AI Toolbox Team, San Francisco, CA
                </p>
                <p className="text-gray-600">
                  <strong>Response Time:</strong> We aim to respond to legal inquiries within 72 hours.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 