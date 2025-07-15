# Product Price Tracker System

A comprehensive AI-powered price tracking system that monitors product prices across multiple retailers and provides intelligent price alerts.

## 🚀 Features

### Core Functionality
- **Multi-Source Price Tracking**: Search across Amazon, Walmart, Best Buy, and other major retailers
- **AI-Powered Product Recognition**: Uses Google Gemini AI to identify products and generate realistic pricing
- **Price History Visualization**: Interactive charts showing 7-day price trends
- **Price Comparison**: Side-by-side comparison of prices from different sources
- **Smart Price Alerts**: Set target prices and get notified when prices drop
- **Recently Tracked Products**: Keep track of your search history

### Advanced Features
- **Real-time Price Updates**: Live price checking with timestamps
- **Price Trend Analysis**: Visual indicators showing price increases/decreases
- **Product Information**: Ratings, reviews, availability status
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Dark Mode Support**: Full dark/light theme compatibility

## 🏗️ Architecture

### Frontend Components
```
src/components/tools/ProductPriceTrackerTool.tsx  # Main UI component
src/utils/priceTrackerUtils.ts                    # Utility functions
```

### Backend API
```
src/app/api/price-tracker/route.ts                # Main API endpoint
```

### Key Interfaces
```typescript
interface PriceSource {
  name: string;        // Retailer name (Amazon, Walmart, etc.)
  url: string;         // Product URL on retailer site
  price: number;       // Current price
  currency: string;    // Currency code
  lastChecked: string; // Timestamp of last check
}

interface ProductData {
  title: string;           // Product name
  price: number;           // Average/current price
  currency: string;        // Currency
  image: string;           // Product image URL
  url: string;             // Product page URL
  sources: PriceSource[];  // Price sources
  priceHistory: string[];  // 7-day price history
  lastChecked: string;     // Last update timestamp
  availability: string;    // Stock status
  rating?: number;         // Product rating
  reviews?: number;        // Number of reviews
}
```

## 🔧 Implementation Details

### API Endpoint (`/api/price-tracker`)
- **Method**: POST
- **Input**: `{ input: string }` (product name or URL)
- **Output**: `ProductData` object with comprehensive product information

### Price Sources
Currently implements mock APIs for:
- **Amazon**: Simulated price range $50-$1050
- **Walmart**: Simulated price range $40-$840  
- **Best Buy**: Simulated price range $60-$1260

### AI Integration
- Uses Google Gemini AI for product identification
- Generates realistic product titles, prices, and images
- Fallback to static data if AI key is not configured
- Enhanced prompts for better product recognition

### Price History Generation
- Realistic price variations (±5% with trend components)
- 7-day historical data for trend analysis
- Visual chart representation with hover tooltips

## 🎨 UI/UX Features

### Search Interface
- Clean, modern search bar with placeholder examples
- Enter key support for quick searching
- Loading states with spinner animation
- Input validation with helpful error messages

### Results Display
- **Product Header**: Image, title, availability, ratings
- **Price Information**: Current price with trend indicators
- **Price Comparison**: Grid layout showing all sources
- **Price History**: Interactive bar chart
- **Actions**: View product, copy info, set alerts

### Price Alert System
- Target price input with validation
- Visual confirmation when alerts are set
- Persistent alert storage (ready for database integration)

### Responsive Design
- Mobile-first approach
- Collapsible sidebar navigation
- Touch-friendly interface elements
- Optimized for all screen sizes

## 🔮 Future Enhancements

### Real Price APIs Integration
```typescript
// Planned integrations
- Amazon Product Advertising API
- Walmart Open API
- Best Buy API
- Target API
- eBay Finding API
```

### Database Integration
```typescript
// MongoDB schema for persistent storage
interface TrackedProduct {
  userId: string;
  productId: string;
  title: string;
  targetPrice: number;
  currentPrice: number;
  priceHistory: PricePoint[];
  alerts: PriceAlert[];
  createdAt: Date;
  updatedAt: Date;
}
```

### Advanced Features
- **Email Notifications**: Price drop alerts via email
- **Push Notifications**: Real-time browser notifications
- **Price Prediction**: ML-based price forecasting
- **Wishlist Management**: Save products for tracking
- **Price History Export**: CSV/PDF reports
- **Mobile App**: React Native companion app

### Enhanced AI Features
- **Product Image Recognition**: Extract product info from images
- **Price Optimization**: Suggest best time to buy
- **Competitor Analysis**: Compare with similar products
- **Market Trends**: Industry-wide price analysis

## 🛠️ Technical Stack

### Frontend
- **React 18** with TypeScript
- **Next.js 14** App Router
- **Tailwind CSS** for styling
- **Custom hooks** for state management

### Backend
- **Next.js API Routes**
- **Google Gemini AI** for product intelligence
- **TypeScript** for type safety

### Utilities
- **Price formatting** with Intl.NumberFormat
- **Date/time utilities** for relative timestamps
- **Validation functions** for input sanitization
- **Chart generation** for price history visualization

## 📊 Performance Optimizations

### API Optimizations
- Concurrent price source queries using `Promise.allSettled`
- Graceful error handling for failed API calls
- Caching layer ready for implementation
- Rate limiting protection

### Frontend Optimizations
- Debounced search input
- Lazy loading for images
- Memoized calculations for price changes
- Efficient re-rendering with React hooks

## 🔒 Security Considerations

### Input Validation
- Sanitized product names and URLs
- Rate limiting on API endpoints
- XSS protection for user inputs
- CORS configuration for external APIs

### Data Privacy
- No personal data collection
- Anonymous price tracking
- Secure API key management
- GDPR compliance ready

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- Google Gemini AI API key (optional)

### Environment Variables
```env
GOOGLE_AI_KEY=your_gemini_api_key_here
```

### Installation
```bash
npm install
npm run dev
```

### Usage
1. Navigate to `/tools/price-tracker`
2. Enter a product name or URL
3. Click "Track Price" to get results
4. Set price alerts for future notifications
5. View price history and comparisons

## 📈 Analytics & Monitoring

### Metrics to Track
- Search volume by product category
- Price change frequency
- User engagement with alerts
- API response times
- Error rates by source

### Monitoring Setup
- API health checks
- Price source availability
- AI response quality
- User feedback collection

## 🤝 Contributing

### Development Guidelines
- Follow TypeScript best practices
- Use functional components with hooks
- Implement proper error boundaries
- Add comprehensive unit tests
- Document new features

### Code Structure
```
src/
├── components/tools/
│   └── ProductPriceTrackerTool.tsx
├── utils/
│   └── priceTrackerUtils.ts
├── app/api/price-tracker/
│   └── route.ts
└── types/
    └── priceTracker.ts (future)
```

## 📝 License

This project is part of the AI Toolbox and follows the same licensing terms.

---

**Note**: This is a demonstration system with mock price APIs. For production use, integrate with real retailer APIs and implement proper data persistence. 