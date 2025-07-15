import React from 'react';

type QRInputFormProps = {
  inputText: string;
  setInputText: (text: string) => void;
  size: number;
  setSize: (size: number) => void;
  onGenerate: () => void;
};

const QRInputForm: React.FC<QRInputFormProps> = ({ inputText, setInputText, size, setSize, onGenerate }) => (
  <div className="space-y-6">
    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        Text or URL to convert
      </label>
      <textarea
        value={inputText}
        onChange={e => setInputText(e.target.value)}
        placeholder="Enter text, URL, or any data you want to encode..."
        className="w-full h-32 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
      />
    </div>
    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        QR Code Size: {size}x{size}px
      </label>
      <input
        type="range"
        min="100"
        max="500"
        step="50"
        value={size}
        onChange={e => setSize(Number(e.target.value))}
        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
      />
      <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
        <span>100px</span>
        <span>500px</span>
      </div>
    </div>
    <button
      onClick={onGenerate}
      disabled={!inputText.trim()}
      className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
    >
      Generate QR Code
    </button>
  </div>
);

export default QRInputForm; 