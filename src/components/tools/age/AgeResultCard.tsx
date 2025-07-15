import React from 'react';

interface Props {
  years: number;
  months: number;
  days: number;
  isBirthday: boolean;
  birthdayQuote?: string;
  famousPeople?: string[];
  onCopy: () => void;
}

const AgeResultCard: React.FC<Props> = ({ years, months, days, isBirthday, birthdayQuote, famousPeople, onCopy }) => (
  <div className="w-full max-w-md bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-md p-6 mb-6 text-center relative">
    {isBirthday && (
      <div className="absolute -top-8 left-1/2 -translate-x-1/2 text-4xl animate-bounce">🎉</div>
    )}
    <div className="text-lg font-semibold text-blue-800 dark:text-blue-200 mb-2">Your Age</div>
    <div className="text-3xl font-bold text-blue-700 dark:text-blue-300 mb-2">
      {years} years, {months} months, {days} days
    </div>
    <button
      onClick={onCopy}
      className="px-3 py-1 rounded bg-blue-100 dark:bg-blue-800 text-blue-700 dark:text-blue-200 hover:bg-blue-200 dark:hover:bg-blue-700 transition-colors text-sm font-medium mt-2"
      title="Copy age"
    >
      Copy
    </button>
    {isBirthday && birthdayQuote && (
      <div className="mt-4 text-green-700 dark:text-green-300 italic text-base">{birthdayQuote}</div>
    )}
    {famousPeople && famousPeople.length > 0 && (
      <div className="mt-4 text-purple-700 dark:text-purple-300 text-sm">
        <span className="font-semibold">Famous people born on your birthday:</span>
        <ul className="mt-1 space-y-1">
          {famousPeople.map(name => (
            <li key={name}>🎂 {name}</li>
          ))}
        </ul>
      </div>
    )}
  </div>
);

export default AgeResultCard; 