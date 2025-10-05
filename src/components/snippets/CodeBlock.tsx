'use client';

import dynamic from 'next/dynamic';
import React, { useMemo } from 'react';

// Dynamically load the syntax highlighter to avoid increasing the initial bundle size
const SyntaxHighlighter = dynamic(async () => {
  const mod = await import('react-syntax-highlighter');
  const Prism = mod.PrismAsyncLight;
  // Register only common languages to reduce bundle work; others can be added as needed
  try {
    const [{ default: js }, { default: ts }, { default: json }, { default: python }] = await Promise.all([
      import('react-syntax-highlighter/dist/esm/languages/prism/javascript'),
      import('react-syntax-highlighter/dist/esm/languages/prism/typescript'),
      import('react-syntax-highlighter/dist/esm/languages/prism/json'),
      import('react-syntax-highlighter/dist/esm/languages/prism/python'),
    ]);
    // @ts-ignore register is available on PrismAsyncLight
    Prism.registerLanguage('javascript', js);
    // @ts-ignore
    Prism.registerLanguage('typescript', ts);
    // @ts-ignore
    Prism.registerLanguage('json', json);
    // @ts-ignore
    Prism.registerLanguage('python', python);
  } catch {}
  return Prism;
}, { ssr: false });

const CODE_STYLE: any = {
  'code[class*="language-"]': {
    color: '#d4d4d4',
    background: 'transparent',
    fontFamily: 'Consolas, Monaco, "Andale Mono", "Ubuntu Mono", monospace',
    fontSize: '0.875rem',
    textAlign: 'left',
    whiteSpace: 'pre',
    wordSpacing: 'normal',
    wordBreak: 'normal',
    wordWrap: 'normal',
    lineHeight: '1.6',
    MozTabSize: '4',
    OTabSize: '4',
    tabSize: '4',
    WebkitHyphens: 'none',
    MozHyphens: 'none',
    msHyphens: 'none',
    hyphens: 'none'
  },
  'pre[class*="language-"]': {
    color: '#d4d4d4',
    background: 'transparent',
    fontFamily: 'Consolas, Monaco, "Andale Mono", "Ubuntu Mono", monospace',
    fontSize: '0.875rem',
    textAlign: 'left',
    whiteSpace: 'pre',
    wordSpacing: 'normal',
    wordBreak: 'normal',
    wordWrap: 'normal',
    lineHeight: '1.6',
    MozTabSize: '4',
    OTabSize: '4',
    tabSize: '4',
    WebkitHyphens: 'none',
    MozHyphens: 'none',
    msHyphens: 'none',
    hyphens: 'none'
  },
  'token.comment': { color: '#6a9955', fontStyle: 'italic' },
  'token.prolog': { color: '#6a9955' },
  'token.doctype': { color: '#6a9955' },
  'token.cdata': { color: '#6a9955' },
  'token.punctuation': { color: '#d4d4d4' },
  'token.property': { color: '#9cdcfe' },
  'token.tag': { color: '#569cd6' },
  'token.boolean': { color: '#569cd6' },
  'token.number': { color: '#b5cea8' },
  'token.constant': { color: '#4fc1ff' },
  'token.symbol': { color: '#4fc1ff' },
  'token.selector': { color: '#d7ba7d' },
  'token.attr-name': { color: '#92c5f8' },
  'token.string': { color: '#ce9178' },
  'token.char': { color: '#ce9178' },
  'token.builtin': { color: '#4ec9b0' },
  'token.inserted': { color: '#4ec9b0' },
  'token.operator': { color: '#d4d4d4' },
  'token.entity': { color: '#d4d4d4' },
  'token.url': { color: '#ce9178' },
  'token.variable': { color: '#d4d4d4' },
  'token.atrule': { color: '#ce9178' },
  'token.attr-value': { color: '#ce9178' },
  'token.function': { color: '#dcdcaa' },
  'token.class-name': { color: '#4ec9b0' },
  'token.keyword': { color: '#569cd6' },
  'token.regex': { color: '#d16969' },
  'token.important': { color: '#569cd6', fontWeight: 'bold' },
  'token.bold': { fontWeight: 'bold' },
  'token.italic': { fontStyle: 'italic' }
};

const CODE_CUSTOM_STYLE: any = {
  margin: 0,
  background: 'transparent',
  padding: '1.5rem',
  fontSize: '0.875rem',
  lineHeight: '1.6'
};

export interface CodeBlockProps {
  code: string;
  language: string;
  className?: string;
}

export default function CodeBlock({ code, language, className }: CodeBlockProps) {
  const style = CODE_STYLE;
  const customStyle = CODE_CUSTOM_STYLE;
  return (
    <div className={className}>
      <SyntaxHighlighter
        language={language}
        PreTag="div"
        style={style}
        customStyle={customStyle}
        wrapLines
        showLineNumbers
        lineNumberStyle={{
          color: '#6b7280',
          marginRight: '1rem',
          userSelect: 'none'
        }}
      >
        {code}
      </SyntaxHighlighter>
    </div>
  );
}