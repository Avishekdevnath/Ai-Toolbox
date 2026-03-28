import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import {
  QuoteRequest,
  QuoteResponse,
  fallbackFamous,
} from '@/schemas/quoteSchema';
import {
  parseQuotesFromResponse,
  getFallbackQuotes,
  stripEnglishTranslation,
} from '@/lib/quoteUtils';
import {
  buildQuotePrompt,
  buildFallbackPrompt,
  buildFamousPeoplePrompt,
} from '@/lib/quotePromptBuilder';

// ── OpenAI client (lazy singleton — same pattern as other routes) ────────────
let openaiClient: OpenAI | null = null;
function getOpenAI(): OpenAI {
  if (!openaiClient)
    openaiClient = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  return openaiClient;
}

async function callAI(prompt: string): Promise<string> {
  const completion = await getOpenAI().chat.completions.create({
    model: 'gpt-4o-mini',
    max_tokens: 1200,
    messages: [{ role: 'user', content: prompt }],
  });
  return completion.choices[0]?.message?.content?.trim() ?? '';
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function getMonthDay(date: string): string {
  if (!date) return '';
  return new Date(date).toLocaleString('en-US', { month: 'long', day: 'numeric' });
}

const FORBIDDEN_PHRASES = [
  'উপযুক্ত উক্তি যদিও নির্দিষ্ট নয়', 'একটি উপযুক্ত উক্তি যদিও নির্দিষ্ট নয়',
  'নির্দিষ্ট কোন প্রসিদ্ধ উক্তি সন্নিবেশ করা সম্ভব হয়নি', 'প্রকৃত প্রসিদ্ধ',
  'অজ্ঞাত', 'Unknown', 'inspired by', 'paraphrased', 'paraphrase',
  'often misattributed', 'true authorship uncertain', 'widely attributed, though origin uncertain',
  'commonly cited as', 'lacks definitive evidence', 'capturing',
  'expressing a similar sentiment', 'Note:', '**Note:**', 'Some quotes',
  'uncertain or multiple attributions', 'widely accepted origins', 'definitive evidence',
  'similar sentiment', 'disclaimer', 'note', 'দ্রষ্টব্য', 'উপরোক্ত', 'অনুপ্রাণিত',
];
const SUSPICIOUS = [
  '(though', '(often', '(widely', '(commonly', '(true',
  '(definitive', '(similar', '(expressing', '(capturing',
];

function filterAuthenticQuotes(
  quotes: { quote: string; author: string }[],
): { quote: string; author: string }[] {
  return quotes.filter(({ quote, author }) => {
    const q = quote.toLowerCase();
    const a = author.toLowerCase();
    const hasForbidden = FORBIDDEN_PHRASES.some(p => q.includes(p.toLowerCase()) || a.includes(p.toLowerCase()));
    const hasSuspicious = SUSPICIOUS.some(p => q.includes(p) || a.includes(p));
    return !hasForbidden && !hasSuspicious;
  });
}

function extractQuotesFromText(
  text: string,
  language: string,
  authorFallback: string,
  hasAuthor: boolean,
): { quote: string; author: string }[] {
  const quotes: { quote: string; author: string }[] = [];

  if (!hasAuthor) {
    const matches = text.match(/\d+\.\s*["'`]?([^"'\n]+)["'`]?\s*[—\-]\s*([^\n]+)/g) ?? [];
    for (const m of matches) {
      const parts = m.match(/^\d+\.\s*["'`]?([^"'\n]+)["'`]?\s*[—\-]\s*(.+)$/);
      if (parts) {
        const q = language !== 'English' ? stripEnglishTranslation(parts[1].trim(), language) : parts[1].trim();
        const a = parts[2].trim();
        if (q && a) quotes.push({ quote: q, author: a });
      }
    }
  } else {
    const matches = text.match(/\d+\.\s*["'`]?([^"'\n]+)["'`]?/g) ?? [];
    for (const m of matches) {
      const parts = m.match(/^\d+\.\s*["'`]?([^"'\n]+)["'`]?$/);
      if (parts) {
        const q = language !== 'English' ? stripEnglishTranslation(parts[1].trim(), language) : parts[1].trim();
        if (q) quotes.push({ quote: q, author: authorFallback || 'Unknown' });
      }
    }
  }

  return quotes;
}

// ── Route handler ─────────────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  try {
    const requestData: QuoteRequest = await request.json();
    const { birthDate, topic, mood, author, count, language } = requestData;
    const quoteCount = Math.max(1, Math.min(Number(count) || 5, 20));

    // No API key — return curated fallback
    if (!process.env.OPENAI_API_KEY) {
      const quotes = getFallbackQuotes(requestData);
      const famousPeople = birthDate ? (fallbackFamous[getMonthDay(birthDate)] ?? []) : [];
      return NextResponse.json({ quotes, famousPeople, message: 'AI key not configured, showing curated quotes.' } as QuoteResponse);
    }

    // ── Generate quotes ─────────────────────────────────────────────────────
    const promptQuote = buildQuotePrompt(requestData);
    let text = await callAI(promptQuote);

    let quotes = parseQuotesFromResponse(text, language, author);

    // Secondary parse if primary yields nothing
    if (quotes.length === 0 && text) {
      quotes = extractQuotesFromText(text, language, author, !!author);
    }

    // Last resort — whole response as single quote
    if (quotes.length === 0 && text) {
      const clean = language !== 'English' ? stripEnglishTranslation(text, language) : text;
      quotes = [{ quote: clean, author: author || 'Unknown' }];
    }

    // Retry in English if non-English response came back all-Latin anyway
    if (language && language !== 'English' && quotes.every(q => !q.quote || /[a-zA-Z]/.test(q.quote))) {
      text = await callAI(buildFallbackPrompt(requestData));
      quotes = parseQuotesFromResponse(text, 'English', author);
      if (quotes.length === 0 && text) quotes = extractQuotesFromText(text, 'English', author, !!author);
      if (quotes.length === 0 && text) quotes = [{ quote: text, author: author || 'Unknown' }];
    }

    // ── Famous people for birthday ───────────────────────────────────────────
    let famousPeople: string[] = [];
    if (birthDate) {
      try {
        const raw = await callAI(buildFamousPeoplePrompt(birthDate));
        famousPeople = raw
          .replace(/^"|"$/g, '').replace(/^`+|`+$/g, '')
          .replace(/\d+\.|\*|\n/g, '')
          .split(',').map(n => n.trim()).filter(Boolean);
      } catch { /* non-fatal */ }
    }

    // ── Filter & respond ─────────────────────────────────────────────────────
    quotes = quotes.filter(q => q.quote && q.author);
    const before = quotes.length;
    quotes = filterAuthenticQuotes(quotes);

    let message = '';
    if (quotes.length < before)
      message = `${quotes.length} authentic quotes returned. ${before - quotes.length} unverifiable quotes were removed.`;
    if (quotes.length === 0)
      message = 'No verifiable quotes found for these criteria. Try different parameters.';

    return NextResponse.json({ quotes, famousPeople, message } as QuoteResponse);

  } catch (error) {
    console.error('[QUOTE API] Error:', error);
    return NextResponse.json({ error: 'Failed to generate quotes.' }, { status: 500 });
  }
}
