'use client';

import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Download, ExternalLink, QrCode } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface QRCodeCardProps {
  petName: string;
  publicId: string;
}

export const QRCodeCard: React.FC<QRCodeCardProps> = ({ petName, publicId }) => {
  const publicUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/pet/${publicId}`
    : `http://localhost:3000/pet/${publicId}`;

  const downloadQR = () => {
    const svg = document.getElementById('pet-qr-svg');
    if (!svg) return;
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    img.onload = () => {
      canvas.width = img.width + 40;
      canvas.height = img.height + 40;
      if (ctx) {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 20, 20);
        const pngFile = canvas.toDataURL('image/png');
        const downloadLink = document.createElement('a');
        downloadLink.download = `${petName.toLowerCase()}-qr-code.png`;
        downloadLink.href = pngFile;
        downloadLink.click();
      }
    };
    img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-xs flex flex-col items-center text-center">
      <div className="flex items-center gap-2 self-start mb-1 text-slate-800 font-extrabold text-base">
        <QrCode className="w-5 h-5 text-brand-coral" />
        <span>{petName}&apos;s QR Code</span>
      </div>
      <p className="text-xs text-slate-500 self-start mb-6">
        Scan this code to preview the public page
      </p>

      {/* QR Display Container */}
      <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-center relative group">
        <QRCodeSVG
          id="pet-qr-svg"
          value={publicUrl}
          size={160}
          bgColor={'#ffffff'}
          fgColor={'#182232'}
          level={'H'}
          includeMargin={true}
          imageSettings={{
            src: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%23EF5DA8"><path d="M12 2a2.5 2.5 0 0 1 2.5 2.5c0 1.38-1.12 2.5-2.5 2.5S9.5 5.88 9.5 4.5 10.62 2 12 2zm-5.5 4a2 2 0 1 1 0 4 2 2 0 0 1 0-4zm11 0a2 2 0 1 1 0 4 2 2 0 0 1 0-4zM4.5 12a2 2 0 1 1 0 4 2 2 0 0 1 0-4zm15 0a2 2 0 1 1 0 4 2 2 0 0 1 0-4zm-7.5-3c3 0 6 2.5 6 6.5 0 2.5-2 4.5-4.5 4.5h-3C8 20 6 18 6 15.5c0-4 3-6.5 6-6.5z"/></svg>',
            x: undefined,
            y: undefined,
            height: 32,
            width: 32,
            excavate: true,
          }}
        />
      </div>

      {/* Quick link */}
      <a
        href={`/pet/${publicId}`}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-3 text-xs text-slate-500 hover:text-brand-coral font-medium flex items-center gap-1 transition-colors"
      >
        <span>Preview Public Profile</span>
        <ExternalLink className="w-3 h-3" />
      </a>

      {/* Actions */}
      <div className="w-full mt-5">
        <Button
          onClick={downloadQR}
          variant="primary"
          className="w-full font-bold shadow-md shadow-brand-coral/20"
          icon={<Download className="w-4 h-4" />}
        >
          Download QR Code
        </Button>
      </div>
    </div>
  );
};
