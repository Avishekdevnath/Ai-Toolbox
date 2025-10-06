import { NextRequest } from 'next/server';

// Ensure this route is always dynamic and not cached
export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';
export const runtime = 'nodejs';

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

// In-memory subscribers for Server-Sent Events per slug
type Subscriber = {
  send: (data: string) => void;
};
const subscribers = new Map<string, Set<Subscriber>>();

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const { searchParams } = new URL(request.url);
  const isStream = searchParams.get('stream') === '1';
  
  if (isStream) {
    // SSE stream for updates-after-save only
    if (!subscribers.has(slug)) subscribers.set(slug, new Set());

    const stream = new ReadableStream<string>({
      start(controller) {
        let isClosed = false;
        let cleanupRef: (() => void) | null = null;
        
        const send = (data: string) => {
          if (isClosed) return;
          try {
            controller.enqueue(data);
          } catch {
            isClosed = true;
          }
        };
        
        const sub: Subscriber = { send };
        subscribers.get(slug)!.add(sub);

        // Send initial ping (no heartbeat to avoid timer issues)
        send(`event: ping\ndata: connected\n\n`);

        // Cleanup when the stream is canceled
        const cleanup = () => {
          isClosed = true;
          subscribers.get(slug)!.delete(sub);
        };
        cleanupRef = cleanup;
      },
      cancel() {
        // Called when the consumer cancels the stream
        // Note: cleanupRef is closed over from start(); this method runs server-side
        // @ts-ignore
        if (typeof cleanupRef === 'function') cleanupRef();
      }
    });

    return new Response(stream as any, {
      headers: {
        'Content-Type': 'text/event-stream; charset=utf-8',
        'Cache-Control': 'no-cache, no-transform',
        'Connection': 'keep-alive',
        'X-Accel-Buffering': 'no'
      }
    });
  }
  
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

  // Notify SSE subscribers that an update occurred (after save)
  const subs = subscribers.get(slug);
  if (subs && subs.size > 0) {
    const payload = `event: update\ndata: {"lastUpdated":${snippet.lastUpdated}}\n\n`;
    const closedSubs: Subscriber[] = [];
    
    for (const sub of subs) {
      try { 
        sub.send(payload); 
      } catch (error) {
        // Mark for removal if send fails
        closedSubs.push(sub);
      }
    }
    
    // Remove closed subscribers
    for (const closedSub of closedSubs) {
      subs.delete(closedSub);
    }
  }

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
