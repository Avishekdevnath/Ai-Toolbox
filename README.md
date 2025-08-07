# AI Toolbox - Comprehensive AI Tools Platform

## 🎉 **Project Status: Production Ready**

A comprehensive AI tools platform with advanced usage history tracking, professional user dashboard, and robust admin management capabilities.

---

## 📊 **Features**

### **🤖 AI Tools**
- **SWOT Analysis**: AI-powered business analysis
- **Finance Advisor**: Comprehensive financial planning
- **Diet Planner**: Personalized nutrition recommendations
- **URL Shortener**: Link management and analytics
- **QR Generator**: QR code creation and management
- **Quote Generator**: AI-powered quote generation
- **Unit Converter**: Multi-unit conversion tool
- **Password Generator**: Secure password creation
- **Price Tracker**: Product price monitoring
- **Resume Reviewer**: AI-powered resume analysis
- **Interview AI**: Mock interview practice
- **Word Counter**: Text analysis tool

### **📈 Usage History System**
- **Complete Tracking**: All analysis results automatically saved
- **Advanced Filtering**: Search, type, status, and date range filters
- **Export Functionality**: JSON and CSV export capabilities
- **Detailed Analytics**: Performance metrics and usage statistics
- **Data Management**: View, delete, and manage analysis history

### **👤 User Dashboard**
- **Real-time Analytics**: Live usage statistics and insights
- **Tools Management**: Personal tool usage tracking
- **History Management**: Complete analysis history interface
- **Professional UI**: Modern, responsive design
- **Export Capabilities**: Download personal data

### **🔧 Admin Dashboard**
- **Dual Authentication**: Custom admin auth + Clerk integration
- **User Management**: Complete user control and analytics
- **System Monitoring**: Real-time health and performance
- **Role-based Access**: Secure permission system
- **Advanced Analytics**: Comprehensive system statistics

---

## 🚀 **Quick Start**

### **Prerequisites**
- Node.js 18+ 
- MongoDB Atlas account
- Clerk account for authentication
- Gemini API key for AI features

### **Installation**

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd ai-toolbox
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   cp .env.example .env.local
   ```
   
   Configure the following environment variables:
   ```env
   # Database
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/ai-toolbox
   DB_NAME=ai-toolbox
   
   # Authentication (Clerk)
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
   CLERK_SECRET_KEY=sk_test_...
   
   # AI Services (Gemini)
   GEMINI_API_KEY=your_gemini_api_key
   
   # NextAuth
   NEXTAUTH_SECRET=your_nextauth_secret
   NEXTAUTH_URL=http://localhost:3000
   ```

4. **Database Setup**
   ```bash
   # Seed admin users
   node scripts/seed-admin-user.js
   
   # Seed initial data
   node scripts/seed-admin-models.js
   ```

5. **Start Development Server**
   ```bash
   npm run dev
   ```

6. **Access the Application**
   - **Main Site**: http://localhost:3000
   - **Admin Dashboard**: http://localhost:3000/admin
   - **User Dashboard**: http://localhost:3000/dashboard

---

## 🏗️ **Architecture**

### **Frontend**
- **Next.js 15**: App Router with Server and Client Components
- **React 18**: Modern React with hooks and context
- **TypeScript**: Full type safety throughout
- **Tailwind CSS**: Utility-first styling
- **Lucide React**: Icon library
- **Framer Motion**: Smooth animations

### **Backend**
- **Next.js API Routes**: RESTful API endpoints
- **MongoDB**: Native MongoDB driver for database operations
- **Mongoose**: ODM for model definitions and validation
- **JWT**: Custom admin authentication
- **Clerk**: User authentication and management

### **Database Schema**
```
users/
├── profile (Clerk-managed)
├── preferences
└── settings

adminusers/
├── email, password (hashed)
├── role (super_admin, admin, moderator)
├── permissions
└── session management

useranalysishistories/
├── userId, clerkId
├── analysisType, toolSlug
├── inputData, result
├── metadata, status
└── timestamps

toolusages/
├── userId, toolSlug
├── usageType, metadata
└── timestamps

