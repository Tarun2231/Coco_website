import React from 'react';
import { getCurrentUser } from '@/lib/auth';
import { db } from '@/lib/db';
import { redirect } from 'next/navigation';
import { FileText, Download, ExternalLink, ShieldCheck } from 'lucide-react';
import { formatDate } from '@/lib/utils';

export const revalidate = 0;

export default async function DocumentsPage() {
  const user = await getCurrentUser();
  if (!user) redirect('/login');

  const pet = await db.pet.findFirst({
    where: { userId: user.id },
    include: { documents: { orderBy: { uploadedAt: 'desc' } } },
  });

  if (!pet) return <div>No pets found.</div>;

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Pet Document Vault</h1>
          <p className="text-sm text-slate-500 font-medium">Store vaccination certificates, medical records, insurance policies & municipal licenses</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {pet.documents.map((doc) => (
          <div
            key={doc.id}
            className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex items-start justify-between gap-4 hover:shadow-md transition-all"
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                <FileText className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-blue-700 uppercase tracking-widest bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
                  {doc.category}
                </span>
                <h4 className="text-base font-extrabold text-slate-900 leading-tight">{doc.title}</h4>
                <p className="text-xs text-slate-500 font-medium">
                  Uploaded: {formatDate(doc.uploadedAt)} • {doc.fileSize || '1.2 MB'}
                </p>
              </div>
            </div>

            <a
              href={doc.fileUrl}
              target="_blank"
              rel="noreferrer"
              className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
              title="Download Document"
            >
              <Download className="w-4 h-4" />
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}
