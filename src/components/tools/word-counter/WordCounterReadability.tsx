'use client';

import React from 'react';
import { Gauge } from 'lucide-react';

interface Props {
  score: number;
  level: string;
  hasContent: boolean;
}

const SCALE = [
  { range: '90–100', label: 'Very Easy',       grade: '5th grade',            color: 'bg-emerald-500' },
  { range: '80–89',  label: 'Easy',            grade: '6th grade',            color: 'bg-green-500'   },
  { range: '70–79',  label: 'Fairly Easy',     grade: '7th grade',            color: 'bg-lime-500'    },
  { range: '60–69',  label: 'Standard',        grade: '8th–9th grade',        color: 'bg-yellow-500'  },
  { range: '50–59',  label: 'Fairly Difficult',grade: '10th–12th grade',      color: 'bg-orange-500'  },
  { range: '30–49',  label: 'Difficult',       grade: 'College level',        color: 'bg-red-400'     },
  { range: '0–29',   label: 'Very Difficult',  grade: 'Graduate level',       color: 'bg-red-600'     },
];

function getColor(score: number) {
  if (score >= 70) return { bar: 'bg-emerald-500', text: 'text-emerald-600', ring: '#10b981' };
  if (score >= 50) return { bar: 'bg-amber-500',   text: 'text-amber-600',   ring: '#f59e0b' };
  return              { bar: 'bg-red-500',     text: 'text-red-600',     ring: '#ef4444' };
}

// SVG arc gauge — semi-circle (180°)
function ArcGauge({ score, color }: { score: number; color: string }) {
  const R = 44;
  const cx = 56;
  const cy = 56;
  const circumference = Math.PI * R; // half circumference
  const progress = (score / 100) * circumference;

  // Arc path: semi-circle from left (-x) to right (+x)
  const startX = cx - R;
  const startY = cy;
  const endX = cx + R;
  const endY = cy;

  return (
    <svg width="112" height="66" viewBox="0 0 112 66" className="overflow-visible">
      {/* Track */}
      <path
        d={`M ${startX} ${startY} A ${R} ${R} 0 0 1 ${endX} ${endY}`}
        fill="none"
        stroke="#e2e8f0"
        strokeWidth="8"
        strokeLinecap="round"
      />
      {/* Progress */}
      <path
        d={`M ${startX} ${startY} A ${R} ${R} 0 0 1 ${endX} ${endY}`}
        fill="none"
        stroke={color}
        strokeWidth="8"
        strokeLinecap="round"
        strokeDasharray={`${progress} ${circumference}`}
        style={{ transition: 'stroke-dasharray 0.5s cubic-bezier(0.4,0,0.2,1)' }}
      />
    </svg>
  );
}

export default function WordCounterReadability({ score, level, hasContent }: Props) {
  const colors = getColor(score);

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <div className="w-7 h-7 rounded-lg bg-slate-50 flex items-center justify-center">
          <Gauge size={14} className="text-slate-500" />
        </div>
        <div>
          <p className="text-[12px] font-semibold text-slate-700">Readability</p>
          <p className="text-[10px] text-slate-400">Flesch Reading Ease</p>
        </div>
      </div>

      {hasContent ? (
        <div className="flex items-start gap-5">
          {/* Gauge + score */}
          <div className="flex flex-col items-center shrink-0">
            <div className="relative" style={{ width: 112, height: 66 }}>
              <ArcGauge score={score} color={colors.ring} />
              <div className="absolute bottom-0 left-0 right-0 flex flex-col items-center">
                <span className={`text-2xl font-bold tabular-nums leading-none ${colors.text}`}>
                  {score}
                </span>
                <span className="text-[10px] text-slate-400 mt-0.5">/100</span>
              </div>
            </div>
            <span className={`text-[11px] font-semibold mt-1.5 ${colors.text}`}>{level}</span>
          </div>

          {/* Scale legend */}
          <div className="flex-1 space-y-1 min-w-0">
            {SCALE.map((s) => {
              const isActive = s.label === level;
              return (
                <div
                  key={s.label}
                  className={`flex items-center gap-2 px-2 py-0.5 rounded-md transition-colors duration-100 ${
                    isActive ? 'bg-slate-50 border border-slate-200' : ''
                  }`}
                >
                  <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${isActive ? s.color : 'bg-slate-200'}`} />
                  <span className={`text-[10px] truncate ${isActive ? 'font-semibold text-slate-700' : 'text-slate-400'}`}>
                    {s.range} · {s.label}
                  </span>
                  {isActive && (
                    <span className="text-[9px] text-slate-400 shrink-0 ml-auto">{s.grade}</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-center py-6">
          <p className="text-[12px] text-slate-300">Start typing to see your score</p>
        </div>
      )}
    </div>
  );
}
