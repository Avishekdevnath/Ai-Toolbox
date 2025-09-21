import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { name, category } = await req.json();
    if (!name && !category) {
      return NextResponse.json({ error: 'Name or category required' }, { status: 400 });
    }
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'Gemini API key not set' }, { status: 500 });
    }
    // Gemini API call
    const prompt = `Suggest a single emoji that best represents a tool named "${name}" in the category "${category}". Only return the emoji, nothing else.`;
    const geminiRes = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=' + apiKey, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }]
      })
    });
    const geminiData = await geminiRes.json();
    // Parse Gemini response
    const text = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
    if (!text || text.length > 4) {
      // fallback: just a wrench
      return NextResponse.json({ icon: '🔧' });
    }
    return NextResponse.json({ icon: text });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Failed to suggest icon' }, { status: 500 });
  }
} 