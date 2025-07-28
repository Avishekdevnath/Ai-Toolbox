// Interfaces moved to schemas/quoteSchema.ts

// Famous authors and fallback data moved to schemas/quoteSchema.ts

// Export famous Bengali authors for backward compatibility
export const famousBengaliAuthors = [
  'Rabindranath Tagore',
  'Kazi Nazrul Islam',
  'Bankim Chandra Chattopadhyay',
  'Sarat Chandra Chattopadhyay',
  'Michael Madhusudan Dutt',
  'Ishwar Chandra Vidyasagar',
  'Swami Vivekananda',
  'Sri Aurobindo',
  'Netaji Subhas Chandra Bose',
  'Kazi Nazrul Islam',
  'Humayun Ahmed',
  'Jibanananda Das',
  'Buddhadeb Basu',
  'Sunil Gangopadhyay',
  'Mahasweta Devi',
  'Anita Desai',
  'Jhumpa Lahiri',
  'Amitav Ghosh',
  'Bibhutibhushan Bandyopadhyay',
  'Manik Bandyopadhyay'
];

// Function to get month and day from date
export function getMonthDay(date: string): string {
  if (!date) return '';
  const d = new Date(date);
  return d.toLocaleString('en-US', { month: 'long', day: 'numeric' });
}

// Function to strip English translations from non-English text
export function stripEnglishTranslation(text: string, language: string): string {
  if (language === 'English') return text;
  return text.replace(/\([^\)]*\*[^\)]*\)/g, '')
             .replace(/\([^\)]*English[^\)]*\)/gi, '')
             .replace(/\*[^\n]+/g, '')
             .replace(/\([^\)]*\)/g, '')
             .replace(/\s+/g, ' ').trim();
}

// Function to filter out non-authentic quotes
export function filterAuthenticQuotes(quotes: { quote: string, author: string }[], language: string): { quote: string, author: string }[] {
  const forbiddenPhrases = [
    // Bengali disclaimers
    'উপযুক্ত উক্তি যদিও নির্দিষ্ট নয়',
    'একটি উপযুক্ত উক্তি যদিও নির্দিষ্ট নয়',
    'নির্দিষ্ট কোন প্রসিদ্ধ উক্তি সন্নিবেশ করা সম্ভব হয়নি',
    'প্রকৃত প্রসিদ্ধ',
    'অজ্ঞাত',
    'Unknown',
    // English disclaimers
    'inspired by',
    'paraphrased',
    'paraphrase',
    'often misattributed',
    'true authorship uncertain',
    'widely attributed, though origin uncertain',
    'commonly cited as',
    'lacks definitive evidence',
    'capturing',
    'expressing a similar sentiment',
    'Note:',
    '**Note:**',
    'Some quotes',
    'uncertain or multiple attributions',
    'widely accepted origins',
    'definitive evidence',
    'similar sentiment',
    // Generic disclaimers
    'disclaimer',
    'note',
    'দ্রষ্টব্য',
    'উপরোক্ত',
    'অনুপ্রাণিত'
  ];

  return quotes.filter(quote => {
    const quoteText = quote.quote.toLowerCase();
    const authorText = quote.author.toLowerCase();
    
    // Check if quote or author contains any forbidden phrases
    const hasForbiddenPhrase = forbiddenPhrases.some(phrase => 
      quoteText.includes(phrase.toLowerCase()) || 
      authorText.includes(phrase.toLowerCase())
    );
    
    // Check for suspicious patterns
    const hasSuspiciousPatterns = 
      quoteText.includes('(though') ||
      quoteText.includes('(often') ||
      quoteText.includes('(widely') ||
      quoteText.includes('(commonly') ||
      quoteText.includes('(true') ||
      quoteText.includes('(definitive') ||
      quoteText.includes('(similar') ||
      quoteText.includes('(expressing') ||
      quoteText.includes('(capturing') ||
      authorText.includes('(though') ||
      authorText.includes('(often') ||
      authorText.includes('(widely') ||
      authorText.includes('(commonly') ||
      authorText.includes('(true') ||
      authorText.includes('(definitive') ||
      authorText.includes('(similar') ||
      authorText.includes('(expressing') ||
      authorText.includes('(capturing');

    return !hasForbiddenPhrase && !hasSuspiciousPatterns;
  });
}

