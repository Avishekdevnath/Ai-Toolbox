# 🧰 AI Toolbox

A comprehensive suite of AI-powered tools built with Next.js, Google Gemini AI, and MongoDB. Features 26+ tools for personal and professional productivity.

## ✨ Features

### 🤖 AI-Powered Tools
- **SWOT Analysis** - Generate comprehensive business analysis with Google Gemini
- **Finance Advisor** - Personalized financial advice and budget planning
- **Diet Planner** - AI-driven meal planning with Google Gemini
- **Resume Builder** - Optimize resumes for job descriptions (coming soon)
- **Career Path Finder** - Suggest career paths based on skills (coming soon)

### 🔧 Utility Tools
- **QR Code Generator** - Generate QR codes with custom sizes
- **Password Generator** - Secure password generation with customizable options
- **Tip Calculator** - Calculate tips and split bills
- **Word Counter** - Advanced text analysis with readability scores
- **Unit Converter** - Convert between different measurement units
- **Age Calculator** - Calculate precise age with statistics
- **URL Shortener** - Create shortened URLs with custom aliases

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- MongoDB (local or MongoDB Atlas)
- Google AI API key (free tier available)

### Installation

1. **Clone and setup the project:**
   ```bash
   cd ai-toolbox
   npm install
   ```

2. **Create environment file:**
   Create a `.env.local` file in the root directory:
   ```env
   # Google AI Configuration
   GOOGLE_AI_API_KEY=your_google_ai_api_key_here
   
   # MongoDB Configuration  
   MONGODB_URI=mongodb://localhost:27017/ai-toolbox
   # For MongoDB Atlas: mongodb+srv://username:password@cluster.mongodb.net/ai-toolbox
   
   # Next.js Configuration
   NEXTAUTH_SECRET=your_random_secret_here
   NEXTAUTH_URL=http://localhost:3001
   
   # Application Configuration
   APP_NAME="AI Toolbox"
   APP_VERSION="1.0.0"
   ```

3. **Get your API keys:**
   - **Google AI API Key**: Visit [Google AI Studio](https://makersuite.google.com/app/apikey) (Free tier available!)
   - **MongoDB**: 
     - Local: Install MongoDB locally
     - Cloud: Create account at [MongoDB Atlas](https://www.mongodb.com/atlas)

4. **Start the development server:**
   ```bash
   npm run dev
   ```

5. **Open your browser:**
   ```
   http://localhost:3001
   ```

## 🎯 Using AI Features

### SWOT Analysis Tool
1. Navigate to `/tools/swot-analysis`
2. Enter your business type and description
3. Click "Generate SWOT Analysis"
4. Get AI-powered insights with strategic recommendations

### Finance Advisor Tool  
1. Navigate to `/tools/finance-advisor`
2. Enter your financial information
3. Click "Get Financial Advice" 
4. Receive personalized budget and investment advice

## 🗄️ Database Collections

The app automatically creates these MongoDB collections:

- `swot-analyses` - Stores SWOT analysis results
- `finance-consultations` - Stores financial advice sessions
- `url-shortcuts` - Stores shortened URLs (future feature)
- `user-preferences` - Stores user settings (future feature)

## 🛠️ Architecture

### Tech Stack
- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **AI**: Google Gemini 1.5 Flash (Free)
- **Database**: MongoDB with Mongoose
- **Deployment**: Vercel (recommended)

### Project Structure
```
ai-toolbox/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   └── analyze/
│   │   │       ├── swot/route.ts
│   │   │       └── finance/route.ts
│   │   ├── tools/
│   │   │   └── [toolId]/page.tsx
│   │   └── page.tsx
│   ├── components/
│   │   └── tools/
│   │       ├── SwotAnalysisTool.tsx
│   │       ├── FinanceAdvisorTool.tsx
│   │       └── [other tools]
│   └── lib/
│       ├── mongodb.ts
│       └── openai.ts
├── .env.local
└── package.json
```

## 🔧 API Endpoints

### POST `/api/analyze/swot`
Generate SWOT analysis using AI.

**Request Body:**
```json
{
  "businessType": "Tech Startup",
  "description": "A SaaS platform for..."
}
```

**Response:**
```json
{
  "success": true,
  "analysis": {
    "strengths": ["..."],
    "weaknesses": ["..."], 
    "opportunities": ["..."],
    "threats": ["..."]
  }
}
```

### POST `/api/analyze/finance`
Get personalized financial advice.

**Request Body:**
```json
{
  "income": 5000,
  "expenses": 3000,
  "savings_goal": "Emergency fund",
  "debt": 1000,
  "age": 30,
  "risk_tolerance": "Moderate"
}
```

## 📊 Fallback Behavior

All AI tools include fallback mechanisms:
- If Google AI API fails → Use pre-defined responses
- If MongoDB fails → Continue without saving (logged)
- If environment variables missing → Show helpful error messages

## 🔒 Security & Privacy

- Environment variables for sensitive data
- No authentication required (as requested)
- MongoDB data includes only necessary fields
- IP addresses logged for analytics (optional)

## 🚀 Deployment

### Vercel (Recommended)
1. Connect your GitHub repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy automatically on push

### Environment Variables for Production:
```env
GOOGLE_AI_API_KEY=your_google_ai_key
MONGODB_URI=your_mongodb_atlas_uri
NEXTAUTH_SECRET=your_production_secret
NEXTAUTH_URL=https://your-domain.vercel.app
```

## 🔮 Future Features

### Planned AI Tools
- **Diet Planner** - AI meal planning and nutrition
- **Resume Builder** - ATS-optimized resume generation
- **Career Path Finder** - Career guidance based on skills
- **Mental Health Tracker** - Mood tracking with AI insights
- **Travel Planner** - AI-powered travel recommendations

### Planned Utility Tools
- **File Resizer** - Image resizing and compression
- **Time Zone Converter** - Global time zone conversion
- **Random Quote Generator** - Inspirational quotes
- **Emergency Preparedness** - Personalized emergency plans

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Add your tool in `src/components/tools/`
4. Update the tool registry in `[toolId]/page.tsx`
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License.

## 🆘 Troubleshooting

### Common Issues

1. **"MongoDB connection failed"**
   - Check MONGODB_URI in .env.local
   - Ensure MongoDB is running (local) or accessible (Atlas)

2. **"Google AI API error"**
   - Verify GOOGLE_AI_API_KEY is correct
   - Check if you're within free tier limits
   - Ensure API key has proper permissions

3. **"Port 3000 in use"**
   - The app automatically uses port 3001
   - Or kill process on port 3000: `npx kill-port 3000`

4. **TypeScript errors**
   - Run `npm run build` to check for type errors
   - Ensure all dependencies are installed

### Getting Help
- Check browser console for errors
- Review server logs in terminal
- Verify environment variables are set correctly

---

Built with ❤️ using Next.js, Google Gemini AI, and MongoDB
