import { JSDOM } from 'jsdom';
import { findProductImage } from './dynamicImageService';

export interface CrawledProductData {
  title?: string;
  image?: string;
  price?: number;
  description?: string;
  brand?: string;
  category?: string;
  specifications?: string[];
  availability?: string;
  rating?: number;
  reviews?: number;
}

export async function crawlProductPage(url: string): Promise<CrawledProductData> {
  try {
    // Add timeout to prevent hanging requests
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Accept-Encoding': 'gzip, deflate',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1'
      },
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const html = await response.text();
    
    // Check if we got a valid HTML response
    if (!html.includes('<html') && !html.includes('<body')) {
      throw new Error('Invalid HTML response');
    }

    const dom = new JSDOM(html);
    const document = dom.window.document;

    const productData: CrawledProductData = {};

    // Extract title
    productData.title = extractTitle(document, url);
    
    // Extract image
    let extractedImage = extractImage(document, url);
    if (!extractedImage && productData.title) {
      // Use dynamic image service as fallback
      extractedImage = await findProductImage(productData.title);
    }
    productData.image = extractedImage;
    
    // Extract price
    productData.price = extractPrice(document);
    
    // Extract description
    productData.description = extractDescription(document);
    
    // Extract brand and category
    const { brand, category } = extractBrandAndCategory(document, url);
    productData.brand = brand;
    productData.category = category;
    
    // Extract specifications
    productData.specifications = extractSpecifications(document);
    
    // Extract availability
    productData.availability = extractAvailability(document);
    
    // Extract rating and reviews
    const { rating, reviews } = extractRatingAndReviews(document);
    productData.rating = rating;
    productData.reviews = reviews;

    return productData;
  } catch (error) {
    console.error('Web crawling error:', error);
    return {};
  }
}

function extractTitle(document: Document, url: string): string | undefined {
  // Try multiple selectors for product title
  const selectors = [
    // Amazon
    'h1[data-testid="product-title"]',
    'h1.product-title',
    '#productTitle',
    '.product-title',
    
    // Best Buy
    'h1.heading-5',
    '.sku-title h1',
    
    // Walmart
    'h1[data-testid="product-title"]',
    '.prod-ProductTitle h1',
    
    // Generic
    'h1[class*="title"]',
    'h1[class*="product"]',
    'h1',
    '[data-testid="title"]',
    '.product-name',
    '.product-title',
    'title'
  ];

  for (const selector of selectors) {
    const element = document.querySelector(selector);
    if (element && element.textContent?.trim()) {
      const title = element.textContent.trim();
      // Filter out very short or very long titles
      if (title.length > 3 && title.length < 200) {
        return title;
      }
    }
  }

  // Fallback: extract from URL
  return extractTitleFromURL(url);
}

function extractTitleFromURL(url: string): string | undefined {
  try {
    const urlObj = new URL(url);
    const pathname = urlObj.pathname;
    
    // Extract product name from URL path
    const pathParts = pathname.split('/').filter(part => part.length > 0);
    const lastPart = pathParts[pathParts.length - 1];
    
    if (lastPart && lastPart.length > 3) {
      return decodeURIComponent(lastPart.replace(/[-_]/g, ' '));
    }
  } catch (error) {
    console.error('Error extracting title from URL:', error);
  }
  
  return undefined;
}

function extractImage(document: Document, baseUrl: string): string | undefined {
  // Try multiple selectors for product image
  const selectors = [
    // Amazon
    '#landingImage',
    '#imgBlkFront',
    '.a-dynamic-image',
    'img[data-old-hires]',
    
    // Best Buy
    '.primary-image img',
    '.product-image img',
    
    // Walmart
    '.prod-hero-image img',
    '.product-image img',
    
    // Generic
    'img[data-testid="product-image"]',
    'img[class*="product-image"]',
    'img[class*="main-image"]',
    '.product-image img',
    '.main-image img',
    '[data-testid="image"] img',
    'img[alt*="product"]',
    'img[alt*="main"]',
    'img[alt*="image"]'
  ];

  for (const selector of selectors) {
    const element = document.querySelector(selector) as HTMLImageElement;
    if (element && element.src) {
      const imageUrl = new URL(element.src, baseUrl).href;
      if (imageUrl.startsWith('http') && !imageUrl.includes('placeholder')) {
        return imageUrl;
      }
    }
  }

  // Try to find the largest image on the page
  const allImages = document.querySelectorAll('img');
  let largestImage: HTMLImageElement | null = null;
  let maxSize = 0;

  allImages.forEach((img) => {
    const src = img.src;
    if (src && src.startsWith('http') && !src.includes('placeholder')) {
      const width = img.naturalWidth || parseInt(img.getAttribute('width') || '0');
      const height = img.naturalHeight || parseInt(img.getAttribute('height') || '0');
      const size = width * height;
      
      if (size > maxSize && size > 10000) { // Minimum 100x100 pixels
        maxSize = size;
        largestImage = img;
      }
    }
  });

  if (largestImage) {
    return new URL(largestImage.src, baseUrl).href;
  }

  return undefined;
}

