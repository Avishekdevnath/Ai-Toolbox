# 🗄️ MongoDB Atlas Setup Guide

This guide will help you set up MongoDB Atlas (cloud database) for the AI Toolbox project.

## 🚀 Quick Setup (5 minutes)

### Step 1: Create MongoDB Atlas Account

1. **Go to MongoDB Atlas**: https://www.mongodb.com/atlas
2. **Click "Try Free"** or "Sign Up"
3. **Create your account** (free tier available)

### Step 2: Create a Cluster

1. **Choose "FREE" tier** (M0 Sandbox)
2. **Select your preferred cloud provider** (AWS, Google Cloud, or Azure)
3. **Choose a region** (pick one close to your users)
4. **Click "Create Cluster"**

### Step 3: Set Up Database Access

1. **Go to "Database Access"** in the left sidebar
2. **Click "Add New Database User"**
3. **Choose "Password" authentication**
4. **Create a username and password** (save these!)
5. **Set privileges to "Read and write to any database"**
6. **Click "Add User"**

### Step 4: Set Up Network Access

1. **Go to "Network Access"** in the left sidebar
2. **Click "Add IP Address"**
3. **For development**: Click "Allow Access from Anywhere" (0.0.0.0/0)
4. **For production**: Add your specific IP addresses
5. **Click "Confirm"**

### Step 5: Get Your Connection String

1. **Go back to "Database"** in the left sidebar
2. **Click "Connect"** on your cluster
3. **Choose "Connect your application"**
4. **Copy the connection string**

## 🔧 Environment Configuration

### Create `.env.local` file in your project root:

```env
# MongoDB Atlas Configuration
MONGODB_URI=mongodb+srv://yourusername:yourpassword@cluster.mongodb.net/ai-toolbox?retryWrites=true&w=majority

# NextAuth Configuration
NEXTAUTH_SECRET=your-super-secret-key-change-this-in-production-12345
NEXTAUTH_URL=http://localhost:3001

# Google AI Configuration (Optional)
GOOGLE_AI_API_KEY=your_google_ai_api_key_here

# Application Configuration
APP_NAME="AI Toolbox"
APP_VERSION="1.0.0"
NEXT_PUBLIC_BASE_URL=http://localhost:3001
```

### Replace the placeholders:

- `yourusername`: The username you created in Step 3
- `yourpassword`: The password you created in Step 3
- `cluster.mongodb.net`: Your actual cluster URL (will be different)
- `your-super-secret-key`: Generate a random secret (you can use `openssl rand -base64 32`)

## 🧪 Test Your Connection

1. **Restart your development server**:
   ```bash
   npm run dev
   ```

2. **Check the console** for:
   ```
   ✅ Connected to MongoDB Atlas successfully
   ✅ Database collections initialized with indexes
   ```

3. **Test a feature** that uses the database (like URL Shortener)

## 🔒 Security Best Practices

### For Development:
- Use "Allow Access from Anywhere" (0.0.0.0/0)
- Use simple passwords (but still secure)
- Keep your `.env.local` file in `.gitignore`

### For Production:
- Restrict IP access to your server's IP
- Use strong, unique passwords
- Enable MongoDB Atlas security features
- Use environment variables in your hosting platform

## 🆘 Troubleshooting

### Connection Issues:

1. **"Authentication failed"**
   - Check your username and password
   - Make sure the user has proper permissions

2. **"Network access denied"**
   - Add your IP address to Network Access
   - Use "Allow Access from Anywhere" for testing

3. **"Connection timeout"**
   - Check your internet connection
   - Verify the connection string format
   - Try a different region

### Common Errors:

```bash
# ❌ Wrong format
MONGODB_URI=mongodb://localhost:27017/ai-toolbox

# ✅ Correct format
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/ai-toolbox?retryWrites=true&w=majority
```

## 📊 MongoDB Atlas Features

### Free Tier Includes:
- **512MB storage**
- **Shared RAM**
- **Up to 500 connections**
- **Basic monitoring**
- **Automatic backups**

### Collections Created:
- `shortened_urls` - URL shortener data
- `swot-analyses` - SWOT analysis results
- `resumes` - Resume analysis data
- `analyses` - General analysis data

## 🚀 Next Steps

1. **Set up your `.env.local` file** with the connection string
2. **Restart your development server**
3. **Test the application** - database features should work
4. **Add your Google AI API key** for AI features

## 📞 Support

If you encounter issues:
1. Check the MongoDB Atlas documentation
2. Verify your connection string format
3. Test with MongoDB Compass (GUI tool)
4. Check the application console for specific error messages

---

**Need help?** The MongoDB Atlas documentation is excellent: https://docs.atlas.mongodb.com/ 