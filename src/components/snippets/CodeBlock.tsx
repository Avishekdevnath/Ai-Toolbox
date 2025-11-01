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
  wordWrap?: boolean;
}

export default function CodeBlock({ code, language, className, wordWrap = false }: CodeBlockProps) {
  // Create dynamic style based on wordWrap
  const dynamicStyle = useMemo(() => {
    const baseStyle = { ...CODE_STYLE };
    
    if (wordWrap) {
      // For word wrap: preserve whitespace but allow wrapping at natural break points
      return {
        ...baseStyle,
        'code[class*="language-"]': {
          ...baseStyle['code[class*="language-"]'],
          whiteSpace: 'pre-wrap',
          wordBreak: 'normal', // Don't break words aggressively
          overflowWrap: 'anywhere', // Only break when absolutely necessary
          hyphens: 'auto', // Add hyphens when breaking long words
        },
        'pre[class*="language-"]': {
          ...baseStyle['pre[class*="language-"]'],
          whiteSpace: 'pre-wrap',
          wordBreak: 'normal',
          overflowWrap: 'anywhere',
          hyphens: 'auto',
        },
      };
    } else {
      // For no wrap: preserve exact formatting
      return {
        ...baseStyle,
        'code[class*="language-"]': {
          ...baseStyle['code[class*="language-"]'],
          whiteSpace: 'pre',
          wordBreak: 'normal',
          overflowWrap: 'normal',
        },
        'pre[class*="language-"]': {
          ...baseStyle['pre[class*="language-"]'],
          whiteSpace: 'pre',
          wordBreak: 'normal',
          overflowWrap: 'normal',
        },
      };
    }
  }, [wordWrap]);

  const customStyle = useMemo(() => ({
    ...CODE_CUSTOM_STYLE,
    whiteSpace: wordWrap ? 'pre-wrap' : 'pre',
    wordBreak: 'normal', // Always normal, let overflowWrap handle breaking
    overflowWrap: wordWrap ? 'anywhere' : 'normal',
    hyphens: wordWrap ? 'auto' : 'manual',
    margin: 0, // Remove default margins
    padding: 0, // Remove default padding
  }), [wordWrap]);

  // Split code into lines for custom line numbering
  const lines = code.split('\n');
  
  return (
    <div className={`${className} code-block-container`} style={{
      display: 'flex',
      position: 'relative',
      fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Consolas, "Liberation Mono", Menlo, monospace',
    }}>
      <style jsx>{`
        .code-block-container {
          background: #0a0a0a;
          border-radius: 0;
        }
        
        .line-numbers {
          background: #0a0a0a;
          color: #6b7280;
          padding: 0.75em 1rem 0.75em 0;
          user-select: none;
          text-align: right;
          min-width: 3rem;
          flex-shrink: 0;
          border-right: 1px solid #1f2937;
        }
        
        .code-content {
          flex: 1;
          overflow: ${wordWrap ? 'visible' : 'auto'};
          padding: 0.75em 0;
        }
        
        .code-content :global(pre) {
          margin: 0;
          padding: 0;
          background: transparent;
          font-size: inherit;
          line-height: inherit;
        }
        
        .code-content :global(code) {
          background: transparent;
          padding: 0;
          font-size: inherit;
          line-height: inherit;
        }
      `}</style>
      
      {/* Custom Line Numbers */}
      <div className="line-numbers">
        {lines.map((_, index) => (
          <div key={index} style={{
            lineHeight: '1.5em',
            height: wordWrap ? 'auto' : '1.5em',
            minHeight: '1.5em',
          }}>
            {index + 1}
          </div>
        ))}
      </div>
      
      {/* Code Content */}
      <div className="code-content">
        <SyntaxHighlighter
          language={language}
          PreTag="div"
          style={dynamicStyle}
          customStyle={customStyle}
          wrapLines={false}
          wrapLongLines={false}
          showLineNumbers={false} // Disable built-in line numbers
        >
          {code}
        </SyntaxHighlighter>
      </div>
    </div>
  );
}