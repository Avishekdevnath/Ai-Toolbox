import { crawlProductPage } from './webCrawler';

// Test function to verify web crawler
export async function testWebCrawler(url: string) {
  console.log('Testing web crawler with URL:', url);
  
  try {
    const result = await crawlProductPage(url);
    console.log('Crawled data:', JSON.stringify(result, null, 2));
    return result;
  } catch (error) {
    console.error('Crawler test failed:', error);
    return null;
  }
}

// Example usage:
// testWebCrawler('https://www.amazon.com/dp/B0CM5J8X9P'); 