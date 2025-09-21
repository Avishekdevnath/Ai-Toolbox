'use client';

import dynamic from 'next/dynamic';
import React from 'react';

// Dynamically load the syntax highlighter to avoid increasing the initial bundle size
const SyntaxHighlighter = dynamic(() => import('react-syntax-highlighter').then(m => m.PrismAsyncLight), {
  ssr: false,
});

export interface CodeBlockProps {
  code: string;
  language: string;
  className?: string;
}

export default function CodeBlock({ code, language, className }: CodeBlockProps) {
  return (
    <div className={className}>
      <SyntaxHighlighter
        language={language}
        PreTag="div"
        style={{
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
          'token.comment': {
            color: '#6a9955',
            fontStyle: 'italic'
          },
          'token.prolog': {
            color: '#6a9955'
          },
          'token.doctype': {
            color: '#6a9955'
          },
          'token.cdata': {
            color: '#6a9955'
          },
          'token.punctuation': {
            color: '#d4d4d4'
          },
          'token.property': {
            color: '#9cdcfe'
          },
          'token.tag': {
            color: '#569cd6'
          },
          'token.boolean': {
            color: '#569cd6'
          },
          'token.number': {
            color: '#b5cea8'
          },
          'token.constant': {
            color: '#4fc1ff'
          },
          'token.symbol': {
            color: '#4fc1ff'
          },
          'token.selector': {
            color: '#d7ba7d'
          },
          'token.attr-name': {
            color: '#92c5f8'
          },
          'token.string': {
            color: '#ce9178'
          },
          'token.char': {
            color: '#ce9178'
          },
          'token.builtin': {
            color: '#4ec9b0'
          },
          'token.inserted': {
            color: '#4ec9b0'
          },
          'token.operator': {
            color: '#d4d4d4'
          },
          'token.entity': {
            color: '#d4d4d4'
          },
          'token.url': {
            color: '#ce9178'
          },
          'token.variable': {
            color: '#d4d4d4'
          },
          'token.atrule': {
            color: '#ce9178'
          },
          'token.attr-value': {
            color: '#ce9178'
          },
          'token.function': {
            color: '#dcdcaa'
          },
          'token.class-name': {
            color: '#4ec9b0'
          },
          'token.keyword': {
            color: '#569cd6'
          },
          'token.regex': {
            color: '#d16969'
          },
          'token.important': {
            color: '#569cd6',
            fontWeight: 'bold'
          },
          'token.bold': {
            fontWeight: 'bold'
          },
          'token.italic': {
            fontStyle: 'italic'
          }
        }}
        customStyle={{ 
          margin: 0, 
          background: 'transparent',
          padding: '1.5rem',
          fontSize: '0.875rem',
          lineHeight: '1.6'
        }}
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