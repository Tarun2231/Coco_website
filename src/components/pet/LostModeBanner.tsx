'use client';

import React, { useState } from 'react';
import { AlertTriangle, HeartHandshake, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';

interface LostModeBannerProps {
  petId: string;
  petName: string;
  isLost: boolean;
  onStatusChange: () => void;
}

export const LostModeBanner: React.FC<LostModeBannerProps> = ({
  petId,
  petName,
  isLost,
  onStatusChange,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [lostData, setLostData] = useState({
    lastSeenLocation: 'Road No. 5, Banjara Hills, Hyderabad',
    lastSeenDate: new Date().toISOString().split('T')[0],
    lastSeenTime: '04:00 PM',
    rewardAmount: '₹5,000 Cash Reward',
    lostNotes: `${petName} got loose near Banjara Hills Park. Friendly, wearing brown QR collar tag.`,
  });

  const toggleLostStatus = async () => {
    try {
      const res = await fetch(`/api/pets/${petId}/lost`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          isLost: !isLost,
          ...lostData,
        }),
      });

      if (res.ok) {
        setIsModalOpen(false);
        onStatusChange();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <>
      <div
        className={`p-4 md:p-5 rounded-2xl border flex flex-col md:flex-row items-center justify-between gap-4 transition-all ${
          isLost
            ? 'bg-rose-50 border-rose-200 text-rose-900'
            : 'bg-emerald-50/80 border-emerald-200 text-emerald-900'
        }`}
      >
        <div className="flex items-center gap-3.5">
          <div
            className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
              isLost ? 'bg-rose-600 text-white animate-bounce' : 'bg-emerald-600 text-white'
            }`}
          >
            {isLost ? <AlertTriangle className="w-6 h-6" /> : <HeartHandshake className="w-6 h-6" />}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-base">
                {isLost ? `🚨 ${petName} IS MARKED AS LOST` : `❤️ ${petName} IS SAFE AT HOME`}
              </span>
            </div>
            <p className="text-xs mt-0.5 opacity-90">
              {isLost
                ? 'Public QR profile is displaying emergency lost banners, location pin & finder contact buttons.'
                : 'QR profile is in standard identification mode. Toggle if pet gets lost.'}
            </p>
          </div>
        </div>

        <Button
          onClick={() => (isLost ? toggleLostStatus() : setIsModalOpen(true))}
          variant={isLost ? 'success' : 'danger'}
          size="sm"
          className="shrink-0 font-bold"
        >
          {isLost ? 'Mark as Found ❤️' : 'Mark Pet as Lost 🚨'}
        </Button>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={`Activate Lost Mode for ${petName}`}
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-600">
            Activating Lost Mode updates {petName}&apos;s public QR profile instantly with emergency banners, reward tags, and location information.
          </p>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Last Seen Location *</label>
            <div className="relative">
              <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                value={lostData.lastSeenLocation}
                onChange={(e) => setLostData({ ...lostData, lastSeenLocation: e.target.value })}
                placeholder="e.g. Banjara Hills, Hyderabad"
                className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-rose-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Last Seen Date</label>
              <input
                type="date"
                value={lostData.lastSeenDate}
                onChange={(e) => setLostData({ ...lostData, lastSeenDate: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-rose-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Last Seen Time</label>
              <input
                type="text"
                value={lostData.lastSeenTime}
                onChange={(e) => setLostData({ ...lostData, lastSeenTime: e.target.value })}
                placeholder="e.g. 04:00 PM"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-rose-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Reward for Return (Optional)</label>
            <input
              type="text"
              value={lostData.rewardAmount}
              onChange={(e) => setLostData({ ...lostData, rewardAmount: e.target.value })}
              placeholder="e.g. ₹5,000 Cash Reward"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-rose-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Additional Lost Description</label>
            <textarea
              rows={3}
              value={lostData.lostNotes}
              onChange={(e) => setLostData({ ...lostData, lostNotes: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-rose-500"
            />
          </div>

          <div className="flex justify-end gap-3 pt-3">
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={toggleLostStatus}>
              🚨 Confirm Lost Mode
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
};
