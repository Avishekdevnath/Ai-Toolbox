"use client";

import Link from 'next/link';
import React from 'react';

interface Report {
  id: string;
  snippetSlug: string;
  reason: string;
  reporterIp: string;
}

interface ReportTableProps {
  reports: Report[];
  onHide: (id: string) => void;
  onDelete: (slug: string) => void;
}

export default function ReportTable({ reports, onHide, onDelete }: ReportTableProps) {
  if (reports.length === 0) return (
    <div className="text-center py-16">
      <p className="text-[13px] text-slate-400">No reports found. Everything looks clean.</p>
    </div>
  );

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-[13px]">
        <thead className="bg-slate-50">
          <tr>
            <th className="text-left px-5 py-2.5 text-[11px] uppercase tracking-wide text-slate-400 font-medium">Snippet</th>
            <th className="text-left px-5 py-2.5 text-[11px] uppercase tracking-wide text-slate-400 font-medium">Reason</th>
            <th className="text-left px-5 py-2.5 text-[11px] uppercase tracking-wide text-slate-400 font-medium">Reporter IP</th>
            <th className="text-left px-5 py-2.5 text-[11px] uppercase tracking-wide text-slate-400 font-medium">Actions</th>
          </tr>
        </thead>
        <tbody>
          {reports.map(r => (
            <tr key={r.id} className="border-t border-slate-100 hover:bg-slate-50">
              <td className="px-5 py-3">
                <Link href={`/s/${r.snippetSlug}`} className="text-blue-600 hover:underline font-medium">{r.snippetSlug}</Link>
              </td>
              <td className="px-5 py-3 text-slate-600">{r.reason}</td>
              <td className="px-5 py-3 text-slate-500 font-mono text-[12px]">{r.reporterIp}</td>
              <td className="px-5 py-3">
                <div className="flex items-center gap-2">
                  <button onClick={() => onHide(r.id)} className="px-2.5 py-1 bg-blue-600 text-white rounded-md text-[12px] font-medium hover:bg-blue-700">Hide</button>
                  <button onClick={() => onDelete(r.snippetSlug)} className="px-2.5 py-1 border border-red-200 text-red-600 rounded-md text-[12px] font-medium hover:bg-red-50">Delete</button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
