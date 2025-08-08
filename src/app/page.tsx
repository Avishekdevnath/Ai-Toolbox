import Image from "next/image";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import NewFooter from "@/components/NewFooter";

const aiTools = [
  {
    id: 'swot-analysis',
    name: 'SWOT Analysis Tool',
    description: 'Generate comprehensive SWOT analysis based on your input',
    icon: '📊',
    category: 'Business',
    href: '/tools/swot-analysis',
    features: ['AI-powered analysis', 'Comprehensive reports', 'Export options']
  },
  {
    id: 'finance-advisor',
    name: 'Finance Tools',
    description: 'Comprehensive financial planning and analysis',
    icon: '💰',
    category: 'Finance',
    href: '/tools/finance-advisor',
    features: ['8 modules', 'AI insights', 'Retirement planning']
  },
  {
    id: 'diet-planner',
    name: 'Diet Planner',
    description: 'AI-driven meal planning and nutrition recommendations',
    icon: '🥗',
    category: 'Health',
    href: '/tools/diet-planner',
    features: ['AI meal plans', 'Nutrition analysis', 'Dietary restrictions']
  },
  {
    id: 'price-tracker',
    name: 'Product Price Tracker',
    description: 'Track prices of products across websites',
    icon: '🛍️',
    category: 'Shopping',
    href: '/tools/price-tracker',
    features: ['AI pricing', 'Price history', 'Alerts']
  },
  {
    id: 'age-calculator',
    name: 'Age Calculator',
    description: 'Comprehensive age analysis with life milestones',
    icon: '📅',
    category: 'Health',
    href: '/tools/age-calculator',
    features: ['Life milestones', 'Health recommendations', 'AI insights']
  },
  {
    id: 'quote-generator',
    name: 'Quote Generator',
    description: 'Generate AI-powered quotes and inspiration',
    icon: '💭',
    category: 'Entertainment',
    href: '/tools/quote-generator',
    features: ['Topic-based', 'Mood selection', 'AI generation']
  },
  {
    id: 'resume-reviewer',
    name: 'Resume Reviewer',
    description: 'AI-powered resume analysis and optimization',
    icon: '📄',
    category: 'Career',
    href: '/tools/resume-reviewer',
    features: ['ATS optimization', 'Industry analysis', 'Actionable feedback']
  },
  {
    id: 'mock-interviewer',
    name: 'Mock Interviewer',
    description: 'Role-based interview practice with real market data and evaluation',
    icon: '🎤',
    category: 'Career',
    href: '/tools/mock-interviewer',
    features: ['Role-based questions', 'Real market data', 'Experience level matching']
  },
  {
    id: 'job-interviewer',
    name: 'Job-Specific Interviewer',
    description: 'Targeted interviews based on job postings and requirements',
    icon: '💼',
    category: 'Career',
    href: '/tools/job-interviewer',
    features: ['Job posting analysis', 'Role-based questions', 'Job fit scoring']
  }
];

