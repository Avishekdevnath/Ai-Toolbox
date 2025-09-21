"use client";
import { Button } from '@/components/ui/button';
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
  if (reports.length === 0) return <div>No reports 🎉</div>;
  return (
    <table className="w-full text-sm border-collapse">
      <thead>
        <tr className="border-b">
          <th className="text-left py-2">Snippet</th>
          <th className="text-left py-2">Reason</th>
          <th className="text-left py-2">Reporter IP</th>
          <th className="text-left py-2">Actions</th>
        </tr>
      </thead>
      <tbody>
        {reports.map((r) => (
          <tr key={r.id} className="border-b hover:bg-gray-50">
            <td className="py-2 underline text-blue-600">
              <Link href={`/s/${r.snippetSlug}`}>{r.snippetSlug}</Link>
            </td>
            <td className="py-2">{r.reason}</td>
            <td className="py-2">{r.reporterIp}</td>
            <td className="py-2 flex gap-2">
              <Button size="sm" onClick={() => onHide(r.id)}>Hide</Button>
              <Button variant="outline" size="sm" onClick={() => onDelete(r.snippetSlug)}>Delete</Button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
