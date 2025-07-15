import { QuoteRequest, famousBengaliAuthors } from './quoteUtils';

export function buildQuotePrompt(request: QuoteRequest): string {
  const { topic, mood, author, count, language, birthDate } = request;
  const quoteCount = Math.max(1, Math.min(count || 5, 20));
  
  let prompt = '';
  
  // Add language instruction
  if (language && language !== 'English') {
    prompt += `Respond ONLY in ${language}. Do NOT provide translations or explanations. `;
  }
  
  // Build the main prompt based on request type
  if (!author) {
    // Authentic quotes from real authors
    prompt += `Give me up to ${quoteCount} famous, authentic, and verifiable quotes`;
    if (topic) prompt += ` about ${topic}`;
    if (mood) prompt += ` in a ${mood} tone`;
    
    // Bengali-specific: restrict to famous Bengali authors
    if (language === 'Bengali') {
      prompt += `. Only use real, well-known, and verifiable quotes from these Bengali authors: ${famousBengaliAuthors.join(', ')}. Return only real, verifiable quotes. Do NOT invent, paraphrase, or create new quotes. If not enough real quotes exist, return only those that are authentic. Do NOT include any disclaimers or notes. Do not attribute quotes to 'Unknown' or generic sources.`;
    } else {
      prompt += `. Return only real, verifiable, and well-known quotes from authentic sources. Do NOT invent, paraphrase, or create new quotes. If not enough real quotes exist, return only those that are authentic. Do NOT include any disclaimers or notes. For each quote, include the original author's name.`;
    }
    prompt += ' Format: "Quote text" — Author Name. Number each quote.';
  } else if (topic || mood || author) {
    // Original quotes in specific style
    prompt += `Write ${quoteCount} short, original, unique quotes`;
    if (topic) prompt += ` about ${topic}`;
    if (mood) prompt += ` in a ${mood} tone`;
    if (author) prompt += ` in the style of ${author}`;
    if (birthDate) prompt += ` that could be used as a birthday wish`;
    prompt += `. Number each quote. Avoid cliches. Make them realistic and meaningful.`;
  } else if (birthDate) {
    // Birthday quotes
    prompt += `Write ${quoteCount} short, uplifting, original birthday quotes for someone born on ${birthDate}. Number each quote. Avoid cliches. Make them unique and positive.`;
  } else {
    // General life quotes
    prompt += `Write ${quoteCount} short, original, inspiring quotes about life. Number each quote.`;
  }
  
  return prompt;
}

export function buildFallbackPrompt(request: QuoteRequest): string {
  const { topic, mood, author, count, birthDate } = request;
  const quoteCount = Math.max(1, Math.min(count || 5, 20));
  
  let prompt = '';
  
  if (!author) {
    prompt += `Give me up to ${quoteCount} famous, authentic, and verifiable quotes`;
    if (topic) prompt += ` about ${topic}`;
    if (mood) prompt += ` in a ${mood} tone`;
    prompt += `. Return only real, verifiable, and well-known quotes from authentic sources. Do NOT invent, paraphrase, or create new quotes. If not enough real quotes exist, return only those that are authentic. Do NOT include any disclaimers or notes. For each quote, include the original author's name. Format: "Quote text" — Author Name. Number each quote.`;
  } else {
    prompt += `Write ${quoteCount} short, original, unique quotes`;
    if (topic) prompt += ` about ${topic}`;
    if (mood) prompt += ` in a ${mood} tone`;
    if (author) prompt += ` in the style of ${author}`;
    if (birthDate) prompt += ` that could be used as a birthday wish`;
    prompt += `. Number each quote. Avoid cliches. Make them realistic and meaningful.`;
  }
  
  return prompt;
}

export function buildFamousPeoplePrompt(birthDate: string): string {
  const monthDay = getMonthDay(birthDate);
  return `List 3-5 famous people born on ${monthDay}. Return only their names as a comma-separated list.`;
}

function getMonthDay(date: string): string {
  if (!date) return '';
  const d = new Date(date);
  return d.toLocaleString('en-US', { month: 'long', day: 'numeric' });
} 