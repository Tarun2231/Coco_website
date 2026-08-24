'use client';

import React, { useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { PawPrint, Printer, Download } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import html2canvas from 'html2canvas';

interface PrintableTagCardProps {
  petName: string;
  breed: string;
  phone: string;
  publicId: string;
}

export const PrintableTagCard: React.FC<PrintableTagCardProps> = ({
  petName,
  breed,
  phone,
  publicId,
}) => {
  const cardRef = useRef<HTMLDivElement>(null);

  const publicUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/pet/${publicId}`
    : `http://localhost:3000/pet/${publicId}`;

  const downloadPrintableCard = async () => {
    if (!cardRef.current) return;
    const canvas = await html2canvas(cardRef.current, { scale: 3 });
    const image = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.href = image;
    link.download = `${petName.toLowerCase()}-printable-tag.png`;
    link.click();
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-xs flex flex-col items-center">
      <h3 className="text-base font-extrabold text-slate-800 self-start mb-1">
        Printable Collar Tag & Pet ID Card
      </h3>
      <p className="text-xs text-slate-500 self-start mb-6">
        Print this high-resolution ID tag to attach to {petName}&apos;s collar, harness, or pet card.
      </p>

      {/* Tag Card Viewport */}
      <div
        ref={cardRef}
        className="w-72 bg-gradient-to-br from-slate-900 via-navy-900 to-slate-900 text-white rounded-3xl p-6 shadow-2xl border border-slate-700/50 flex flex-col items-center text-center relative overflow-hidden"
      >
        {/* Accent Paw Background */}
        <PawPrint className="w-40 h-40 absolute -bottom-10 -right-10 text-white/5 pointer-events-none" />

        <div className="flex items-center gap-2 mb-3">
          <div className="w-7 h-7 rounded-xl bg-brand-coral flex items-center justify-center">
            <PawPrint className="w-4 h-4 text-white fill-current" />
          </div>
          <span className="font-extrabold text-base tracking-tight">PUPPY ID</span>
        </div>

        <div className="text-[10px] font-bold text-slate-300 uppercase tracking-widest bg-slate-800/80 px-3 py-1 rounded-full border border-slate-700 mb-4">
          Scan to help me get home
        </div>

        {/* QR Code Container */}
        <div className="p-3 bg-white rounded-2xl shadow-lg mb-4">
          <QRCodeSVG
            value={publicUrl}
            size={130}
            bgColor={'#ffffff'}
            fgColor={'#182232'}
            level={'H'}
          />
        </div>

        <div className="font-black text-xl text-white tracking-tight">{petName}</div>
        <div className="text-xs font-semibold text-brand-coral mb-2">{breed}</div>
        <div className="text-[11px] text-slate-300 font-mono">CALL: {phone}</div>
      </div>

      <div className="flex items-center gap-3 w-full mt-6">
        <Button
          onClick={downloadPrintableCard}
          variant="primary"
          className="flex-1 font-bold"
          icon={<Download className="w-4 h-4" />}
        >
          Download Tag PNG
        </Button>
        <Button
          onClick={() => window.print()}
          variant="outline"
          className="font-bold"
          icon={<Printer className="w-4 h-4" />}
        >
          Print Tag
        </Button>
      </div>
    </div>
  );
};
