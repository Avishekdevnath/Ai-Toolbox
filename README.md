# AI Toolbox

A comprehensive collection of AI-powered tools and utilities built with Next.js 15, React 19, TypeScript, and Google Gemini AI.

## 🚀 Features

- **AI-Powered Tools**: Diet planning, SWOT analysis, financial advice, resume review, and more
- **URL Shortener**: Professional URL shortening with analytics and anonymous user support
- **Modern Tech Stack**: Next.js 15, React 19, TypeScript, Tailwind CSS 4.1
- **Cloud Database**: MongoDB Atlas integration with automatic TTL indexes
- **Authentication**: NextAuth.js with Google/GitHub OAuth support
- **Professional UI**: Responsive design with dark mode support
- **Configuration Management**: Centralized environment variable management with validation

## 🛠️ Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS 4.1
- **Backend**: Next.js API Routes, Google Gemini 1.5 Flash AI
- **Database**: MongoDB Atlas with Mongoose
- **Authentication**: NextAuth.js
- **Deployment**: Vercel-ready
- **Configuration**: Centralized config management with validation

## 📋 Prerequisites

- Node.js 18+ 
- MongoDB Atlas account (free tier available)
- Google AI API key (free tier available)

## 🚀 Quick Start

### 1. Clone the Repository

   ```bash
git clone <repository-url>
   cd ai-toolbox
```

### 2. Install Dependencies

```bash
   npm install
   ```

### 3. Environment Configuration

Copy the environment template and configure your variables:

```bash
cp env.local.template .env.local
```

Edit `.env.local` with your actual values:

   ```env
# Required Variables
   GOOGLE_AI_API_KEY=your_google_ai_api_key_here
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/ai-toolbox
NEXTAUTH_SECRET=your_super_secure_nextauth_secret_here_minimum_32_characters
NEXTAUTH_URL=http://localhost:3000

# Optional Variables
APP_NAME=AI Toolbox
APP_VERSION=1.0.0
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

### 4. Get API Keys

#### Google AI API Key
1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a new API key
3. Add it to your `.env.local` as `GOOGLE_AI_API_KEY`

#### MongoDB Atlas Setup
1. Visit [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a free cluster
3. Get your connection string
4. Add it to your `.env.local` as `MONGODB_URI`

#### NextAuth Secret (Optional)
Generate a secure secret:
```bash
openssl rand -base64 32
```

### 5. Run the Development Server

   ```bash
   npm run dev
   ```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## 🔧 Configuration Management

The application uses a centralized configuration system with comprehensive validation:

### Environment Variables

All environment variables are standardized and validated on startup:

#### Required Variables
- `GOOGLE_AI_API_KEY`: Google AI API key for Gemini 1.5 Flash
- `MONGODB_URI`: MongoDB Atlas connection string
- `NEXTAUTH_SECRET`: Secure secret for NextAuth.js (min 32 characters)

#### Optional Variables
- `GOOGLE_AI_MODEL`: AI model to use (default: gemini-1.5-flash)
- `GOOGLE_AI_MAX_TOKENS`: Maximum tokens for AI responses (default: 2048)
- `GOOGLE_AI_TEMPERATURE`: AI response creativity (default: 0.7)
- `MONGODB_DB_NAME`: Database name (default: ai-toolbox)
- `APP_NAME`: Application name (default: AI Toolbox)
- `APP_VERSION`: Application version (default: 1.0.0)
- `NEXT_PUBLIC_BASE_URL`: Public base URL (default: http://localhost:3000)

#### Feature Flags
- `ENABLE_ANALYTICS`: Enable analytics features (default: true)
- `ENABLE_RATE_LIMITING`: Enable rate limiting (default: true)
- `ENABLE_CACHING`: Enable caching (default: true)
- `ENABLE_HEALTH_CHECKS`: Enable health checks (default: true)

### Configuration Validation

The system automatically validates configuration on startup:

```typescript
import { config, getEnvironmentConfig } from '@/lib/config';

// Access configuration
const aiConfig = config.googleAI;
const dbConfig = config.mongodb;

// Check environment
const env = getEnvironmentConfig();
console.log(env.isDevelopment); // true/false
```

### System Health Monitoring

Check system health via API:

```bash
# Basic health check
curl http://localhost:3000/api/system/health

