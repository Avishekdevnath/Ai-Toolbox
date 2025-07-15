# Image APIs Setup Guide

The dynamic image service uses multiple APIs to find real product images. Here's how to set them up:

## Required Environment Variables

Add these to your `.env.local` file:

```env
# Google AI (for generating search terms)
GOOGLE_AI_KEY=your_google_ai_key_here

# Image Search APIs (optional but recommended)
UNSPLASH_ACCESS_KEY=your_unsplash_access_key
PEXELS_API_KEY=your_pexels_api_key
SERPAPI_KEY=your_serpapi_key
BING_API_KEY=your_bing_api_key
```

## API Setup Instructions

### 1. Google AI (Required)
- Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
- Create a new API key
- Add to `GOOGLE_AI_KEY`

### 2. Unsplash (Optional)
- Go to [Unsplash Developers](https://unsplash.com/developers)
- Create a new application
- Get your Access Key
- Add to `UNSPLASH_ACCESS_KEY`

### 3. Pexels (Optional)
- Go to [Pexels API](https://www.pexels.com/api/)
- Sign up and get your API key
- Add to `PEXELS_API_KEY`

### 4. SerpAPI (Optional)
- Go to [SerpAPI](https://serpapi.com/)
- Sign up and get your API key
- Add to `SERPAPI_KEY`

### 5. Bing Image Search (Optional)
- Go to [Bing Web Search API](https://www.microsoft.com/en-us/bing/apis/bing-image-search-api)
- Create a resource and get your API key
- Add to `BING_API_KEY`

## How It Works

1. **Primary**: Tries to extract real product images from the product URL using web crawling
2. **Secondary**: Uses multiple image search APIs to find high-quality product photos
3. **AI Enhancement**: Uses Google AI to generate better search terms for finding product images
4. **Fallback**: Uses intelligent category-based generic images

## Benefits

- **Dynamic**: No static image mappings
- **Real Images**: Finds actual product photos when possible
- **AI-Powered**: Uses AI to improve search accuracy
- **Multiple Sources**: Tries multiple APIs for better results
- **Intelligent Fallbacks**: Uses product type detection for generic images

## Cost Considerations

- **Google AI**: ~$0.001 per request
- **Unsplash**: Free tier available (50 requests/hour)
- **Pexels**: Free tier available (200 requests/hour)
- **SerpAPI**: Paid service
- **Bing**: Free tier available (1000 requests/month)

The service gracefully handles missing API keys and falls back to free alternatives. 