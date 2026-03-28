import { QuoteRequest, famousBengaliAuthors } from '@/schemas/quoteSchema';

export function buildQuotePrompt(request: QuoteRequest): string {
  const { topic, mood, author, count, language, birthDate } = request;
  const quoteCount = Math.max(1, Math.min(count || 5, 20));
  
  let prompt = '';
  
  // Add language instruction
  if (language && language !== 'English') {
    prompt += `Respond ONLY in ${language}. Do NOT provide translations or explanations. `;
  }
  
  // All paths request REAL, documented quotes only — never invented ones.
  if (author) {
    // Real quotes BY the specified author
    prompt += `Find up to ${quoteCount} real, documented, and verifiable quotes actually said or written by ${author}`;
    if (topic) prompt += ` about ${topic}`;
    if (mood) prompt += ` in a ${mood} tone`;
    prompt += `. IMPORTANT: Only include quotes that are confirmed to be from ${author}. Do NOT invent, paraphrase, fabricate, or create new quotes. Do NOT write quotes "in the style of" ${author}. If fewer than ${quoteCount} verified quotes exist for these criteria, return only those that are genuinely authentic — do not pad with invented ones. Do NOT include any disclaimers, notes, or caveats. Format: "Quote text" — ${author}. Number each quote.`;
  } else if (birthDate) {
    // Birthday — real quotes about celebration/life from well-known figures
    prompt += `Find up to ${quoteCount} real, documented, and verifiable quotes about life, celebration, or birthdays`;
    if (mood) prompt += ` in a ${mood} tone`;
    prompt += `. Return only quotes that are confirmed authentic from real historical figures, authors, or philosophers. Do NOT invent or paraphrase. Format: "Quote text" — Author Name. Number each quote.`;
  } else {
    // General — real quotes by topic/mood
    prompt += `Find up to ${quoteCount} famous, authentic, and verifiable quotes`;
    if (topic) prompt += ` about ${topic}`;
    if (mood) prompt += ` in a ${mood} tone`;

    if (language === 'Bengali') {
      prompt += `. Only use real, well-known, and verifiable quotes from these Bengali authors: ${famousBengaliAuthors.join(', ')}. Return only real, verifiable quotes. Do NOT invent, paraphrase, or create new quotes. If not enough real quotes exist, return only those that are authentic. Do NOT include any disclaimers or notes.`;
    } else {
      prompt += `. Return only real, verifiable, and well-known quotes from authentic sources. Do NOT invent, paraphrase, or create new quotes. If not enough real quotes exist, return only those that are authentic. Do NOT include any disclaimers or notes. Include the original author's name for each quote.`;
    }
    prompt += ' Format: "Quote text" — Author Name. Number each quote.';
  }
  
  return prompt;
}

export function buildFallbackPrompt(request: QuoteRequest): string {
  const { topic, mood, author, count, birthDate } = request;
  const quoteCount = Math.max(1, Math.min(count || 5, 20));
  
  let prompt = '';
  
  if (author) {
    prompt += `Find up to ${quoteCount} real, documented, and verifiable quotes actually said or written by ${author}`;
    if (topic) prompt += ` about ${topic}`;
    if (mood) prompt += ` in a ${mood} tone`;
    prompt += `. Only include quotes confirmed to be from ${author}. Do NOT invent, paraphrase, or fabricate quotes. Format: "Quote text" — ${author}. Number each quote.`;
  } else {
    prompt += `Find up to ${quoteCount} famous, authentic, and verifiable quotes`;
    if (topic) prompt += ` about ${topic}`;
    if (mood) prompt += ` in a ${mood} tone`;
    prompt += `. Return only real, verifiable, and well-known quotes from authentic sources. Do NOT invent, paraphrase, or create new quotes. If not enough real quotes exist, return only those that are authentic. Do NOT include any disclaimers or notes. For each quote, include the original author's name. Format: "Quote text" — Author Name. Number each quote.`;
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
