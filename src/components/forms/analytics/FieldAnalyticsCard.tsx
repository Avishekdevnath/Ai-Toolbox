'use client';

interface FieldData {
  type: string;
  label: string;
  counts?: Record<string, number>;
  average?: number;
  min?: number;
  max?: number;
  samples?: string[];
}

interface FieldAnalyticsCardProps {
  field: { id: string; type: string; label: string; options: string[] };
  data: FieldData;
  totalResponses: number;
}

function BarChart({ options, counts, totalResponses }: {
  options: string[];
  counts: Record<string, number>;
  totalResponses: number;
}) {
  // Use provided options list (from form definition) to show all options including zero-count ones.
  // Fall back to keys in counts if options is empty (e.g. rating fields where options aren't predefined).
  const keys = options.length > 0
    ? options
    : Object.keys(counts).sort((a, b) => (counts[b] ?? 0) - (counts[a] ?? 0));

  const max = Math.max(...keys.map(k => counts[k] ?? 0), 1);

  return (
    <div className="space-y-2 mt-3">
      {keys.map(option => {
        const count = counts[option] ?? 0;
        const pct = totalResponses > 0 ? Math.round((count / totalResponses) * 100) : 0;
        const barWidth = Math.round((count / max) * 100);
        return (
          <div key={option} className="flex items-center gap-3 text-[13px]">
            <span className="w-32 shrink-0 truncate text-slate-600" title={option}>{option}</span>
            <div className="flex-1 bg-slate-100 rounded-full h-5 overflow-hidden">
              <div
                className="bg-blue-500 h-5 rounded-full transition-all duration-300"
                style={{ width: `${barWidth}%` }}
              />
            </div>
            <span className="w-16 text-right text-slate-500 shrink-0">{count} ({pct}%)</span>
          </div>
        );
      })}
    </div>
  );
}

export default function FieldAnalyticsCard({ field, data, totalResponses }: FieldAnalyticsCardProps) {
  const fieldTotalResponses = data.counts
    ? Object.values(data.counts).reduce((sum, n) => sum + n, 0)
    : totalResponses;

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5">
      <div className="flex items-start justify-between gap-2 mb-1">
        <p className="text-[14px] font-semibold text-slate-800">{data.label}</p>
        <span className="text-[12px] text-slate-400 shrink-0">{fieldTotalResponses} responses</span>
      </div>

      {/* Choice fields: radio, dropdown, single_select, checkbox */}
      {['radio', 'dropdown', 'single_select', 'checkbox'].includes(data.type) && data.counts && (
        <BarChart
          options={field.options}
          counts={data.counts}
          totalResponses={totalResponses}
        />
      )}

      {/* Rating / scale fields */}
      {['rating', 'scale'].includes(data.type) && data.counts && (
        <>
          <p className="text-[28px] font-bold text-slate-800 mt-2">
            {data.average ?? 0}
            <span className="text-[16px] font-normal text-slate-400 ml-1">avg</span>
          </p>
          <BarChart
            options={Object.keys(data.counts).sort((a, b) => Number(b) - Number(a))}
            counts={data.counts}
            totalResponses={totalResponses}
          />
        </>
      )}

      {/* Number fields */}
      {data.type === 'number' && (
        <div className="flex gap-6 mt-3">
          <div className="text-center">
            <p className="text-[22px] font-bold text-slate-800">{data.average ?? 0}</p>
            <p className="text-[11px] text-slate-400 uppercase tracking-wide">Average</p>
          </div>
          <div className="text-center">
            <p className="text-[22px] font-bold text-slate-800">{data.min ?? 0}</p>
            <p className="text-[11px] text-slate-400 uppercase tracking-wide">Min</p>
          </div>
          <div className="text-center">
            <p className="text-[22px] font-bold text-slate-800">{data.max ?? 0}</p>
            <p className="text-[11px] text-slate-400 uppercase tracking-wide">Max</p>
          </div>
        </div>
      )}

      {/* Text / email / date / time fields */}
      {['short_text', 'long_text', 'email', 'date', 'time'].includes(data.type) && (
        <div className="mt-3 space-y-2">
          {data.samples && data.samples.length > 0 ? (
            data.samples.map((sample, i) => (
              <p
                key={i}
                className="text-[13px] text-slate-600 bg-slate-50 rounded-lg px-3 py-2 break-words"
              >
                {sample}
              </p>
            ))
          ) : (
            <p className="text-[13px] text-slate-400 italic">No responses yet</p>
          )}
        </div>
      )}
    </div>
  );
}
