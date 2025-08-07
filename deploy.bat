@echo off
echo 🚀 Starting AI Toolbox Deployment...

REM Check if we're in the right directory
if not exist "package.json" (
    echo ❌ Error: package.json not found. Please run this script from the project root.
    pause
    exit /b 1
)

REM Check environment variables
if not exist ".env.production" (
    echo ❌ Error: .env.production file not found!
    echo Please create .env.production with your production environment variables.
    pause
    exit /b 1
)

REM Install dependencies
echo 📦 Installing dependencies...
call npm install

REM Run tests
echo 🧪 Running tests...
call npm test

REM Build the project
echo 🔨 Building project...
call npm run build

REM Deploy to Vercel
echo 🚀 Deploying to Vercel...
call vercel --prod

echo ✅ Deployment completed!
echo 🌐 Your app should be live at: https://your-domain.vercel.app
pause 