const utilityTools = [
  {
    id: 'url-shortener',
    name: 'URL Shortener',
    description: 'Shorten URLs with custom aliases and analytics',
    icon: '🔗',
    category: 'Utility',
    href: '/tools/url-shortener',
    features: ['Custom aliases', 'Click tracking', 'QR codes']
  },
  {
    id: 'qr-generator',
    name: 'QR Code Generator',
    description: 'Generate QR codes for any text or URL',
    icon: '📱',
    category: 'Utility',
    href: '/tools/qr-generator',
    features: ['Custom styling', 'Multiple formats', 'Download options']
  },
  {
    id: 'password-generator',
    name: 'Password Generator',
    description: 'Generate secure random passwords',
    icon: '🔐',
    category: 'Security',
    href: '/tools/password-generator',
    features: ['Multiple options', 'Strength meter', 'Copy to clipboard']
  },
  {
    id: 'tip-calculator',
    name: 'Tip Calculator',
    description: 'Calculate tips and split bills with AI suggestions',
    icon: '🧮',
    category: 'Finance',
    href: '/tools/tip-calculator',
    features: ['AI suggestions', 'Bill splitting', 'Tax calculations']
  },
  {
    id: 'word-counter',
    name: 'Word Counter',
    description: 'Count words with detailed analysis',
    icon: '📊',
    category: 'Writing',
    href: '/tools/word-counter',
    features: ['Detailed analysis', 'Readability score', 'Character count']
  },
  {
    id: 'unit-converter',
    name: 'Unit Converter',
    description: 'Convert between different units with live currency',
    icon: '⚖️',
    category: 'Utility',
    href: '/tools/unit-converter',
    features: ['Live currency', 'Multiple units', 'Real-time rates']
  }
];

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 via-white to-blue-100 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900">
      <Navbar />
      
      {/* Hero Section */}
      <section className="max-w-4xl mx-auto text-center py-24 px-4 flex flex-col items-center justify-center">
        <div className="mb-4">
          <Image src="/file.svg" alt="AI Toolbox Logo" width={80} height={80} className="drop-shadow-lg" />
        </div>
        <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 dark:text-white mb-4 tracking-tight bg-gradient-to-r from-blue-600 via-fuchsia-500 to-pink-500 bg-clip-text text-transparent">
          AI Toolbox
        </h1>
        <p className="text-xl md:text-2xl text-gray-700 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
          A modern suite of AI-powered and utility tools to boost your productivity, creativity, and decision-making. All in one place.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-10">
          <Link href="/ai-tools" className="inline-block bg-gradient-to-r from-blue-600 via-fuchsia-500 to-pink-500 text-white px-8 py-3 rounded-xl font-semibold shadow-lg hover:scale-105 transition-transform text-lg">
            Explore AI Tools
          </Link>
          <Link href="/utilities" className="inline-block bg-gradient-to-r from-green-500 to-blue-500 text-white px-8 py-3 rounded-xl font-semibold shadow-lg hover:scale-105 transition-transform text-lg">
            Browse Utilities
          </Link>
        </div>
        <div className="max-w-2xl mx-auto mt-8">
          <p className="text-lg text-gray-600 dark:text-gray-400 mb-4">
            AI Toolbox brings together the best of artificial intelligence and practical utilities for everyone—students, professionals, and creators. Open source, privacy-friendly, and always improving.
          </p>
        </div>
      </section>

      {/* Popular Tools Section */}
      <section className="max-w-6xl mx-auto py-16 px-4">
        <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-12">
          Popular AI Tools
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {aiTools.slice(0, 6).map((tool) => (
            <div
              key={tool.id}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group hover:-translate-y-1"
            >
              <Link href={tool.href}>
                <div className="p-6">
                  <div className="flex items-center mb-4">
                    <span className="text-3xl mr-3">{tool.icon}</span>
                    <div>
                      <h3 className="font-semibold text-lg text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {tool.name}
                      </h3>
                      <span className="text-sm text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 px-2 py-1 rounded-full">
                        {tool.category}
                      </span>
                    </div>
                  </div>
                  <p className="text-gray-600 dark:text-gray-300 mb-4">{tool.description}</p>
                  <div className="flex flex-wrap gap-1">
                    {tool.features.slice(0, 2).map((feature, idx) => (
                      <span key={idx} className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-1 rounded">
                        {feature}
                      </span>
                    ))}
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </div>
        
        <div className="text-center">
          <Link href="/ai-tools" className="inline-block bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-6 py-3 rounded-lg font-semibold hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors">
            View All AI Tools →
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section className="max-w-5xl mx-auto py-16 px-4">
        <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-10">
          Why Choose AI Toolbox?
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {[
            { icon: '🤖', title: 'AI-Powered', desc: 'Harness the latest in artificial intelligence for smarter, faster results.' },
            { icon: '🧰', title: 'All-in-One Suite', desc: 'From productivity to creativity, access a wide range of tools in one place.' },
            { icon: '🔒', title: 'Privacy-First', desc: 'Your data stays yours. We never sell or misuse your information.' },
            { icon: '🌈', title: 'Open Source', desc: 'Built by the community, for the community. Contribute or customize freely.' }
          ].map((feature, index) => (
            <div 
              key={index}
              className="bg-white dark:bg-gray-800 rounded-xl shadow p-6 flex flex-col items-center text-center hover:shadow-lg transition-shadow"
            >
              <span className="text-4xl mb-3">{feature.icon}</span>
              <h3 className="font-semibold text-lg text-gray-900 dark:text-white mb-2">{feature.title}</h3>
              <p className="text-gray-600 dark:text-gray-300">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works Section */}
      <section className="max-w-4xl mx-auto py-16 px-4">
        <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-10">
          How It Works
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
          {[
            { step: '1', title: 'Choose a Tool', desc: 'Pick from a variety of AI and utility tools.' },
            { step: '2', title: 'Input Your Data', desc: 'Enter your info, upload a file, or paste text as needed.' },
            { step: '3', title: 'Get Instant Results', desc: 'See your results, insights, or downloads in seconds.' },
            { step: '4', title: 'Take Action', desc: 'Copy, share, or use your results to make smarter decisions.' }
          ].map((item, index) => (
            <div 
              key={index}
              className="flex flex-col items-center"
            >
              <div className="bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-200 rounded-full w-16 h-16 flex items-center justify-center text-3xl mb-3 font-bold">
                {item.step}
              </div>
              <h4 className="font-semibold text-lg text-gray-900 dark:text-white mb-2">{item.title}</h4>
              <p className="text-gray-600 dark:text-gray-300">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="max-w-5xl mx-auto py-16 px-4">
        <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-10">
          What Users Say
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { rating: '⭐️⭐️⭐️⭐️⭐️', text: '"AI Toolbox has become my go-to for quick, smart solutions. The tools are intuitive and save me hours every week!"', author: 'Alex, Product Manager' },
            { rating: '⭐️⭐️⭐️⭐️⭐️', text: '"I love the privacy-first approach. I can use powerful AI tools without worrying about my data."', author: 'Priya, Developer' },
            { rating: '⭐️⭐️⭐️⭐️⭐️', text: '"The all-in-one suite is a game changer. Everything I need, beautifully designed and easy to use."', author: 'Sam, Designer' }
          ].map((testimonial, index) => (
            <div 
              key={index}
              className="bg-white dark:bg-gray-800 rounded-xl shadow p-6 flex flex-col items-center text-center hover:shadow-lg transition-shadow"
            >
              <span className="text-3xl mb-3">{testimonial.rating}</span>
              <p className="text-gray-700 dark:text-gray-200 mb-3">{testimonial.text}</p>
              <span className="text-sm text-gray-500 dark:text-gray-400">— {testimonial.author}</span>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ Section */}
      <section className="max-w-3xl mx-auto py-16 px-4">
        <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-10">
          Frequently Asked Questions
        </h2>
        <div className="space-y-6">
          {[
            { q: 'Is AI Toolbox free to use?', a: 'Yes! All core tools are free to use. Some advanced features may require an account in the future, but the majority will always be free.' },
            { q: 'How is my data handled?', a: 'Your privacy is our priority. We never sell your data, and most tools process information directly in your browser.' },
            { q: 'Can I contribute or suggest a tool?', a: 'Absolutely! AI Toolbox is open source. Visit our GitHub or contact us to suggest features or contribute code.' },
            { q: 'Do I need to sign up?', a: 'No sign-up is required for most tools. If you want to save data or access premium features in the future, you may need an account.' }
          ].map((faq, index) => (
            <div 
              key={index}
              className="bg-white dark:bg-gray-800 rounded-xl shadow p-6 hover:shadow-lg transition-shadow"
            >
              <h4 className="font-semibold text-lg text-gray-900 dark:text-white mb-2">{faq.q}</h4>
              <p className="text-gray-600 dark:text-gray-300">{faq.a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <NewFooter />
    </div>
  );
}
