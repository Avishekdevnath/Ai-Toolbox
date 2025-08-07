import { NextRequest, NextResponse } from 'next/server';
import { model } from '@/lib/gemini';
import { 
  QuoteRequest, 
  QuoteResponse,
  fallbackFamous
} from '@/schemas/quoteSchema';
import { 
  filterAuthenticQuotes, 
  parseQuotesFromResponse, 
  getFallbackQuotes, 
  getMonthDay,
  stripEnglishTranslation
} from '@/lib/quoteUtils';
import { buildQuotePrompt, buildFallbackPrompt, buildFamousPeoplePrompt } from '@/lib/quotePromptBuilder';
import { validateRequest, checkRateLimit } from '@/lib/security';



// Expanded fallback quotes with metadata for filtering
const fallbackQuotes = [
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

const famousBengaliAuthors = [
  "Rabindranath Tagore", "Kazi Nazrul Islam", "Michael Madhusudan Dutt", "Bankim Chandra Chattopadhyay",
  "Dwijendralal Ray", "Sarat Chandra Chattopadhyay", "Jibanananda Das", "Suman Chattopadhyay",
  "Rammohan Roy", "Iswarchandra Vidyasagar", "Krittibas Ojha", "Hemchandra Bandopadhyay",
  "Bani Kanta Kundu", "Rashsundari Debi", "Jagadish Gupta", "Madhusree Mukherjee", "Shibram Chakraborty"
];

export async function POST(request: NextRequest) {
  try {
    // Security validation
    const securityCheck = validateRequest(request);
    if (!securityCheck.isValid) {
      return NextResponse.json(
        { error: securityCheck.error || 'Security validation failed' },
        { status: securityCheck.statusCode || 400 }
      );
    }

    // Rate limiting
    const clientIP = request.ip || request.headers.get('x-forwarded-for') || 'unknown';
    if (!checkRateLimit(clientIP, 50, 60000)) { // 50 requests per minute
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please try again later.' },
        { status: 429 }
      );
    }

    const requestData: QuoteRequest = await request.json();
    const { birthDate, topic, mood, author, count, language } = requestData;
    const GOOGLE_AI_API_KEY = process.env.GOOGLE_AI_API_KEY;
    const quoteCount = Math.max(1, Math.min(Number(count) || 5, 20));

    console.log('[QUOTE API] Request:', requestData);
    
    // Check if AI key is available
    if (!GOOGLE_AI_API_KEY) {
      console.log('[QUOTE API] No AI key, using fallback.');
      const quotes = getFallbackQuotes(requestData);
      let famousPeople: string[] = [];
      
      if (birthDate) {
        const monthDay = getMonthDay(birthDate);
        famousPeople = fallbackFamous[monthDay] || [];
      }
      
      return NextResponse.json({
        quotes,
        famousPeople,
        message: 'AI key not set, using filtered fallback data.'
      } as QuoteResponse, { status: 200 });
    }

    // Build prompt using the prompt builder
    const promptQuote = buildQuotePrompt(requestData);
    console.log('[QUOTE API] Prompt sent to AI:', promptQuote);
    
    // Generate quotes using AI
    let resultQuote = await model.generateContent(promptQuote);
    let responseQuote = await resultQuote.response;
    let text = responseQuote.text().trim();
    console.log('[QUOTE API] Raw AI response:', text);
    
    // Parse quotes from AI response
    let quotes = parseQuotesFromResponse(text, language, author, quoteCount);
    
    // Fallback: if no quotes found, try alternative parsing
    if (quotes.length === 0 && text) {
      console.log('[QUOTE API] Primary parsing failed, trying alternative methods');
      
      if (!author) {
        // Try to find quote-author patterns in the entire text
        const quoteMatches = text.match(/\d+\.\s*["'`]?([^"']+)["'`]?\s*[—-]\s*([^\n]+)/g);
        if (quoteMatches) {
          for (const match of quoteMatches) {
            const parts = match.match(/^\d+\.\s*["'`]?([^"']+)["'`]?\s*[—-]\s*(.+)$/);
            if (parts) {
              let quote = parts[1].trim();
              let authorName = parts[2].trim();
              if (language && language !== 'English') {
                quote = quote.replace(/\([^\)]*\*[^\)]*\)/g, '')
                           .replace(/\([^\)]*English[^\)]*\)/gi, '')
                           .replace(/\*[^\n]+/g, '')
                           .replace(/\([^\)]*\)/g, '')
                           .replace(/\s+/g, ' ').trim();
              }
              if (quote && authorName) {
                quotes.push({ quote, author: authorName });
              }
            }
          }
        }
      } else {
        // Try to find numbered quotes without authors
        const quoteMatches = text.match(/\d+\.\s*["'`]?([^"']+)["'`]?/g);
        if (quoteMatches) {
          for (const match of quoteMatches) {
            const parts = match.match(/^\d+\.\s*["'`]?([^"']+)["'`]?$/);
            if (parts) {
              let quote = parts[1].trim();
              if (language && language !== 'English') {
                quote = quote.replace(/\([^\)]*\*[^\)]*\)/g, '')
                           .replace(/\([^\)]*English[^\)]*\)/gi, '')
                           .replace(/\*[^\n]+/g, '')
                           .replace(/\([^\)]*\)/g, '')
                           .replace(/\s+/g, ' ').trim();
              }
              if (quote) {
                quotes.push({ quote, author: author || 'Unknown' });
              }
            }
          }
        }
      }
    }
    
    // Final fallback: if still no quotes, return the whole text as one quote
    if (quotes.length === 0 && text) {
      console.log('[QUOTE API] Fallback: returning whole text as single quote');
      let quote = text;
      if (language && language !== 'English') {
        quote = quote.replace(/\([^\)]*\*[^\)]*\)/g, '')
                   .replace(/\([^\)]*English[^\)]*\)/gi, '')
                   .replace(/\*[^\n]+/g, '')
                   .replace(/\([^\)]*\)/g, '')
                   .replace(/\s+/g, ' ').trim();
      }
      quotes = [{ quote, author: author || 'Unknown' }];
    }

    console.log('[QUOTE API] Parsed quotes:', quotes);

    // If language is not English and all quotes are empty or contain English, fallback to English
    if (language && language !== 'English' && quotes.every(q => !q.quote || /[a-zA-Z]/.test(q.quote))) {
      // Retry in English
      const fallbackPrompt = buildFallbackPrompt(requestData);
      console.log('[QUOTE API] Fallback to English prompt:', fallbackPrompt);
      
      resultQuote = await model.generateContent(fallbackPrompt);
      responseQuote = await resultQuote.response;
      text = responseQuote.text().trim();
      quotes = parseQuotesFromResponse(text, 'English', author, quoteCount);
      
      // Fallback: if no quotes found, try alternative parsing
      if (quotes.length === 0 && text) {
        if (!author) {
          const quoteMatches = text.match(/\d+\.\s*["'`]?([^"']+)["'`]?\s*[—-]\s*([^\n]+)/g);
          if (quoteMatches) {
            for (const match of quoteMatches) {
              const parts = match.match(/^\d+\.\s*["'`]?([^"']+)["'`]?\s*[—-]\s*(.+)$/);
              if (parts) {
                let quote = parts[1].trim();
                let authorName = parts[2].trim();
                if (quote && authorName) {
                  quotes.push({ quote, author: authorName });
                }
              }
            }
          }
        } else {
          const quoteMatches = text.match(/\d+\.\s*["'`]?([^"']+)["'`]?/g);
          if (quoteMatches) {
            for (const match of quoteMatches) {
              const parts = match.match(/^\d+\.\s*["'`]?([^"']+)["'`]?$/);
              if (parts) {
                quotes.push({ quote: parts[1].trim(), author: author || 'Unknown' });
              }
            }
          }
        }
      }
      
      if (quotes.length === 0 && text) {
        quotes = [{ quote: text, author: 'Unknown' }];
      }
    }

    // Get famous people for birthday
    let famousPeople: string[] = [];
    if (birthDate) {
      const promptFamous = buildFamousPeoplePrompt(birthDate);
      try {
        const resultFamous = await model.generateContent(promptFamous);
        const responseFamous = await resultFamous.response;
        let famousPeopleRaw = responseFamous.text().trim();
        famousPeopleRaw = famousPeopleRaw.replace(/^"|"$/g, '').replace(/^`+|`+$/g, '');
        famousPeopleRaw = famousPeopleRaw.replace(/\d+\.|\*|\n/g, '');
        famousPeople = famousPeopleRaw.split(',').map(name => name.trim()).filter(Boolean);
        console.log('[QUOTE API] Famous people AI response:', famousPeopleRaw);
      } catch (famousErr) {
        console.error('[QUOTE API] Error fetching famous people:', famousErr);
      }
    }

    // Only return quotes with both a quote and an author
    quotes = quotes.filter(q => q.quote && q.author);

    // Filter out non-authentic quotes
    const originalCount = quotes.length;
    quotes = filterAuthenticQuotes(quotes, language);
    
    // Add message if quotes were filtered out
    let message = '';
    if (quotes.length < originalCount) {
      message = `Only ${quotes.length} authentic, verifiable quotes found. Non-authentic quotes have been filtered out.`;
    }
    if (quotes.length === 0) {
      message = 'No authentic, verifiable quotes found for your criteria. Please try different parameters.';
    }

    const response: QuoteResponse = { quotes, famousPeople, message };
    return NextResponse.json(response);
  } catch (error) {
    console.error('[QUOTE API] Error:', error);
    return NextResponse.json({ error: 'Failed to generate quotes or famous people' }, { status: 500 });
  }
} 