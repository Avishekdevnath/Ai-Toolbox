"use client";
import dynamic from 'next/dynamic';
import React from 'react';
import type { EditorTheme } from '@/lib/editorTheme';

function configureMonacoWorkers() {
  if (typeof window === 'undefined' || (window as any).__monacoWorkersConfigured) return;
  (window as any).__monacoWorkersConfigured = true;
  (window as any).MonacoEnvironment = {
    getWorker(_: string, label: string) {
      if (label === 'typescript' || label === 'javascript') {
        return new Worker(
          new URL('monaco-editor/esm/vs/language/typescript/ts.worker', import.meta.url)
        );
      }
      return new Worker(
        new URL('monaco-editor/esm/vs/editor/editor.worker', import.meta.url)
      );
    },
  };
}

const Monaco = dynamic(
  () => {
    configureMonacoWorkers();
    return import('@uiw/react-monacoeditor').then((m) => m.default);
  },
  { ssr: false }
);

export interface MonacoEditorProps {
  language: string;
  defaultValue: string;
  theme?: EditorTheme;
  onChange?: (val: string) => void;
  onMount?: (editor: any) => void;
  height?: number | string;
}

function MonacoEditorInner({
  language,
  defaultValue,
  theme = 'dark',
  onChange,
  onMount,
  height = '100%',
}: MonacoEditorProps) {
  const monacoTheme = theme === 'light' ? 'vs' : 'vs-dark';

  return (
    <Monaco
      language={language}
      defaultValue={defaultValue}
      theme={monacoTheme}
      options={{
        minimap: { enabled: false },
        scrollBeyondLastLine: false,
        automaticLayout: true,
        fontSize: 13.5,
        fontFamily: '"JetBrains Mono", "Fira Code", "Cascadia Code", Consolas, "Courier New", monospace',
        fontLigatures: true,
        lineHeight: 22,
        letterSpacing: 0.3,
        padding: { top: 16, bottom: 16 },
        wordWrap: 'off',
        tabSize: 2,
        insertSpaces: true,
        renderWhitespace: 'selection',
        smoothScrolling: true,
        cursorBlinking: 'smooth',
        cursorSmoothCaretAnimation: 'on',
        lineNumbers: 'on',
        glyphMargin: false,
        folding: true,
        lineDecorationsWidth: 8,
        lineNumbersMinChars: 3,
        renderLineHighlight: 'gutter',
        scrollbar: {
          verticalScrollbarSize: 6,
          horizontalScrollbarSize: 6,
          useShadows: false,
        },
        overviewRulerBorder: false,
        hideCursorInOverviewRuler: true,
        bracketPairColorization: { enabled: true },
        guides: { bracketPairs: true },
      }}
      height={height}
      editorDidMount={(editor, monaco) => {
        // Disable TS/JS diagnostics — this is a code-sharing tool, not a compiler.
        // Monaco's language service validates ALL models by default (including C, Python, etc.)
        monaco.languages.typescript.javascriptDefaults.setDiagnosticsOptions({
          noSemanticValidation: true,
          noSyntaxValidation: true,
        });
        monaco.languages.typescript.typescriptDefaults.setDiagnosticsOptions({
          noSemanticValidation: true,
          noSyntaxValidation: true,
        });

        onMount?.(editor);

        editor.onDidChangeModelContent(() => {
          onChange?.(editor.getValue());
        });
      }}
    />
  );
}

const MonacoEditor = dynamic(() => Promise.resolve(MonacoEditorInner), {
  ssr: false,
  loading: () => (
    <div className="flex-1 flex items-center justify-center bg-[#1e1e1e]">
      <div className="flex flex-col items-center gap-3">
        <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
        <span className="text-xs text-gray-600">Loading editor…</span>
      </div>
    </div>
  ),
});

export default MonacoEditor;
