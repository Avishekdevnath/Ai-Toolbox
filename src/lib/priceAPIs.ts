// Simple price estimation system - no API keys required
export interface PriceSource {
  name: string;
  price: number;
  url: string;
  inStock: boolean;
  rating?: number;
  reviewCount?: number;
}

export interface ProductInfo {
  name: string;
  brand: string;
  category: string;
  description: string;
  specifications: string[];
  imageUrl: string;
  prices: PriceSource[];
  averagePrice: number;
  lowestPrice: number;
  highestPrice: number;
}

// Product category price ranges (realistic market prices)
const PRODUCT_PRICE_RANGES = {
  'smartphone': { min: 200, max: 1500, base: 800 },
  'phone': { min: 200, max: 1500, base: 800 },
  'iphone': { min: 400, max: 1500, base: 1000 },
  'samsung': { min: 300, max: 1400, base: 900 },
  'laptop': { min: 300, max: 3000, base: 1200 },
  'computer': { min: 300, max: 3000, base: 1200 },
  'macbook': { min: 1000, max: 3500, base: 2000 },
  'headphones': { min: 50, max: 500, base: 200 },
  'airpods': { min: 150, max: 600, base: 250 },
  'earbuds': { min: 50, max: 400, base: 150 },
  'tablet': { min: 200, max: 1200, base: 600 },
  'ipad': { min: 300, max: 1500, base: 800 },
  'camera': { min: 100, max: 2000, base: 500 },
  'tv': { min: 200, max: 3000, base: 800 },
  'monitor': { min: 100, max: 1000, base: 300 },
  'gaming': { min: 200, max: 800, base: 400 },
  'console': { min: 300, max: 600, base: 450 },
  'playstation': { min: 400, max: 600, base: 500 },
  'xbox': { min: 300, max: 600, base: 450 },
  'nintendo': { min: 200, max: 400, base: 300 },
  'watch': { min: 100, max: 1000, base: 300 },
  'apple watch': { min: 200, max: 800, base: 400 },
  'fitness': { min: 50, max: 300, base: 150 },
  'speaker': { min: 50, max: 500, base: 200 },
  'homepod': { min: 200, max: 400, base: 300 },
  'echo': { min: 50, max: 200, base: 100 },
  'router': { min: 50, max: 400, base: 150 },
  'printer': { min: 50, max: 500, base: 200 },
  'keyboard': { min: 20, max: 300, base: 100 },
  'mouse': { min: 10, max: 150, base: 50 },
  'default': { min: 50, max: 500, base: 200 }
};

// Major retailers for price sources
const RETAILERS = [
  { name: 'Amazon', url: 'https://amazon.com' },
  { name: 'Best Buy', url: 'https://bestbuy.com' },
  { name: 'Walmart', url: 'https://walmart.com' },
  { name: 'Target', url: 'https://target.com' },
  { name: 'Apple Store', url: 'https://apple.com' },
  { name: 'Samsung', url: 'https://samsung.com' },
  { name: 'Microsoft Store', url: 'https://microsoft.com' },
  { name: 'Newegg', url: 'https://newegg.com' },
  { name: 'B&H Photo', url: 'https://bhphotovideo.com' },
  { name: 'Adorama', url: 'https://adorama.com' },
  { name: 'Micro Center', url: 'https://microcenter.com' },
  { name: 'Fry\'s Electronics', url: 'https://frys.com' },
  { name: 'Costco', url: 'https://costco.com' },
  { name: 'Sam\'s Club', url: 'https://samsclub.com' },
  { name: 'Office Depot', url: 'https://officedepot.com' },
  { name: 'Staples', url: 'https://staples.com' },
  { name: 'GameStop', url: 'https://gamestop.com' },
  { name: 'Etsy', url: 'https://etsy.com' },
  { name: 'eBay', url: 'https://ebay.com' },
  { name: 'Facebook Marketplace', url: 'https://facebook.com/marketplace' }
];