// Function to parse quotes from AI response
export function parseQuotesFromResponse(text: string, language: string, author?: string): { quote: string, author: string }[] {
  const quotes: { quote: string, author: string }[] = [];
  
  // Split by lines and look for quote patterns
  const lines = text.split('\n').filter(line => line.trim());
  
  for (const line of lines) {
    const trimmedLine = line.trim();
    
    // Skip empty lines and common AI disclaimers
    if (!trimmedLine || 
        trimmedLine.startsWith('Note:') || 
        trimmedLine.startsWith('**Note:**') ||
        trimmedLine.includes('disclaimer') ||
        trimmedLine.includes('উপযুক্ত উক্তি যদিও নির্দিষ্ট নয়')) {
      continue;
    }
    
    // Look for quote patterns: "quote" - author
    const quoteMatch = trimmedLine.match(/^["""]([^"""]+)["""]\s*[-–—]\s*(.+)$/);
    if (quoteMatch) {
      const quote = stripEnglishTranslation(quoteMatch[1].trim(), language);
      const author = stripEnglishTranslation(quoteMatch[2].trim(), language);
      
      if (quote && author && quote.length > 10) {
        quotes.push({ quote, author });
      }
      continue;
    }
    
    // Look for quote patterns: 'quote' - author
    const singleQuoteMatch = trimmedLine.match(/^[''']([^''']+)[''']\s*[-–—]\s*(.+)$/);
    if (singleQuoteMatch) {
      const quote = stripEnglishTranslation(singleQuoteMatch[1].trim(), language);
      const author = stripEnglishTranslation(singleQuoteMatch[2].trim(), language);
      
      if (quote && author && quote.length > 10) {
        quotes.push({ quote, author });
      }
      continue;
    }
    
    // Look for numbered quotes: 1. "quote" - author
    const numberedMatch = trimmedLine.match(/^\d+\.\s*["""]([^"""]+)["""]\s*[-–—]\s*(.+)$/);
    if (numberedMatch) {
      const quote = stripEnglishTranslation(numberedMatch[1].trim(), language);
      const author = stripEnglishTranslation(numberedMatch[2].trim(), language);
      
      if (quote && author && quote.length > 10) {
        quotes.push({ quote, author });
      }
      continue;
    }
    
    // Look for bullet points: • "quote" - author
    const bulletMatch = trimmedLine.match(/^[•\-\*]\s*["""]([^"""]+)["""]\s*[-–—]\s*(.+)$/);
    if (bulletMatch) {
      const quote = stripEnglishTranslation(bulletMatch[1].trim(), language);
      const author = stripEnglishTranslation(bulletMatch[2].trim(), language);
      
      if (quote && author && quote.length > 10) {
        quotes.push({ quote, author });
      }
      continue;
    }
  }
  
  // If no quotes found with standard patterns, try to extract from plain text
  if (quotes.length === 0) {
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 20);
    for (const sentence of sentences.slice(0, 5)) { // Limit to first 5 sentences
      const cleanSentence = stripEnglishTranslation(sentence.trim(), language);
      if (cleanSentence.length > 20 && cleanSentence.length < 200) {
        quotes.push({ 
          quote: cleanSentence, 
          author: author || 'Unknown' 
        });
      }
    }
  }
  
  return quotes.slice(0, 10); // Limit to 10 quotes
}

// Function to get fallback quotes when AI is not available
export function getFallbackQuotes(request: { topic: string; mood: string; count: number }): { quote: string; author: string }[] {
  // Import fallback quotes from schema
  const { fallbackQuotes } = require('@/schemas/quoteSchema');
  
  const filteredQuotes = fallbackQuotes.filter((q: any) => 
    q.topic.toLowerCase().includes(request.topic.toLowerCase()) ||
    q.mood.toLowerCase().includes(request.mood.toLowerCase())
  );
  
  // If no exact matches, return random quotes
  if (filteredQuotes.length === 0) {
    const shuffled = fallbackQuotes.sort(() => 0.5 - Math.random());
    return shuffled.slice(0, Math.min(request.count, 5)).map((q: any) => ({
      quote: q.quote,
      author: q.author
    }));
  }
  
  // Return filtered quotes, shuffled
  const shuffled = filteredQuotes.sort(() => 0.5 - Math.random());
  return shuffled.slice(0, Math.min(request.count, filteredQuotes.length)).map((q: any) => ({
    quote: q.quote,
    author: q.author
  }));
} 