adminactivities/
├── adminId, action
├── details, metadata
└── timestamps
```

---

## 📁 **Project Structure**

```
ai-toolbox/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── admin/             # Admin dashboard pages
│   │   ├── dashboard/         # User dashboard pages
│   │   ├── tools/            # AI tools pages
│   │   └── api/              # API routes
│   ├── components/            # React components
│   │   ├── admin/            # Admin components
│   │   ├── dashboard/        # Dashboard components
│   │   ├── tools/            # Tool components
│   │   └── ui/               # UI components
│   ├── lib/                  # Utility libraries
│   ├── models/               # Database models
│   └── schemas/              # Validation schemas
├── scripts/                  # Database scripts
├── public/                   # Static assets
└── docs/                     # Documentation
```

---

## 🔧 **API Endpoints**

### **User APIs**
- `GET /api/user/stats` - User statistics
- `GET /api/user/history` - Analysis history
- `POST /api/user/history/save` - Save analysis
- `DELETE /api/user/history` - Delete analysis
- `GET /api/user/history/export` - Export data

### **Admin APIs**
- `GET /api/admin/dashboard/stats` - Admin statistics
- `GET /api/admin/users` - User management
- `GET /api/admin/tools` - Tool management
- `POST /api/admin/auth/login` - Admin login
- `POST /api/admin/auth/logout` - Admin logout

### **System APIs**
- `GET /api/system/health` - System health check
- `POST /api/system/health` - System maintenance

### **Analysis APIs**
- `POST /api/analyze/swot` - SWOT analysis
- `POST /api/analyze/finance` - Financial analysis
- `POST /api/analyze/diet` - Diet planning

---

## 🔒 **Security Features**

### **Authentication**
- **Clerk Integration**: Secure user authentication
- **Custom Admin Auth**: JWT-based admin authentication
- **Role-based Access**: Super admin, admin, moderator roles
- **Session Management**: Secure session handling

### **Data Protection**
- **Input Validation**: Comprehensive validation throughout
- **SQL Injection Protection**: Parameterized queries
- **XSS Protection**: Content Security Policy
- **CSRF Protection**: Cross-site request forgery protection

### **Privacy**
- **Data Encryption**: Sensitive data encryption
- **User Consent**: Clear data usage policies
- **Data Export**: User data export capabilities
- **Data Deletion**: User data deletion options

---

## 📊 **Monitoring & Analytics**

### **System Health**
- **Real-time Monitoring**: System health checks
- **Database Monitoring**: Connection and performance
- **API Monitoring**: Response times and errors
- **Error Tracking**: Comprehensive error logging

### **User Analytics**
- **Usage Tracking**: Tool usage statistics
- **Performance Metrics**: Processing times and success rates
- **User Behavior**: Usage patterns and preferences
- **Engagement Metrics**: User activity and retention

---

## 🚀 **Deployment**

### **Production Deployment**

1. **Environment Setup**
   ```bash
   # Set production environment variables
   NODE_ENV=production
   MONGODB_URI=your_production_mongodb_uri
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_production_clerk_key
   CLERK_SECRET_KEY=your_production_clerk_secret
   ```

2. **Build Application**
   ```bash
   npm run build
   ```

3. **Start Production Server**
   ```bash
   npm start
   ```

### **Deployment Validation**
```bash
# Run production validation
node scripts/deploy-production.js
```

### **Platforms**
- **Vercel**: Recommended for Next.js applications
- **Netlify**: Alternative deployment platform
- **AWS**: Enterprise deployment option
- **Docker**: Containerized deployment

---

## 🧪 **Testing**

### **API Testing**
```bash
# Test API endpoints
curl http://localhost:3000/api/system/health
curl http://localhost:3000/api/user/stats
```

### **Component Testing**
```bash
# Run component tests
npm run test

# Run tests with coverage
npm run test:coverage
```

### **E2E Testing**
```bash
# Run end-to-end tests
npm run test:e2e
```

---

## 📈 **Performance Optimization**

### **Database Optimization**
- **Indexing**: Optimized database indexes
- **Query Optimization**: Efficient database queries
- **Connection Pooling**: Database connection management
- **Caching**: Smart caching strategies

### **Frontend Optimization**
- **Code Splitting**: Dynamic imports and lazy loading
- **Image Optimization**: Next.js image optimization
- **Bundle Optimization**: Efficient bundle sizes
- **Caching**: Browser and API caching

---

## 🤝 **Contributing**

### **Development Setup**
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new features
5. Submit a pull request

### **Code Standards**
- **TypeScript**: Full type safety
- **ESLint**: Code linting and formatting
- **Prettier**: Code formatting
- **Conventional Commits**: Commit message standards

---

## 📄 **License**

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🆘 **Support**

### **Documentation**
- [API Documentation](docs/api.md)
- [Component Documentation](docs/components.md)
- [Deployment Guide](docs/deployment.md)
- [Troubleshooting](docs/troubleshooting.md)

### **Issues**
- [GitHub Issues](https://github.com/your-repo/ai-toolbox/issues)
- [Feature Requests](https://github.com/your-repo/ai-toolbox/issues/new)

### **Contact**
- **Email**: support@ai-toolbox.com
- **Discord**: [AI Toolbox Community](https://discord.gg/ai-toolbox)

---

## 🎉 **Acknowledgments**

- **Next.js Team**: For the amazing framework
- **Clerk**: For authentication services
- **MongoDB**: For database services
- **Google**: For Gemini AI services
- **Open Source Community**: For all the amazing libraries

---

**Version:** 2.0  
**Last Updated:** January 31, 2025  
**Status:** ✅ **Production Ready**
