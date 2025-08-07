# AI Toolbox 🚀

A comprehensive collection of AI-powered tools for everyday tasks, built with Next.js, TypeScript, and modern web technologies.

## ✨ Features

- **15+ AI Tools**: From SWOT analysis to password generation
- **Modern UI**: Beautiful, responsive design with Tailwind CSS
- **Real-time Analytics**: Track tool usage and user engagement
- **Admin Dashboard**: Comprehensive management interface
- **Custom Authentication**: Secure admin-only access
- **Privacy-First**: Anonymous user tracking without personal data
- **Production Ready**: Optimized for deployment and scaling

## 🛠️ Tech Stack

- **Frontend**: Next.js 15, React 18, TypeScript
- **Styling**: Tailwind CSS, Radix UI Components
- **Database**: MongoDB with Mongoose ODM
- **AI Integration**: Google Gemini AI
- **Authentication**: Custom JWT-based admin system
- **Deployment**: Vercel-ready with security headers

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- MongoDB database
- Google AI API key

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd ai-toolbox
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env.local` file:
   ```env
   # Database
   MONGODB_URI=your_mongodb_connection_string
   
   # Authentication
   JWT_SECRET=your_jwt_secret_key
   
   # AI Services
   GOOGLE_AI_API_KEY=your_google_ai_api_key
   
   # App Configuration
   NODE_ENV=development
   NEXT_PUBLIC_BASE_URL=http://localhost:3000
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Access the application**
   - Main app: http://localhost:3000
   - Admin panel: http://localhost:3000/admin

## 📁 Project Structure

```
ai-toolbox/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── admin/             # Admin dashboard pages
│   │   ├── api/               # API routes
│   │   ├── tools/             # Tool pages
│   │   └── layout.tsx         # Root layout
│   ├── components/            # React components
│   │   ├── admin/            # Admin-specific components
│   │   ├── tools/            # Tool-specific components
│   │   ├── ui/               # Reusable UI components
│   │   └── common/           # Common components
│   ├── lib/                  # Utility libraries
│   │   ├── mongodb.ts        # Database connection
│   │   ├── adminAuth.ts      # Admin authentication
│   │   └── utils.ts          # General utilities
│   ├── models/               # Mongoose models
│   ├── schemas/              # Zod validation schemas
│   └── hooks/                # Custom React hooks
├── public/                   # Static assets
├── scripts/                  # Utility scripts
└── docs/                     # Documentation
```

## 🎯 Available Tools

### Analysis Tools
- **SWOT Analysis**: Business strategy analysis
- **Age Calculator**: Life planning and insights
- **Quote Generator**: Inspirational quotes
- **Resume Reviewer**: AI-powered resume analysis

### Utility Tools
- **Password Generator**: Secure password creation
- **URL Shortener**: Link management
- **QR Generator**: QR code creation
- **Unit Converter**: Measurement conversions
- **Tip Calculator**: Restaurant tip calculations
- **Word Counter**: Text analysis

### Professional Tools
- **Job Interviewer**: Interview preparation
- **Mock Interviewer**: Practice interviews
- **Finance Advisor**: Financial planning
- **Diet Planner**: Nutrition planning

## 🔐 Authentication

The application uses a **custom admin authentication system**:

- **Admin Access**: `/admin` route for administrative functions
- **JWT Tokens**: Secure token-based authentication
- **Role-Based Access**: Super admin, admin, and moderator roles
- **Session Management**: Persistent admin sessions

### Default Admin Credentials
- **Super Admin**: `superadmin@ai-toolbox.com` / `SuperAdmin123!`
- **Admin**: `admin@ai-toolbox.com` / `Admin123!`
- **Moderator**: `moderator@ai-toolbox.com` / `Moderator123!`

## 📊 Analytics & Tracking

### User Analytics
- **Anonymous Tracking**: Privacy-friendly user identification
- **Tool Usage**: Comprehensive usage statistics
- **Performance Metrics**: Response times and success rates
- **Engagement Data**: User behavior analysis

### Admin Dashboard
- **Real-time Stats**: Live usage monitoring
- **User Management**: Complete user administration
- **Tool Analytics**: Detailed tool performance
- **System Health**: Database and API monitoring

## 🚀 Deployment

### Environment Variables (Production)
```env
# Database
MONGODB_URI=your_production_mongodb_uri

# Authentication
JWT_SECRET=your_production_jwt_secret

# AI Services
GOOGLE_AI_API_KEY=your_production_google_ai_key

# App Configuration
NODE_ENV=production
NEXT_PUBLIC_BASE_URL=https://your-domain.com
```

### Security Features
- **CSP Headers**: Content Security Policy
- **Rate Limiting**: API request throttling
- **Input Validation**: Comprehensive data validation
- **Error Handling**: Graceful error management

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch
```

## 📈 Performance

- **Optimized Build**: Next.js optimization
- **Image Optimization**: Automatic image compression
- **Code Splitting**: Dynamic imports
- **Caching**: Strategic caching strategies

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check the documentation
- Review the code examples

## 🔄 Updates

Stay updated with the latest features and improvements by:
- Watching the repository
- Following the release notes
- Checking the changelog

---

**Built with ❤️ for the developer community**