# Detailed health check with configuration report
curl http://localhost:3000/api/system/health?detailed=true
```

## 🗄️ Database Collections

The application uses MongoDB Atlas with the following collections:

### `shortened_urls`
- URL shortening with TTL indexes for automatic expiration
- Anonymous user support with device fingerprinting
- Click tracking and analytics
- Custom aliases and flexible expiration

### `tools`
- Tool usage tracking
- Analytics and statistics

### `users`
- User authentication data
- Profile information

## 🏗️ Architecture

### Configuration Layer
- **Centralized Config**: `src/lib/config.ts` - Single source of truth for all configuration
- **Validation**: Automatic validation of environment variables and configuration
- **Type Safety**: Full TypeScript support for configuration access

### Service Layer
- **MongoDB Service**: `src/lib/mongodb.ts` - Database connection and management
- **AI Service**: `src/lib/gemini.ts` - Google Gemini AI integration
- **Auth Service**: `src/lib/authOptions.ts` - NextAuth.js configuration

### API Layer
- **RESTful APIs**: Next.js API routes for all functionality
- **Error Handling**: Consistent error responses and validation
- **Health Monitoring**: System health and configuration validation endpoints

### Frontend Layer
- **React Components**: Modern React 19 with hooks and context
- **TypeScript**: Full type safety throughout the application
- **Responsive Design**: Mobile-first design with Tailwind CSS

## 🔍 API Endpoints

### Core APIs
- `POST /api/analyze/diet` - AI-powered diet planning
- `POST /api/analyze/swot` - SWOT analysis generation
- `POST /api/analyze/finance` - Financial advice
- `POST /api/analyze/investment` - Investment analysis
- `POST /api/analyze/retirement` - Retirement planning
- `POST /api/analyze/debt` - Debt management

### URL Shortener APIs
- `POST /api/url-shortener` - Create shortened URLs
- `GET /api/url-shortener` - List user's URLs
- `GET /api/url-shortener/stats` - URL analytics
- `DELETE /api/url-shortener/[id]` - Delete URLs

### System APIs
- `GET /api/system/health` - System health check
- `POST /api/system/health` - Trigger health check

### Tool Tracking
- `POST /api/tools/[slug]/track-usage` - Track tool usage

## 🎨 UI Components

### Core Components
- **Header**: Navigation and user authentication
- **Footer**: Links and information
- **Tool Sidebar**: Tool navigation and categories

### Tool Components
- **DietPlannerTool**: AI-powered diet planning interface
- **URLShortenerTool**: Professional URL shortening with analytics
- **SwotAnalysisTool**: SWOT analysis generation
- **FinanceAdvisorTool**: Financial planning and advice

### Utility Components
- **LoadingOverlay**: Loading states and progress indicators
- **ErrorBoundary**: Error handling and fallback UI
- **ResponsiveLayout**: Mobile-responsive layouts

## 🔒 Security Features

- **Input Validation**: All inputs validated and sanitized
- **Rate Limiting**: Configurable rate limiting for API endpoints
- **Authentication**: Secure NextAuth.js integration
- **Environment Variables**: Secure handling of sensitive configuration
- **CORS Protection**: Cross-origin request protection
- **Security Headers**: Automatic security headers

## 🚀 Deployment

### Vercel Deployment
1. Connect your repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Environment Variables for Production
```env
NODE_ENV=production
GOOGLE_AI_API_KEY=your_production_api_key
MONGODB_URI=your_production_mongodb_uri
NEXTAUTH_SECRET=your_production_secret
NEXTAUTH_URL=https://yourdomain.com
NEXT_PUBLIC_BASE_URL=https://yourdomain.com
```

## 🧪 Testing

### Health Checks
```bash
# Check system health
curl http://localhost:3000/api/system/health

# Check configuration
curl http://localhost:3000/api/system/health?detailed=true
```

### Manual Testing
1. Test all AI tools with various inputs
2. Verify URL shortener functionality
3. Check authentication flow
4. Test responsive design on different devices

## 🔧 Development

### Available Scripts
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
```

### Code Structure
```
src/
├── app/             # Next.js 13+ app directory
├── components/      # React components
├── lib/            # Utility libraries and services
├── data/           # Static data and configurations
└── utils/          # Helper utilities
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Troubleshooting

### Common Issues

#### Configuration Errors
- Check that all required environment variables are set
- Verify API key formats and permissions
- Ensure MongoDB connection string is correct

#### AI Service Issues
- Verify Google AI API key is valid and has quota
- Check API key permissions and billing status
- Review error messages in console logs

#### Database Connection Issues
- Verify MongoDB Atlas network access settings
- Check connection string format and credentials
- Ensure database user has proper permissions

#### Authentication Issues
- Verify NextAuth secret is at least 32 characters
- Check OAuth provider configuration
- Review callback URLs and redirect URIs

### Getting Help
- Check the system health endpoint: `/api/system/health`
- Review console logs for detailed error messages
- Verify configuration with detailed health check: `/api/system/health?detailed=true`

## 🔮 Future Features

- [ ] Advanced analytics dashboard
- [ ] Team collaboration features
- [ ] Custom domain support for URL shortener
- [ ] Email notifications and alerts
- [ ] Advanced AI model selection
- [ ] API rate limiting and quotas
- [ ] Multi-language support
- [ ] Mobile app development
