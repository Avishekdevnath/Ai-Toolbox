import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Brain, 
  Zap, 
  Shield, 
  Users, 
  Code, 
  Globe,
  CheckCircle,
  TrendingUp,
  Heart,
  Star
} from 'lucide-react';

export default function AboutPage() {
  const features = [
    {
      icon: <Brain className="w-6 h-6" />,
      title: "AI-Powered Insights",
      description: "Advanced AI integration providing personalized recommendations and intelligent analysis across all tools."
    },
    {
      icon: <Zap className="w-6 h-6" />,
      title: "Lightning Fast",
      description: "Optimized performance with instant calculations and real-time updates for seamless user experience."
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: "Privacy First",
      description: "Your data stays private. We don't store personal information and all calculations happen locally when possible."
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: "User-Friendly",
      description: "Intuitive interface designed for users of all technical levels with clear, actionable results."
    },
    {
      icon: <Code className="w-6 h-6" />,
      title: "Open Source",
      description: "Built with modern technologies and open to community contributions for continuous improvement."
    },
    {
      icon: <Globe className="w-6 h-6" />,
      title: "Always Available",
      description: "Access your tools anywhere, anytime with our responsive web application that works on all devices."
    }
  ];

  const stats = [
    { label: "Tools Available", value: "12+", icon: <CheckCircle className="w-5 h-5" /> },
    { label: "AI Features", value: "8+", icon: <Brain className="w-5 h-5" /> },
    { label: "Daily Users", value: "1000+", icon: <Users className="w-5 h-5" /> },
    { label: "Calculations", value: "10K+", icon: <TrendingUp className="w-5 h-5" /> }
  ];

  const team = [
    {
      name: "AI Toolbox Team",
      role: "Development Team",
      description: "Passionate developers and designers creating innovative tools for the community.",
      avatar: "🤖"
    }
  ];

  const technologies = [
    "Next.js 15", "React 19", "TypeScript", "Tailwind CSS", 
    "Google Gemini AI", "MongoDB", "Node.js", "Vercel"
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Hero Section */}
      <div className="bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              About <span className="text-blue-600">AI Toolbox</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
              Your comprehensive collection of AI-powered tools designed to simplify everyday tasks 
              and enhance productivity with intelligent insights and automation.
            </p>
            <div className="flex items-center justify-center space-x-2 text-gray-500">
              <Heart className="w-5 h-5 text-red-500" />
              <span>Built with love for the community</span>
            </div>
          </div>
        </div>
      </div>

      {/* Mission Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Mission</h2>
            <p className="text-lg text-gray-600 mb-6">
              We believe that powerful tools should be accessible to everyone. Our mission is to 
              democratize AI technology by providing a comprehensive suite of intelligent tools 
              that help people solve real-world problems efficiently.
            </p>
            <p className="text-lg text-gray-600 mb-6">
              From financial planning to health management, from productivity tools to creative 
              assistance - we're building the future of AI-powered utilities, one tool at a time.
            </p>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-1">
                <Star className="w-5 h-5 text-yellow-500" />
                <span className="text-gray-700 font-medium">Free Forever</span>
              </div>
              <div className="flex items-center space-x-1">
                <Shield className="w-5 h-5 text-green-500" />
                <span className="text-gray-700 font-medium">Privacy Focused</span>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">What We Offer</h3>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                <div>
                  <h4 className="font-semibold text-gray-900">Financial Tools</h4>
                  <p className="text-gray-600">Comprehensive financial planning, retirement calculators, and investment analysis</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-green-600 rounded-full mt-2"></div>
                <div>
                  <h4 className="font-semibold text-gray-900">Health & Lifestyle</h4>
                  <p className="text-gray-600">Age calculators, diet planners, and wellness recommendations</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-purple-600 rounded-full mt-2"></div>
                <div>
                  <h4 className="font-semibold text-gray-900">Productivity Tools</h4>
                  <p className="text-gray-600">URL shorteners, QR generators, password managers, and more</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-orange-600 rounded-full mt-2"></div>
                <div>
                  <h4 className="font-semibold text-gray-900">Business Tools</h4>
                  <p className="text-gray-600">SWOT analysis, quote generators, and business utilities</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Choose AI Toolbox?</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              We combine cutting-edge AI technology with user-friendly design to deliver 
              tools that actually make a difference in your daily life.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-shadow">
                <CardHeader>
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 mb-4">
                    {feature.icon}
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">Growing Together</h2>
            <p className="text-blue-100 text-lg">
              Join thousands of users who trust AI Toolbox for their daily needs
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="flex items-center justify-center w-16 h-16 bg-white/20 rounded-full mx-auto mb-4">
                  <div className="text-white">{stat.icon}</div>
                </div>
                <div className="text-3xl font-bold text-white mb-2">{stat.value}</div>
                <div className="text-blue-100">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Team Section */}
      <div className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Meet Our Team</h2>
            <p className="text-lg text-gray-600">
              Passionate developers and designers working to make AI accessible to everyone
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {team.map((member, index) => (
              <Card key={index} className="text-center border-0 shadow-lg">
                <CardContent className="pt-8">
                  <div className="text-6xl mb-4">{member.avatar}</div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{member.name}</h3>
                  <p className="text-blue-600 mb-4">{member.role}</p>
                  <p className="text-gray-600">{member.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Technology Stack */}
      <div className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Built with Modern Technology</h2>
            <p className="text-lg text-gray-600">
              We use the latest technologies to ensure performance, security, and scalability
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-3">
            {technologies.map((tech, index) => (
              <Badge key={index} variant="outline" className="text-sm px-4 py-2">
                {tech}
              </Badge>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-white py-16">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">
            Ready to Get Started?
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            Explore our collection of AI-powered tools and discover how they can help you 
            be more productive and efficient in your daily tasks.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/"
              className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors"
            >
              Explore Tools
            </a>
            <a
              href="/contact"
              className="inline-flex items-center justify-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors"
            >
              Contact Us
            </a>
          </div>
        </div>
      </div>
    </div>
  );
} 