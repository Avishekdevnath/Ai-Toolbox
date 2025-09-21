interface ProfessionTipsProps {
  profession: string;
  tips: string[];
}

export function ProfessionTips({ profession, tips }: ProfessionTipsProps) {
  if (!profession) return null;

  return (
    <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg mt-6">
      <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-3">
        💡 Income Growth Tips for {profession.charAt(0).toUpperCase() + profession.slice(1)}:
      </h4>
      <ul className="space-y-2">
        {tips.map((tip, index) => (
          <li key={index} className="flex items-start space-x-2">
            <span className="text-blue-600 dark:text-blue-400 mt-1">•</span>
            <span className="text-sm text-blue-900 dark:text-blue-100">{tip}</span>
          </li>
        ))}
      </ul>
    </div>
  );
} 