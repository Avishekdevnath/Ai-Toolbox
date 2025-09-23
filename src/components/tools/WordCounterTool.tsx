'use client';

import { useState, useEffect } from 'react';

export default function WordCounterTool() {
  const [text, setText] = useState('');
  const [results, setResults] = useState({
    characters: 0,
    charactersNoSpaces: 0,
    words: 0,
    sentences: 0,
    paragraphs: 0,
    readingTime: 0,
    readabilityScore: 0,
    readabilityLevel: ''
  });

  const analyzeText = (inputText: string) => {
    if (!inputText.trim()) {
      setResults({
        characters: 0,
        charactersNoSpaces: 0,
        words: 0,
        sentences: 0,
        paragraphs: 0,
        readingTime: 0,
        readabilityScore: 0,
        readabilityLevel: ''
      });
      return;
    }

    // Basic counts
    const characters = inputText.length;
    const charactersNoSpaces = inputText.replace(/\s/g, '').length;
    const words = inputText.trim().split(/\s+/).filter(word => word.length > 0).length;
    const sentences = inputText.split(/[.!?]+/).filter(s => s.trim().length > 0).length;
    const paragraphs = inputText.split(/\n\s*\n/).filter(p => p.trim().length > 0).length;

    // Reading time (average 200 words per minute)
    const readingTime = Math.ceil(words / 200);

    // Simple readability score (Flesch Reading Ease approximation)
    const avgWordsPerSentence = sentences > 0 ? words / sentences : 0;
    const avgSyllablesPerWord = estimateSyllables(inputText, words);
    
    const readabilityScore = Math.max(0, Math.min(100, 
      206.835 - (1.015 * avgWordsPerSentence) - (84.6 * avgSyllablesPerWord)
    ));

    const readabilityLevel = getReadabilityLevel(readabilityScore);

    setResults({
      characters,
      charactersNoSpaces,
      words,
      sentences,
      paragraphs,
      readingTime,
      readabilityScore: Math.round(readabilityScore),
      readabilityLevel
    });
  };

  const estimateSyllables = (text: string, wordCount: number): number => {
    if (wordCount === 0) return 0;
    
    const words = text.toLowerCase().split(/\s+/).filter(word => word.length > 0);
    let totalSyllables = 0;

    words.forEach(word => {
      // Remove punctuation
      word = word.replace(/[^a-z]/g, '');
      if (word.length === 0) return;

      // Count vowel groups
      let syllables = word.match(/[aeiouy]+/g)?.length || 0;
      
      // Adjust for silent e
      if (word.endsWith('e')) syllables--;
      
      // Ensure at least 1 syllable per word
      syllables = Math.max(1, syllables);
      
      totalSyllables += syllables;
    });

    return totalSyllables / wordCount;
  };

  const getReadabilityLevel = (score: number): string => {
    if (score >= 90) return 'Very Easy';
    if (score >= 80) return 'Easy';
    if (score >= 70) return 'Fairly Easy';
    if (score >= 60) return 'Standard';
    if (score >= 50) return 'Fairly Difficult';
    if (score >= 30) return 'Difficult';
    return 'Very Difficult';
  };

  const getReadabilityColor = (score: number): string => {
    if (score >= 70) return 'green';
    if (score >= 50) return 'yellow';
    return 'red';
  };

  useEffect(() => {
    analyzeText(text);
    
    // Track text analysis when text is provided
    if (text.trim()) {
      try {
        fetch('/api/tools/word-counter/track-usage', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ usageType: 'generate' })
        });
      } catch (error) {
        console.error('Failed to track usage:', error);
      }
    }
  }, [text]);

  const clearText = () => {
    setText('');
  };

  const sampleTexts = [
    {
      name: 'Simple Text',
      text: 'This is a simple text. It has short sentences. It is easy to read. Most people will understand it quickly.'
    },
    {
      name: 'Complex Text',
      text: 'Notwithstanding the considerable complexity inherent in contemporary technological implementations, the fundamental principles underlying computational methodologies remain accessible to individuals possessing requisite educational backgrounds and intellectual capabilities.'
    },
    {
      name: 'Lorem Ipsum',
      text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.'
    }
  ];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Input Section */}
        <div className="space-y-6">
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Text to Analyze
              </label>
              <button
                onClick={clearText}
                disabled={!text}
                className="text-sm text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Clear
              </button>
            </div>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Type or paste your text here to analyze word count, readability, and get detailed statistics..."
              className="w-full h-64 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white resize-none"
            />
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Sample Texts:
            </h3>
            <div className="space-y-2">
              {sampleTexts.map((sample, index) => (
                <button
                  key={index}
                  onClick={() => setText(sample.text)}
                  className="w-full text-left px-3 py-2 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  {sample.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Results Section */}
        <div className="space-y-6">
          {/* Basic Statistics */}
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Text Statistics
            </h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-white dark:bg-gray-800 rounded-lg">
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {results.words.toLocaleString()}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Words
                </div>
              </div>
              
              <div className="text-center p-3 bg-white dark:bg-gray-800 rounded-lg">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {results.characters.toLocaleString()}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Characters
                </div>
              </div>
              
              <div className="text-center p-3 bg-white dark:bg-gray-800 rounded-lg">
                <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                  {results.sentences.toLocaleString()}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Sentences
                </div>
              </div>
              
              <div className="text-center p-3 bg-white dark:bg-gray-800 rounded-lg">
                <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                  {results.paragraphs.toLocaleString()}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Paragraphs
                </div>
              </div>
            </div>
          </div>

          {/* Additional Stats */}
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Additional Information
            </h3>
            
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Characters (no spaces):</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {results.charactersNoSpaces.toLocaleString()}
                </span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Average words per sentence:</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {results.sentences > 0 ? Math.round((results.words / results.sentences) * 10) / 10 : 0}
                </span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Reading time:</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {results.readingTime} min
                </span>
              </div>
            </div>
          </div>

          {/* Readability Score */}
          {results.words > 0 && (
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Readability Analysis
              </h3>
              
              <div className="text-center mb-4">
                <div className={`text-3xl font-bold text-${getReadabilityColor(results.readabilityScore)}-600 dark:text-${getReadabilityColor(results.readabilityScore)}-400`}>
                  {results.readabilityScore}/100
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Flesch Reading Ease Score
                </div>
                <div className={`text-lg font-medium text-${getReadabilityColor(results.readabilityScore)}-600 dark:text-${getReadabilityColor(results.readabilityScore)}-400 mt-2`}>
                  {results.readabilityLevel}
                </div>
              </div>
              
              <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-600">
                <div
                  className={`bg-${getReadabilityColor(results.readabilityScore)}-600 h-2 rounded-full transition-all duration-300`}
                  style={{ width: `${results.readabilityScore}%` }}
                ></div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Information */}
      <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
        <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-2">
          📖 About Readability:
        </h3>
        <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
          <li>• <strong>90-100:</strong> Very Easy - 5th grade level</li>
          <li>• <strong>80-89:</strong> Easy - 6th grade level</li>
          <li>• <strong>70-79:</strong> Fairly Easy - 7th grade level</li>
          <li>• <strong>60-69:</strong> Standard - 8th & 9th grade level</li>
          <li>• <strong>50-59:</strong> Fairly Difficult - 10th to 12th grade level</li>
          <li>• <strong>30-49:</strong> Difficult - College level</li>
          <li>• <strong>0-29:</strong> Very Difficult - Graduate level</li>
        </ul>
      </div>
    </div>
  );
} 