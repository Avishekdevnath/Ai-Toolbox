'use client';

import useToolTracking from '@/hooks/useToolTracking';
import SnippetEditor, { SnippetEditorProps } from '@/components/snippets/SnippetEditor';

export default function EditSnippetClient(props: Pick<SnippetEditorProps, 'initialData' | 'isNew'>) {
  useToolTracking('code-share', 'Code Share', 'view');
  return (
    <SnippetEditor {...props} />
  );
}


