import { getCodeSnippetModel } from '@/models/CodeSnippetModel';
import { notFound } from 'next/navigation';
import EditSnippetClient from './EditSnippetClient';

interface EditPageProps {
  params: {
    slug: string;
  };
}

export default async function EditSnippetPage({ params }: EditPageProps) {
  const { slug } = await params;
  
  try {
    const CodeSnippet = await getCodeSnippetModel();
    const snippet = await CodeSnippet.findOne({ slug }).lean();
    
    if (!snippet) {
      notFound();
    }

    // Pass only serializable fields to the client
    return (
      <EditSnippetClient
        initialData={{
          slug: String(snippet.slug),
          title: snippet.title ?? '',
          language: String(snippet.language ?? 'javascript'),
          content: String(snippet.content ?? ''),
          isPublic: Boolean(snippet.isPublic),
        }}
        isNew={false}
      />
    );
  } catch (error) {
    console.error('Error fetching snippet:', error);
    notFound();
  }
}
