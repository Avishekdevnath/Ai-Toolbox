import { notFound } from 'next/navigation';
import { connectToDatabase } from '@/lib/mongodb';
import { getCodeSnippetModel } from '@/models/CodeSnippetModel';
import ViewerShell from '@/components/snippets/ViewerShell';

export const dynamic = 'force-dynamic';

interface SnippetData {
  slug: string;
  title?: string;
  language: string;
  content: string;
  isPublic: boolean;
  viewCount: number;
}

export default async function PublicSnippetPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  await connectToDatabase();
  const Snippet = await getCodeSnippetModel();

  const snippet = await Snippet.findOne({ slug, isPublic: true }).lean<SnippetData>();
  if (!snippet) notFound();

  // Increment view count — fire-and-forget, non-blocking
  Snippet.updateOne({ slug }, { $inc: { viewCount: 1 } })
    .exec()
    .catch(() => {});

  return (
    <ViewerShell
      slug={snippet.slug}
      title={snippet.title}
      language={snippet.language}
      viewCount={snippet.viewCount}
      content={snippet.content}
    />
  );
}
