"use client";
import { Share2, RotateCcw } from 'lucide-react';

interface QuizEndScreenProps {
  score: number;
  maxScore: number;
  breakdown: { label: string; correct: boolean; explanation?: string }[];
  allowRetake: boolean;
  onRetake: () => void;
}

export default function QuizEndScreen({ score, maxScore, breakdown, allowRetake, onRetake }: QuizEndScreenProps) {
  const pct = maxScore === 0 ? 0 : Math.round((score / maxScore) * 100);

  const handleShare = () => {
    const text = `I scored ${score}/${maxScore} (${pct}%) on this quiz!`;
    if (navigator.share) {
      navigator.share({ text, url: window.location.href });
    } else {
      navigator.clipboard.writeText(`${text} ${window.location.href}`);
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="max-w-[480px] w-full text-center">
        <div className="w-24 h-24 rounded-full bg-blue-50 flex items-center justify-center mx-auto mb-4">
          <span className="text-3xl font-bold text-blue-600">{pct}%</span>
        </div>
        <h2 className="text-xl font-semibold text-slate-800 mb-1">
          You scored {score}/{maxScore}
        </h2>
        <p className="text-[14px] text-slate-500 mb-8">
          {pct >= 70 ? 'Great job!' : pct >= 50 ? 'Good effort!' : 'Keep practising!'}
        </p>

        <div className="text-left space-y-2 mb-8">
          {breakdown.map((item, i) => (
            <div key={i} className={`flex items-start gap-3 p-3 rounded-xl ${item.correct ? 'bg-green-50' : 'bg-red-50'}`}>
              <span className={`text-lg ${item.correct ? 'text-green-500' : 'text-red-500'}`}>
                {item.correct ? '✓' : '✗'}
              </span>
              <div>
                <p className="text-[13px] font-medium text-slate-700">{item.label}</p>
                {item.explanation && <p className="text-[12px] text-slate-500 mt-0.5">{item.explanation}</p>}
              </div>
            </div>
          ))}
        </div>

        <div className="flex gap-3 justify-center">
          {allowRetake && (
            <button
              onClick={onRetake}
              className="flex items-center gap-2 px-5 py-2.5 border border-slate-200 rounded-xl text-[14px] text-slate-600 hover:bg-slate-50"
            >
              <RotateCcw size={15} /> Retake
            </button>
          )}
          <button
            onClick={handleShare}
            className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl text-[14px] hover:bg-blue-700"
          >
            <Share2 size={15} /> Share Score
          </button>
        </div>
      </div>
    </div>
  );
}