// Generate realistic price for a product
function generateRealisticPrice(productName: string, category: string): number {
  const searchTerm = (productName + ' ' + category).toLowerCase();
  
  // Find matching price range
  let priceRange = PRODUCT_PRICE_RANGES.default;
  for (const [key, range] of Object.entries(PRODUCT_PRICE_RANGES)) {
    if (searchTerm.includes(key)) {
      priceRange = range;
      break;
    }
  }
  
  // Generate price with some variation
  const basePrice = priceRange.base;
  const variation = (Math.random() - 0.5) * 0.3; // ±15% variation
  let price = basePrice * (1 + variation);
  
  // Ensure price is within range
  price = Math.max(priceRange.min, Math.min(priceRange.max, price));
  
  // Round to nearest $5 or $10 depending on price
  if (price < 100) {
    price = Math.round(price / 5) * 5;
  } else {
    price = Math.round(price / 10) * 10;
  }
  
  return price;
}

// Generate multiple price sources for a product
function generatePriceSources(productName: string, category: string, count: number = 8): PriceSource[] {
  const basePrice = generateRealisticPrice(productName, category);
  const sources: PriceSource[] = [];
  
  // Shuffle retailers
  const shuffledRetailers = [...RETAILERS].sort(() => Math.random() - 0.5);
  
  for (let i = 0; i < Math.min(count, shuffledRetailers.length); i++) {
    const retailer = shuffledRetailers[i];
    
    // Generate price variation for this retailer
    const priceVariation = (Math.random() - 0.5) * 0.4; // ±20% variation between retailers
    let price = basePrice * (1 + priceVariation);
    
    // Ensure reasonable price range
    const priceRange = PRODUCT_PRICE_RANGES.default;
    price = Math.max(priceRange.min * 0.8, Math.min(priceRange.max * 1.2, price));
    
    // Round price
    if (price < 100) {
      price = Math.round(price / 5) * 5;
    } else {
      price = Math.round(price / 10) * 10;
    }
    
    // Generate rating and review count
    const rating = 3.5 + Math.random() * 1.5; // 3.5-5.0 stars
    const reviewCount = Math.floor(Math.random() * 5000) + 50; // 50-5050 reviews
    
    sources.push({
      name: retailer.name,
      price,
      url: retailer.url,
      inStock: Math.random() > 0.1, // 90% chance of being in stock
      rating: Math.round(rating * 10) / 10,
      reviewCount
    });
  }
  
  // Sort by price (lowest first)
  return sources.sort((a, b) => a.price - b.price);
}

