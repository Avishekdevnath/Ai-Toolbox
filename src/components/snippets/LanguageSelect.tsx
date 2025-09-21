"use client";
import { languages } from '@/lib/snippetLanguages';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import React from 'react';

interface LanguageSelectProps {
  value: string;
  onChange: (lang: string) => void;
}

export default function LanguageSelect({ value, onChange }: LanguageSelectProps) {
  return (
    <Select value={value} onValueChange={onChange} className="w-48">
      <SelectTrigger className="bg-white border-gray-300 text-black">
        <SelectValue className="text-black">{value}</SelectValue>
      </SelectTrigger>
      <SelectContent className="bg-white border-gray-300">
        {languages.map((lang) => (
          <SelectItem key={lang} value={lang} className="text-black hover:bg-gray-100">{lang}</SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
