'use client';

import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Download, ExternalLink, QrCode, AlertTriangle, CheckCircle, Dog, Shield, MapPin } from 'lucide-react';
import Link from 'next/link';
import { getPetPublicUrl } from '@/lib/qr';
import { Button } from '@/components/ui/Button';

interface AdminPetsClientProps {
  initialPets: any[];
}

export const AdminPetsClient: React.FC<AdminPetsClientProps> = ({ initialPets }) => {
  const [pets, setPets] = useState<any[]>(initialPets);

  const toggleLostStatus = async (petId: string, currentStatus: boolean) => {
    try {
      const res = await fetch(`/api/pets/${petId}/lost`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isLost: !currentStatus }),
      });

      if (res.ok) {
        setPets((prev) =>
          prev.map((p) => (p.id === petId ? { ...p, isLost: !currentStatus } : p))
        );
      }
    } catch (err) {
      console.error('Failed to toggle lost mode:', err);
    }
  };

  const downloadQR = (petName: string, svgId: string) => {
    const svg = document.getElementById(svgId);
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
    <div className="space-y-6 max-w-6xl animate-fadeIn">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white flex items-center gap-2">
            <Dog className="w-6 h-6 text-amber-500" />
            <span>Admin Multi-Dog & Separate QR Code Registry</span>
          </h1>
          <p className="text-sm text-slate-400 font-medium">
            Manage your dogs, generate separate unique QR codes, and control emergency Lost Mode
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {pets.map((pet) => {
          const publicUrl = getPetPublicUrl(pet.publicId);
          const svgId = `admin-qr-${pet.id}`;

          return (
            <div
              key={pet.id}
              className={`bg-slate-950 rounded-3xl p-6 border flex flex-col justify-between space-y-4 hover:border-amber-500/50 transition-all ${
                pet.isLost ? 'border-rose-500/50 bg-rose-950/10' : 'border-slate-800'
              }`}
            >
              <div>
                {/* Dog Header */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div className="flex items-center gap-3">
                    <img
                      src={pet.photo || 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=400'}
                      alt={pet.name}
                      className="w-12 h-12 rounded-full object-cover shrink-0 border-2 border-slate-700"
                    />
                    <div>
                      <h3 className="font-extrabold text-white text-lg leading-tight">{pet.name}</h3>
                      <p className="text-xs text-amber-500 font-semibold">{pet.breed}</p>
                    </div>
                  </div>

                  <button
                    onClick={() => toggleLostStatus(pet.id, pet.isLost)}
                    className={`px-3 py-1 rounded-full text-[10px] font-black uppercase transition-all ${
                      pet.isLost
                        ? 'bg-rose-600 text-white animate-pulse'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    {pet.isLost ? '🚨 LOST MODE' : '❤️ SAFE AT HOME'}
                  </button>
                </div>

                {/* Unique QR Code Container */}
                <div className="my-5 p-4 bg-white rounded-2xl flex flex-col items-center justify-center text-center shadow-lg">
                  <QRCodeSVG
                    id={svgId}
                    value={publicUrl}
                    size={150}
                    bgColor={'#ffffff'}
                    fgColor={'#182232'}
                    level={'H'}
                    includeMargin={true}
                  />
                  <div className="text-[10px] font-mono text-slate-500 mt-2 truncate max-w-full">
                    /pet/{pet.publicId}
                  </div>
                </div>

                {/* Dog Info Pills */}
                <div className="space-y-1.5 text-xs text-slate-300 bg-slate-900/80 p-3 rounded-2xl border border-slate-800">
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-medium">Species & Gender:</span>
                    <span className="font-bold text-white">{pet.species} ({pet.gender})</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-medium">Microchip ID:</span>
                    <span className="font-mono font-bold text-slate-200">{pet.microchipId || '988 000 123 456 789'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-medium">QR Scan Count:</span>
                    <span className="font-bold text-amber-400">{pet.qrCode?.scanCount || 0} scans</span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="space-y-2 pt-2">
                <Button
                  onClick={() => downloadQR(pet.name, svgId)}
                  variant="primary"
                  className="w-full text-xs font-bold py-2.5 bg-brand-coral hover:bg-rose-600 shadow-md"
                  icon={<Download className="w-4 h-4" />}
                >
                  Download Separate QR PNG
                </Button>

                <Link href={`/pet/${pet.publicId}`} target="_blank" className="block">
                  <button className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-slate-200 font-bold text-xs rounded-xl border border-slate-800 flex items-center justify-center gap-1.5 transition-colors">
                    <span>Preview Public Profile (/pet/{pet.publicId})</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
