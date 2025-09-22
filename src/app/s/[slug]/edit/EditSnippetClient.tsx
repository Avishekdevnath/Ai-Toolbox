'use client';

import useToolTracking from '@/hooks/useToolTracking';
import SnippetEditor from '@/components/snippets/SnippetEditor';

export default function EditSnippetClient({ snippet }: { snippet: any }) {
  useToolTracking('code-share', 'Code Share', 'view');
  return (
    <SnippetEditor
      initialData={{
        slug: snippet.slug,
        title: snippet.title,
        language: snippet.language,
        content: snippet.content,
        isPublic: snippet.isPublic
      }}
      isNew={false}
    />
  );
}


