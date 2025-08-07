#!/bin/bash

echo "🚀 Starting AI Toolbox Deployment..."

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Please run this script from the project root."
    exit 1
fi

# Check environment variables
if [ ! -f ".env.production" ]; then
    echo "❌ Error: .env.production file not found!"
    echo "Please create .env.production with your production environment variables."
    exit 1
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Run tests
echo "🧪 Running tests..."
npm test

# Build the project
echo "🔨 Building project..."
npm run build

# Deploy to Vercel
echo "🚀 Deploying to Vercel..."
vercel --prod

echo "✅ Deployment completed!"
echo "🌐 Your app should be live at: https://your-domain.vercel.app"
