export interface QuoteRequest {
  birthDate: string;
  topic: string;
  mood: string;
  author: string;
  count: number;
  language: string;
}

export interface Quote {
  quote: string;
  author: string;
}

export interface QuoteResponse {
  quotes: Quote[];
  famousPeople: string[];
  message?: string;
}

// Famous Bengali authors for authentic quotes
export const famousBengaliAuthors = [
  "Rabindranath Tagore", "Kazi Nazrul Islam", "Michael Madhusudan Dutt", "Bankim Chandra Chattopadhyay",
  "Dwijendralal Ray", "Sarat Chandra Chattopadhyay", "Jibanananda Das", "Suman Chattopadhyay",
  "Rammohan Roy", "Iswarchandra Vidyasagar", "Krittibas Ojha", "Hemchandra Bandopadhyay",
  "Bani Kanta Kundu", "Rashsundari Debi", "Jagadish Gupta", "Madhusree Mukherjee", "Shibram Chakraborty"
];

// Fallback quotes for when AI is not available
export const fallbackQuotes: (Quote & { topic: string; mood: string })[] = [
  { quote: "Let your life lightly dance on the edges of time like dew on the tip of a leaf.", author: "Rabindranath Tagore", topic: "life", mood: "thoughtful" },
  { quote: "Love is an endless mystery, for it has nothing else to explain it.", author: "Rabindranath Tagore", topic: "love", mood: "romantic" },
  { quote: "You can't cross the sea merely by standing and staring at the water.", author: "Rabindranath Tagore", topic: "success", mood: "motivational" },
  { quote: "The only way to do great work is to love what you do.", author: "Steve Jobs", topic: "success", mood: "motivational" },
  { quote: "Where there is love there is life.", author: "Mahatma Gandhi", topic: "love", mood: "motivational" },
  { quote: "The best way to find yourself is to lose yourself in the service of others.", author: "Mahatma Gandhi", topic: "life", mood: "thoughtful" },
  { quote: "If you want to live a happy life, tie it to a goal, not to people or things.", author: "Albert Einstein", topic: "happiness", mood: "motivational" },
  { quote: "A friend is someone who gives you total freedom to be yourself.", author: "Jim Morrison", topic: "friendship", mood: "thoughtful" },
  { quote: "Let us celebrate the occasion with wine and sweet words.", author: "Plautus", topic: "birthday", mood: "celebratory" },
  { quote: "May your birthday be the start of a year filled with good luck, good health, and much happiness.", author: "Unknown", topic: "birthday", mood: "uplifting" },
];

export const fallbackFamous: Record<string, string[]> = {
  'March 14': ['Albert Einstein'],
  'January 15': ['Martin Luther King Jr.'],
  'February 12': ['Abraham Lincoln', 'Charles Darwin'],
  'July 18': ['Nelson Mandela'],
  'October 2': ['Mahatma Gandhi'],
  'December 25': ['Isaac Newton', 'Humphrey Bogart'],
};

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
export function filterAuthenticQuotes(quotes: Quote[], language: string): Quote[] {
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
export function parseQuotesFromResponse(text: string, language: string, author?: string): Quote[] {
  const quotes: Quote[] = [];
  const lines = text.split(/\n/).filter(line => line.trim());
  
  if (!author) {
    // Parse: 1. "Quote text" — Author Name
    for (const line of lines) {
      const lineMatch = line.match(/^\d+\.\s*["'`]?(.+?)["'`]?\s*[—-]\s*(.+)$/);
      if (lineMatch) {
        let quote = lineMatch[1].trim();
        let authorName = lineMatch[2].trim();
        if (language && language !== 'English') {
          quote = stripEnglishTranslation(quote, language);
        }
        if (quote && authorName) {
          quotes.push({ quote, author: authorName });
        }
      }
    }
  } else {
    // Parse numbered list (e.g., 1. "..." 2. "..." ...)
    for (const line of lines) {
      const lineMatch = line.match(/^\d+\.\s*["'`]?(.+?)["'`]?\s*$/);
      if (lineMatch) {
        let quote = lineMatch[1].trim();
        if (language && language !== 'English') {
          quote = stripEnglishTranslation(quote, language);
        }
        if (quote) {
          quotes.push({ quote, author: author || 'Unknown' });
        }
      }
    }
  }
  
  return quotes;
}

// Function to get fallback quotes based on criteria
export function getFallbackQuotes(request: QuoteRequest): Quote[] {
  let filtered = fallbackQuotes;
  
  if (request.author) {
    filtered = filtered.filter(q => q.author.toLowerCase().includes(request.author.toLowerCase()));
  }
  if (request.topic) {
    filtered = filtered.filter(q => q.topic.toLowerCase().includes(request.topic.toLowerCase()));
  }
  if (request.mood) {
    filtered = filtered.filter(q => q.mood.toLowerCase().includes(request.mood.toLowerCase()));
  }
  
  // If birthday and topic/mood/author not found, fallback to birthday quotes
  if (request.birthDate && filtered.length === 0) {
    filtered = fallbackQuotes.filter(q => q.topic === 'birthday');
  }
  
  // Shuffle and take up to count
  const shuffled = filtered.sort(() => 0.5 - Math.random());
  return shuffled.slice(0, request.count).map(q => ({ quote: q.quote, author: q.author }));
} 