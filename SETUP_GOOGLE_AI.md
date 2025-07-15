# 🚀 Google AI Setup Guide

Follow these steps to enable **FREE** AI-powered features in your toolbox:

## Step 1: Get Google AI API Key (Free!)

1. **Visit Google AI Studio**: https://makersuite.google.com/app/apikey
2. **Sign in** with your Google account
3. **Click "Create API Key"**
4. **Copy your API key** (it starts with `AIza...`)

## Step 2: Install Dependencies

```bash
cd ai-toolbox
npm install @google/generative-ai
```

## Step 3: Create Environment File

Create a file named `.env.local` in the `ai-toolbox` folder:

```env
# Google AI Configuration (FREE!)
GOOGLE_AI_API_KEY=AIzaSy...your_key_here

# MongoDB Configuration (optional)
MONGODB_URI=mongodb://localhost:27017/ai-toolbox

# Next.js Configuration
NEXTAUTH_SECRET=any_random_string_here
NEXTAUTH_URL=http://localhost:3001
```

## Step 4: Restart Development Server

```bash
npm run dev
```

## ✅ Test AI Features

Once setup is complete, test these AI-powered tools:

1. **SWOT Analysis**: `/tools/swot-analysis`
   - Enter business type and description
   - Get comprehensive strategic analysis

2. **Finance Advisor**: `/tools/finance-advisor`
   - Enter your financial information  
   - Receive personalized budget advice

3. **Diet Planner**: `/tools/diet-planner`
   - Get AI-generated meal plans
   - Personalized nutrition recommendations

## 🆓 Google AI Free Tier

Google provides generous free usage:
- **Gemini 1.5 Flash**: 15 requests per minute
- **No credit card required**
- **Perfect for personal projects**

## 🔧 Troubleshooting

### Issue: "Google AI API error"
- ✅ Check your API key is correct
- ✅ Ensure you're signed into Google AI Studio
- ✅ Verify the key has proper permissions

### Issue: AI returns demo data
- ✅ Check `.env.local` file exists
- ✅ Restart development server after adding key
- ✅ Look for "Reload env: .env.local" in terminal

### Issue: MongoDB connection failed
- ✅ This is optional - tools work without database
- ✅ Only affects data storage, not AI functionality

## 🎯 What's Working Now

| Tool | Without API Key | With Google AI Key |
|------|----------------|-------------------|
| **SWOT Analysis** | Demo data | 🤖 Real AI analysis |
| **Finance Advisor** | Smart fallback | 🤖 Personalized advice |
| **Other Tools** | ✅ Fully functional | ✅ No change needed |

---

**Ready to experience AI-powered insights? Follow the steps above!** 🚀 