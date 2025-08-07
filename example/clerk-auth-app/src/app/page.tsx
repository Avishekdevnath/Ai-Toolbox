import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Welcome to AI Toolbox
              </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Your comprehensive platform for AI-powered tools and solutions.
            Sign up to unlock powerful features and start building amazing things.
          </p>
            </div>

        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              Get Started
            </h2>
            <p className="text-gray-600 mb-6">
              Join thousands of users who are already building amazing things with AI Toolbox.
            </p>
            <div className="space-y-4">
              <Link
                href="/sign-up"
                className="block w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold py-3 px-6 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 text-center"
              >
                Create Account
              </Link>
                <Link
                href="/sign-in"
                className="block w-full bg-white text-blue-600 font-semibold py-3 px-6 rounded-lg border-2 border-blue-600 hover:bg-blue-50 transition-all duration-200 text-center"
                >
                  Sign In
                </Link>
            </div>
          </div>
        </div>
        </div>
    </div>
  );
}
