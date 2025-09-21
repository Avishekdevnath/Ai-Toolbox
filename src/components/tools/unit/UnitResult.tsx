import React from 'react';

interface Props {
  result: string;
}

const UnitResult: React.FC<Props> = ({ result }) => {
  const handleCopy = () => {
    if (result) {
      navigator.clipboard.writeText(result);
    }
  };
  return (
    <div className="flex items-center gap-2 mt-4">
      <div className="text-2xl font-semibold text-blue-700 dark:text-blue-300">{result}</div>
      {result && (
        <button
          onClick={handleCopy}
          className="ml-2 px-2 py-1 rounded bg-blue-100 dark:bg-blue-800 text-blue-700 dark:text-blue-200 hover:bg-blue-200 dark:hover:bg-blue-700 transition-colors text-sm"
          title="Copy result"
        >
          Copy
        </button>
      )}
    </div>
  );
};

export default UnitResult; 