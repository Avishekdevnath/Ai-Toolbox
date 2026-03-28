import { NextRequest, NextResponse } from 'next/server';
import { getCodeSnippetModel } from '@/models/CodeSnippetModel';
import { nanoid } from 'nanoid';
import mongoose from 'mongoose';

export async function POST(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = await params;
    const Snippet = await getCodeSnippetModel();

    const source = await Snippet.findOne({ slug });
    if (!source) {
      return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 });
    }
    if (!source.isPublic) {
      return NextResponse.json({ success: false, error: 'Cannot fork a private snippet' }, { status: 403 });
    }

    const userId = request.headers.get('x-user-id');
    const newSlug = nanoid(8);

    await Snippet.create({
      slug: newSlug,
      title: source.title ? `Fork of ${source.title}` : 'Fork of Untitled',
      language: source.language,
      content: source.content,
      rawContent: source.rawContent,
      isPublic: true,
      ownerId: userId ? new mongoose.Types.ObjectId(userId) : undefined,
    });

    return NextResponse.json({ success: true, data: { slug: newSlug } }, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/snippets/[slug]/fork:', error);
    return NextResponse.json({ success: false, error: 'Failed to fork snippet' }, { status: 500 });
  }
}
