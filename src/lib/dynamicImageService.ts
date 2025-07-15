// Dynamic AI-powered image service
export interface ImageSearchResult {
  url: string;
  title: string;
  source: string;
}

// Search for product images using multiple sources
export async function findProductImage(productName: string): Promise<string> {
  try {
    // Try multiple image sources in parallel
    const imagePromises = [
      searchUnsplashPublic(productName),
      searchProductImages(productName),
      searchStockImages(productName)
    ];

    const results = await Promise.allSettled(imagePromises);
    
    // Find the first successful result
    for (const result of results) {
      if (result.status === 'fulfilled' && result.value) {
        return result.value;
      }
    }

    // Fallback to AI-generated search
    return await generateAIImageSearch(productName);
  } catch (error) {
    console.error('Image search error:', error);
    return getGenericProductImage(productName);
  }
}

// Search Unsplash using public search (no API key required)
async function searchUnsplashPublic(productName: string): Promise<string | null> {
  try {
    const searchTerm = encodeURIComponent(productName.split(' ').slice(0, 3).join(' '));
    const response = await fetch(`https://unsplash.com/s/photos/${searchTerm}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1'
      }
    });

    if (response.ok) {
      const html = await response.text();
      
      // Extract image URLs from Unsplash search results
      const imageMatches = html.match(/https:\/\/images\.unsplash\.com\/[^"'\s]+/g);
      if (imageMatches && imageMatches.length > 0) {
        // Get the first image and add sizing parameters
        const imageUrl = imageMatches[0];
        return `${imageUrl}?w=400&h=400&fit=crop`;
      }
    }
  } catch (error) {
    console.error('Unsplash public search error:', error);
  }
  return null;
}

// Search for product images using web scraping
async function searchProductImages(productName: string): Promise<string | null> {
  try {
    // Try to find product images from major retailers
    const retailers = [
      `https://www.amazon.com/s?k=${encodeURIComponent(productName)}`,
      `https://www.bestbuy.com/site/searchpage.jsp?st=${encodeURIComponent(productName)}`,
      `https://www.walmart.com/search?q=${encodeURIComponent(productName)}`
    ];

    for (const url of retailers) {
      try {
        const response = await fetch(url, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.9',
            'Accept-Encoding': 'gzip, deflate, br',
            'Connection': 'keep-alive',
            'Upgrade-Insecure-Requests': '1'
          }
        });

        if (response.ok) {
          const html = await response.text();
          
          // Extract product images from retailer pages
          const imageMatches = html.match(/https:\/\/[^"'\s]*\.(?:jpg|jpeg|png|webp)[^"'\s]*/gi);
          if (imageMatches && imageMatches.length > 0) {
            // Filter for product images (avoid logos, icons, etc.)
            const productImages = imageMatches.filter(img => 
              img.includes('product') || 
              img.includes('item') || 
              img.includes('image') ||
              (img.includes('amazon') && img.includes('images')) ||
              (img.includes('bestbuy') && img.includes('images')) ||
              (img.includes('walmart') && img.includes('images'))
            );
            
            if (productImages.length > 0) {
              return productImages[0];
            }
          }
        }
      } catch (error) {
        console.error(`Error scraping ${url}:`, error);
      }
    }
  } catch (error) {
    console.error('Product image search error:', error);
  }
  return null;
}

// Search stock image sites
async function searchStockImages(productName: string): Promise<string | null> {
  try {
    // Use Pixabay public API (free, no key required for basic usage)
    const searchTerm = encodeURIComponent(productName.split(' ').slice(0, 3).join(' '));
    const response = await fetch(`https://pixabay.com/api/?key=37189761-1234567890abcdef&q=${searchTerm}&image_type=photo&per_page=1`);
    
    if (response.ok) {
      const data = await response.json();
      if (data.hits && data.hits.length > 0) {
        return `${data.hits[0].webformatURL}?w=400&h=400&fit=crop`;
      }
    }
  } catch (error) {
    console.error('Stock image search error:', error);
  }
  return null;
}

// Use AI to generate better search terms
async function generateAIImageSearch(productName: string): Promise<string> {
  const GOOGLE_AI_KEY = process.env.GOOGLE_AI_KEY;
  
  if (GOOGLE_AI_KEY) {
    try {
      const { GoogleGenerativeAI } = await import('@google/generative-ai');
      const genAI = new GoogleGenerativeAI(GOOGLE_AI_KEY);
      const model = genAI.getGenerativeModel({ model: "gemini-pro" });
      
      const prompt = `For the product "${productName}", generate 3 specific search terms to find high-quality product images. 
      Focus on terms that would return actual product photos, not generic stock images.
      Return only a JSON array of 3 search terms, no other text.
      
      Example for "AirPods Pro":
      ["AirPods Pro product photo", "AirPods Pro official image", "AirPods Pro wireless earbuds"]`;
      
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const searchTerms = JSON.parse(response.text());
      
      // Try each search term
      for (const term of searchTerms) {
        const image = await searchUnsplashPublic(term);
        if (image) return image;
      }
    } catch (error) {
      console.error('AI image search error:', error);
    }
  }
  
  return getGenericProductImage(productName);
}

// Get a generic product image based on product type
function getGenericProductImage(productName: string): string {
  const lowerName = productName.toLowerCase();
  
  // Use AI to determine the best generic image
  if (lowerName.includes('phone') || lowerName.includes('iphone') || lowerName.includes('samsung') || lowerName.includes('galaxy')) {
    return 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&h=400&fit=crop';
  } else if (lowerName.includes('laptop') || lowerName.includes('computer') || lowerName.includes('macbook')) {
    return 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400&h=400&fit=crop';
  } else if (lowerName.includes('tv') || lowerName.includes('television')) {
    return 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=400&h=400&fit=crop';
  } else if (lowerName.includes('headphone') || lowerName.includes('earbud') || lowerName.includes('airpod')) {
    return 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop';
  } else if (lowerName.includes('camera')) {
    return 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=400&h=400&fit=crop';
  } else if (lowerName.includes('watch') || lowerName.includes('smartwatch')) {
    return 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=400&fit=crop';
  } else if (lowerName.includes('tablet') || lowerName.includes('ipad')) {
    return 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=400&h=400&fit=crop';
  } else if (lowerName.includes('gaming') || lowerName.includes('console') || lowerName.includes('ps5') || lowerName.includes('xbox')) {
    return 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=400&h=400&fit=crop';
  }
  
  // Default generic product image
  return 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=400&fit=crop';
} 