function extractPrice(document: Document): number | undefined {
  // Try multiple selectors for price
  const selectors = [
    // Amazon
    '.a-price-whole',
    '.a-price .a-offscreen',
    '#priceblock_ourprice',
    '#priceblock_dealprice',
    
    // Best Buy
    '.priceView-customer-price span',
    '.priceView-layout-large .priceView-hero-price',
    
    // Walmart
    '.price-characteristic',
    '.prod-PriceHero .price-characteristic',
    
    // Generic
    '[data-testid="price"]',
    '.price',
    '.product-price',
    '[class*="price"]',
    'span[class*="price"]',
    '.current-price',
    '.sale-price',
    '.price-current'
  ];

  for (const selector of selectors) {
    const element = document.querySelector(selector);
    if (element && element.textContent) {
      const priceText = element.textContent.trim();
      const price = parsePrice(priceText);
      if (price && price > 0) return price;
    }
  }

  return undefined;
}

function parsePrice(priceText: string): number | undefined {
  // Remove currency symbols and extract number
  const cleaned = priceText.replace(/[^\d.,]/g, '');
  const price = parseFloat(cleaned.replace(',', ''));
  return isNaN(price) ? undefined : price;
}

function extractDescription(document: Document): string | undefined {
  // Try multiple selectors for description
  const selectors = [
    '[data-testid="description"]',
    '.description',
    '.product-description',
    '[class*="description"]',
    '.product-details',
    '.product-info'
  ];

  for (const selector of selectors) {
    const element = document.querySelector(selector);
    if (element && element.textContent?.trim()) {
      const text = element.textContent.trim();
      if (text.length > 20 && text.length < 500) {
        return text;
      }
    }
  }

  return undefined;
}

function extractBrandAndCategory(document: Document, url: string): { brand?: string; category?: string } {
  const urlObj = new URL(url);
  const hostname = urlObj.hostname.toLowerCase();
  
  // Extract brand from URL or page
  let brand: string | undefined;
  let category: string | undefined;

  // Brand detection from URL
  if (hostname.includes('apple')) brand = 'Apple';
  else if (hostname.includes('samsung')) brand = 'Samsung';
  else if (hostname.includes('sony')) brand = 'Sony';
  else if (hostname.includes('lg')) brand = 'LG';
  else if (hostname.includes('google')) brand = 'Google';
  else if (hostname.includes('microsoft')) brand = 'Microsoft';

  // Category detection from URL path
  const pathname = urlObj.pathname.toLowerCase();
  if (pathname.includes('iphone') || pathname.includes('phone')) category = 'Smartphone';
  else if (pathname.includes('macbook') || pathname.includes('laptop')) category = 'Laptop';
  else if (pathname.includes('tv') || pathname.includes('television')) category = 'TV';
  else if (pathname.includes('headphone') || pathname.includes('earbud')) category = 'Headphones';
  else if (pathname.includes('watch') || pathname.includes('smartwatch')) category = 'Smartwatch';
  else if (pathname.includes('tablet') || pathname.includes('ipad')) category = 'Tablet';
  else if (pathname.includes('camera')) category = 'Camera';
  else if (pathname.includes('console') || pathname.includes('gaming')) category = 'Gaming';

  return { brand, category };
}

function extractSpecifications(document: Document): string[] {
  const specs: string[] = [];
  
  // Try to find specification lists
  const specSelectors = [
    '.specifications li',
    '.specs li',
    '[data-testid="specifications"] li',
    '.product-specs li',
    '.features li',
    '.highlights li'
  ];

  for (const selector of specSelectors) {
    const elements = document.querySelectorAll(selector);
    if (elements.length > 0) {
      elements.forEach((element, index) => {
        if (index < 5 && element.textContent?.trim()) {
          specs.push(element.textContent.trim());
        }
      });
      break;
    }
  }

  return specs;
}

function extractAvailability(document: Document): string | undefined {
  // Try to find availability information
  const selectors = [
    '[data-testid="availability"]',
    '.availability',
    '.stock-status',
    '[class*="stock"]',
    '[class*="availability"]'
  ];

  for (const selector of selectors) {
    const element = document.querySelector(selector);
    if (element && element.textContent?.trim()) {
      const text = element.textContent.trim().toLowerCase();
      if (text.includes('in stock')) return 'In Stock';
      if (text.includes('out of stock')) return 'Out of Stock';
      if (text.includes('available')) return 'In Stock';
    }
  }

  return 'In Stock'; // Default
}

function extractRatingAndReviews(document: Document): { rating?: number; reviews?: number } {
  // Try to find rating and review information
  const ratingSelectors = [
    '[data-testid="rating"]',
    '.rating',
    '.product-rating',
    '[class*="rating"]',
    '.stars'
  ];

  const reviewSelectors = [
    '[data-testid="reviews"]',
    '.reviews',
    '.product-reviews',
    '[class*="review"]'
  ];

  let rating: number | undefined;
  let reviews: number | undefined;

  // Extract rating
  for (const selector of ratingSelectors) {
    const element = document.querySelector(selector);
    if (element && element.textContent) {
      const ratingText = element.textContent.trim();
      const ratingMatch = ratingText.match(/(\d+(?:\.\d+)?)/);
      if (ratingMatch) {
        rating = parseFloat(ratingMatch[1]);
        break;
      }
    }
  }

  // Extract review count
  for (const selector of reviewSelectors) {
    const element = document.querySelector(selector);
    if (element && element.textContent) {
      const reviewText = element.textContent.trim();
      const reviewMatch = reviewText.match(/(\d+(?:,\d+)*)/);
      if (reviewMatch) {
        reviews = parseInt(reviewMatch[1].replace(/,/g, ''));
        break;
      }
    }
  }

  return { rating, reviews };
} 