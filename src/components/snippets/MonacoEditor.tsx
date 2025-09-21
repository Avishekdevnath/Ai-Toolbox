"use client";
import dynamic from 'next/dynamic';
import React from 'react';

const Monaco = dynamic(() => import('@uiw/react-monacoeditor').then(m => m.default), {
  ssr: false,
});

interface MonacoEditorProps {
  language: string;
  value: string;
  onChange: (val: string) => void;
  height?: number | string;
}

export default function MonacoEditor({ language, value, onChange, height = 400 }: MonacoEditorProps) {
  return (
    <Monaco
      language={language}
      value={value}
      theme="vs-dark"
      options={{ minimap: { enabled: false } }}
      height={height}
      onChange={(val = '') => onChange(val)}
    />
  );
}
