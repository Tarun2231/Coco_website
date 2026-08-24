import React from 'react';
import { db } from '@/lib/db';
import { formatDate } from '@/lib/utils';
import { ShieldCheck } from 'lucide-react';

export const revalidate = 0;

export default async function AuditLogsPage() {
  const auditLogs = await db.auditLog.findMany({
    take: 20,
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div className="space-y-6 max-w-6xl">
      <div>
        <h1 className="text-2xl font-extrabold text-white flex items-center gap-2">
          <ShieldCheck className="w-6 h-6 text-amber-500" />
          <span>Security Audit Logs</span>
        </h1>
        <p className="text-sm text-slate-400 font-medium">Immutable log of system security events and administrative actions</p>
      </div>

      <div className="bg-slate-950 rounded-3xl p-6 border border-slate-800 space-y-4">
        {auditLogs.length === 0 ? (
          <div className="text-center py-8 text-slate-400 text-xs font-mono">
            [SYS_LOG] System operational. No security violations detected.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse font-mono text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 uppercase">
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-4">Action</th>
                  <th className="py-3 px-4">Entity</th>
                  <th className="py-3 px-4">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-300">
                {auditLogs.map((log) => (
                  <tr key={log.id}>
                    <td className="py-3 px-4 text-slate-400">{formatDate(log.createdAt, 'yyyy-MM-dd HH:mm:ss')}</td>
                    <td className="py-3 px-4 font-bold text-amber-400">{log.action}</td>
                    <td className="py-3 px-4 text-slate-300">{log.entity}</td>
                    <td className="py-3 px-4 text-slate-400">{log.details || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
