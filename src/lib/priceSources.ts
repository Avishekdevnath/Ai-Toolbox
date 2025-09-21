export interface PriceSource {
  name: string;
  url: string;
  price: number;
  currency: string;
  lastChecked: string;
}

export interface SourceConfig {
  name: string;
  searchUrl: string;
  priceSelectors: string[];
  userAgent?: string;
  headers?: Record<string, string>;
}

// Comprehensive list of price sources with improved selectors
export const PRICE_SOURCES: SourceConfig[] = [
  // Major Retailers
  {
    name: 'Amazon',
    searchUrl: 'https://www.amazon.com/s?k={query}',
    priceSelectors: [
      '.a-price-whole',
      '.a-price .a-offscreen',
      '#priceblock_ourprice',
      '.a-price-range .a-offscreen',
      '.a-price .a-price-whole',
      '[data-a-color="price"] .a-offscreen'
    ]
  },
  {
    name: 'Walmart',
    searchUrl: 'https://www.walmart.com/search?q={query}',
    priceSelectors: [
      '.price-characteristic',
      '.prod-PriceHero .price-characteristic',
      '.price-main .price-characteristic',
      '.price-current .price-characteristic',
      '[data-testid="price-wrap"] .price-characteristic'
    ]
  },
  {
    name: 'Best Buy',
    searchUrl: 'https://www.bestbuy.com/site/searchpage.jsp?st={query}',
    priceSelectors: [
      '.priceView-customer-price span',
      '.priceView-layout-large .priceView-hero-price',
      '.priceView-customer-price .priceView-layout-large',
      '.priceView-customer-price .priceView-hero-price',
      '.priceView-customer-price .priceView-layout-large .priceView-hero-price'
    ]
  },
  {
    name: 'Target',
    searchUrl: 'https://www.target.com/s?searchTerm={query}',
    priceSelectors: [
      '.styles__PriceText',
      '[data-test="price-current"]',
      '.styles__PriceText__current',
      '.styles__PriceText__sale',
      '[data-testid="price-current"]'
    ]
  },
  {
    name: 'Newegg',
    searchUrl: 'https://www.newegg.com/p/pl?d={query}',
    priceSelectors: [
      '.price-current',
      '.price-current-label',
      '.price-current .price-current-label',
      '.price-current .price-current-label .price-current',
      '.price-current .price-current-label .price-current .price-current'
    ]
  },
  
  // Electronics Specialty
  {
    name: 'B&H Photo',
    searchUrl: 'https://www.bhphotovideo.com/c/search?q={query}',
    priceSelectors: [
      '.price',
      '.price-current',
      '.price-current .price',
      '.price-current .price-current',
      '.price-current .price-current .price'
    ]
  },
  {
    name: 'Adorama',
    searchUrl: 'https://www.adorama.com/search?searchinfo={query}',
    priceSelectors: [
      '.price',
      '.product-price',
      '.price-current',
      '.price-current .price',
      '.price-current .product-price'
    ]
  },
  {
    name: 'Micro Center',
    searchUrl: 'https://www.microcenter.com/search/search_results.aspx?Ntt={query}',
    priceSelectors: [
      '.price',
      '.product-price',
      '.price-current',
      '.price-current .price',
      '.price-current .product-price'
    ]
  },
  
  // Online Marketplaces
  {
    name: 'eBay',
    searchUrl: 'https://www.ebay.com/sch/i.html?_nkw={query}',
    priceSelectors: [
      '.s-item__price',
      '.price',
      '.s-item__price .price',
      '.s-item__price .s-item__price',
      '.s-item__price .s-item__price .price'
    ]
  },
  {
    name: 'Etsy',
    searchUrl: 'https://www.etsy.com/search?q={query}',
    priceSelectors: [
      '.currency-value',
      '.price',
      '.currency-value .price',
      '.currency-value .currency-value',
      '.currency-value .currency-value .price'
    ]
  },
  
  // Tech Retailers
  {
    name: 'Apple Store',
    searchUrl: 'https://www.apple.com/search/{query}',
    priceSelectors: [
      '.price',
      '.product-price',
      '.price-current',
      '.price-current .price',
      '.price-current .product-price'
    ]
  },
  {
    name: 'Microsoft Store',
    searchUrl: 'https://www.microsoft.com/en-us/search/result.aspx?q={query}',
    priceSelectors: [
      '.price',
      '.product-price',
      '.price-current',
      '.price-current .price',
      '.price-current .product-price'
    ]
  },
  {
    name: 'Samsung',
    searchUrl: 'https://www.samsung.com/us/search/?searchvalue={query}',
    priceSelectors: [
      '.price',
      '.product-price',
      '.price-current',
      '.price-current .price',
      '.price-current .product-price'
    ]
  },
  
  // Department Stores
  {
    name: 'Macy\'s',
    searchUrl: 'https://www.macys.com/shop/featured/{query}',
    priceSelectors: [
      '.price',
      '.product-price',
      '.price-current',
      '.price-current .price',
      '.price-current .product-price'
    ]
  },
  {
    name: 'Kohl\'s',
    searchUrl: 'https://www.kohls.com/search.jsp?search={query}',
    priceSelectors: [
      '.price',
      '.product-price',
      '.price-current',
      '.price-current .price',
      '.price-current .product-price'
    ]
  },
  
  // Home & Garden
  {
    name: 'Home Depot',
    searchUrl: 'https://www.homedepot.com/s/{query}',
    priceSelectors: [
      '.price',
      '.product-price',
      '.price-current',
      '.price-current .price',
      '.price-current .product-price'
    ]
  },
  {
    name: 'Lowe\'s',
    searchUrl: 'https://www.lowes.com/search?searchTerm={query}',
    priceSelectors: [
      '.price',
      '.product-price',
      '.price-current',
      '.price-current .price',
      '.price-current .product-price'
    ]
  },
  
  // Office Supplies
  {
    name: 'Staples',
    searchUrl: 'https://www.staples.com/search?query={query}',
    priceSelectors: [
      '.price',
      '.product-price',
      '.price-current',
      '.price-current .price',
      '.price-current .product-price'
    ]
  },
  {
    name: 'Office Depot',
    searchUrl: 'https://www.officedepot.com/search?searchTerm={query}',
    priceSelectors: [
      '.price',
      '.product-price',
      '.price-current',
      '.price-current .price',
      '.price-current .product-price'
    ]
  },
  
  // Sports & Outdoors
  {
    name: 'REI',
    searchUrl: 'https://www.rei.com/search?q={query}',
    priceSelectors: [
      '.price',
      '.product-price',
      '.price-current',
      '.price-current .price',
      '.price-current .product-price'
    ]
  },
  {
    name: 'Dick\'s Sporting Goods',
    searchUrl: 'https://www.dickssportinggoods.com/search?searchTerm={query}',
    priceSelectors: [
      '.price',
      '.product-price',
      '.price-current',
      '.price-current .price',
      '.price-current .product-price'
    ]
  }
];

// Helper function to get search URL for a source
export function getSearchUrl(source: SourceConfig, query: string): string {
  return source.searchUrl.replace('{query}', encodeURIComponent(query));
}

// Helper function to get product URL for a source
export function getProductUrl(source: SourceConfig, query: string): string {
  return source.searchUrl.replace('{query}', encodeURIComponent(query));
} 