import { NextRequest, NextResponse } from 'next/server';
import { getCodeSnippetModel } from '@/models/CodeSnippetModel';
import { nanoid } from 'nanoid';

// GET /api/snippets  – list snippets (optionally owner only, lang filter, pagination)
export async function GET(request: NextRequest) {
  const Snippet = await getCodeSnippetModel();
  const { searchParams } = new URL(request.url);
  const page = Number(searchParams.get('page') || 1);
  const size = Math.min(Number(searchParams.get('size') || 20), 100);
  const skip = (page - 1) * size;

  const lang = searchParams.get('lang');
  const owner = searchParams.get('owner'); // expect 'me'
  const userId = request.headers.get('x-user-id');

  const query: any = { isPublic: true };
  if (lang) query.language = lang.toLowerCase();
  if (owner === 'me' && userId) query.ownerId = userId;

  const [items, total] = await Promise.all([
    Snippet.find(query).sort({ updatedAt: -1 }).skip(skip).limit(size).lean(),
    Snippet.countDocuments(query),
  ]);

  return NextResponse.json({ success: true, data: { items, page, size, total } });
}

// POST /api/snippets – create snippet
export async function POST(request: NextRequest) {
  try {
    const Snippet = await getCodeSnippetModel();
    const body = await request.json();
    const { title = '', language, content = '', rawContent, slug: providedSlug, isPublic = true } = body;
    if (!language) {
      return NextResponse.json({ success: false, error: 'language required' }, { status: 400 });
    }
    if (content && content.length > 100000) {
      return NextResponse.json({ success: false, error: 'Content too large' }, { status: 413 });
    }
    const slug = providedSlug || nanoid(8);
    const userId = request.headers.get('x-user-id');
    const doc = await Snippet.create({
      slug,
      title,
      language: language.toLowerCase(),
      content,
      rawContent,
      ownerId: userId || undefined,
      isPublic: Boolean(isPublic),
    });
    return NextResponse.json({ success: true, data: { id: doc._id, slug } }, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message || 'Failed to create snippet' }, { status: 500 });
  }
}