// Main function to get product info and prices
export async function getProductInfoAndPrices(productName: string): Promise<ProductInfo> {
  // Extract brand and category from product name
  const nameLower = productName.toLowerCase();
  let brand = 'Unknown';
  let category = 'Electronics';
  
  // Detect brand
  if (nameLower.includes('iphone') || nameLower.includes('ipad') || nameLower.includes('macbook') || nameLower.includes('airpods') || nameLower.includes('apple watch')) {
    brand = 'Apple';
  } else if (nameLower.includes('samsung') || nameLower.includes('galaxy')) {
    brand = 'Samsung';
  } else if (nameLower.includes('sony')) {
    brand = 'Sony';
  } else if (nameLower.includes('lg')) {
    brand = 'LG';
  } else if (nameLower.includes('microsoft') || nameLower.includes('surface') || nameLower.includes('xbox')) {
    brand = 'Microsoft';
  } else if (nameLower.includes('google') || nameLower.includes('pixel')) {
    brand = 'Google';
  } else if (nameLower.includes('oneplus')) {
    brand = 'OnePlus';
  } else if (nameLower.includes('nintendo')) {
    brand = 'Nintendo';
  } else if (nameLower.includes('playstation') || nameLower.includes('ps5') || nameLower.includes('ps4')) {
    brand = 'Sony';
  }
  
  // Detect category
  if (nameLower.includes('phone') || nameLower.includes('iphone') || nameLower.includes('galaxy')) {
    category = 'Smartphone';
  } else if (nameLower.includes('laptop') || nameLower.includes('macbook') || nameLower.includes('computer')) {
    category = 'Laptop';
  } else if (nameLower.includes('tablet') || nameLower.includes('ipad')) {
    category = 'Tablet';
  } else if (nameLower.includes('headphones') || nameLower.includes('airpods') || nameLower.includes('earbuds')) {
    category = 'Headphones';
  } else if (nameLower.includes('watch') || nameLower.includes('smartwatch')) {
    category = 'Smartwatch';
  } else if (nameLower.includes('tv') || nameLower.includes('television')) {
    category = 'TV';
  } else if (nameLower.includes('camera')) {
    category = 'Camera';
  } else if (nameLower.includes('console') || nameLower.includes('gaming') || nameLower.includes('playstation') || nameLower.includes('xbox')) {
    category = 'Gaming Console';
  } else if (nameLower.includes('speaker') || nameLower.includes('homepod') || nameLower.includes('echo')) {
    category = 'Smart Speaker';
  }
  
  // Generate description
  const descriptions = [
    `High-quality ${category.toLowerCase()} with advanced features and modern design.`,
    `Premium ${category.toLowerCase()} offering excellent performance and reliability.`,
    `Feature-rich ${category.toLowerCase()} perfect for everyday use and entertainment.`,
    `Professional-grade ${category.toLowerCase()} with cutting-edge technology.`,
    `Versatile ${category.toLowerCase()} suitable for both work and leisure activities.`
  ];
  
  const description = descriptions[Math.floor(Math.random() * descriptions.length)];
  
  // Generate specifications
  const specs = [
    'High-resolution display',
    'Fast processor',
    'Long battery life',
    'Wireless connectivity',
    'Premium build quality',
    'Advanced security features',
    'Multiple color options',
    'Comprehensive warranty'
  ];
  
  // Shuffle and take 4-6 specs
  const shuffledSpecs = [...specs].sort(() => Math.random() - 0.5);
  const selectedSpecs = shuffledSpecs.slice(0, 4 + Math.floor(Math.random() * 3));
  
  // Generate image URL using Unsplash
  const searchTerm = encodeURIComponent(`${brand} ${productName}`);
  const imageUrl = `https://source.unsplash.com/400x400/?${searchTerm}`;
  
  // Generate price sources
  const prices = generatePriceSources(productName, category, 12);
  
  // Calculate price statistics
  const validPrices = prices.filter(p => p.inStock).map(p => p.price);
  const averagePrice = validPrices.length > 0 ? validPrices.reduce((a, b) => a + b, 0) / validPrices.length : 0;
  const lowestPrice = validPrices.length > 0 ? Math.min(...validPrices) : 0;
  const highestPrice = validPrices.length > 0 ? Math.max(...validPrices) : 0;
  
  return {
    name: productName,
    brand,
    category,
    description,
    specifications: selectedSpecs,
    imageUrl,
    prices,
    averagePrice: Math.round(averagePrice),
    lowestPrice: Math.round(lowestPrice),
    highestPrice: Math.round(highestPrice)
  };
}

// Generate price history data
export function generatePriceHistory(days: number, basePrice: number): Array<{ date: string; price: number }> {
  const history = [];
  const today = new Date();
  
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    
    // Generate realistic price variation
    const variation = (Math.random() - 0.5) * 0.1; // ±5% daily variation
    let price = basePrice * (1 + variation);
    
    // Add some trend (slight upward or downward)
    const trend = (Math.random() - 0.5) * 0.02; // ±1% trend
    price = price * (1 + trend * i);
    
    // Round to nearest dollar
    price = Math.round(price);
    
    history.push({
      date: date.toISOString().split('T')[0],
      price
    });
  }
  
  return history;
} 