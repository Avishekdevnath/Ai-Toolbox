import { NextRequest } from 'next/server';

// Simple in-memory store for real-time collaboration
// In production, you'd want to use Redis or a proper real-time database
const collaborationStore = new Map<string, {
  content: string;
  title: string;
  language: string;
  isPublic: boolean;
  lastUpdated: number;
  users: Set<string>;
}>();

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  
  // Initialize snippet if it doesn't exist
  if (!collaborationStore.has(slug)) {
    collaborationStore.set(slug, {
      content: '',
      title: '',
      language: 'javascript',
      isPublic: true,
      lastUpdated: Date.now(),
      users: new Set(),
    });
  }

  const snippet = collaborationStore.get(slug)!;
  
  return Response.json({
    success: true,
    data: {
      content: snippet.content,
      title: snippet.title,
      language: snippet.language,
      isPublic: snippet.isPublic,
      activeUsers: Array.from(snippet.users),
      lastUpdated: snippet.lastUpdated,
    }
  });
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const body = await request.json();
  const { type, data, userId } = body;

  // Initialize snippet if it doesn't exist
  if (!collaborationStore.has(slug)) {
    collaborationStore.set(slug, {
      content: '',
      title: '',
      language: 'javascript',
      isPublic: true,
      lastUpdated: Date.now(),
      users: new Set(),
    });
  }

  const snippet = collaborationStore.get(slug)!;
  
  // Add user to active users
  if (userId) {
    snippet.users.add(userId);
  }

  // Update snippet data based on type
  switch (type) {
    case 'content-change':
      snippet.content = data.content || '';
      break;
    case 'title-change':
      snippet.title = data.title || '';
      break;
    case 'language-change':
      snippet.language = data.language || 'javascript';
      break;
    case 'visibility-change':
      snippet.isPublic = Boolean(data.isPublic);
      break;
  }

  snippet.lastUpdated = Date.now();

  return Response.json({
    success: true,
    data: {
      content: snippet.content,
      title: snippet.title,
      language: snippet.language,
      isPublic: snippet.isPublic,
      activeUsers: Array.from(snippet.users),
      lastUpdated: snippet.lastUpdated,
    }
  });
}
