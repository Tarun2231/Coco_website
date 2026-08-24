'use client';

import React, { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Send, MapPin, CheckCircle2 } from 'lucide-react';

interface ContactOwnerModalProps {
  isOpen: boolean;
  onClose: () => void;
  petId: string;
  petName: string;
}

export const ContactOwnerModal: React.FC<ContactOwnerModalProps> = ({
  isOpen,
  onClose,
  petId,
  petName,
}) => {
  const [senderName, setSenderName] = useState('');
  const [senderPhone, setSenderPhone] = useState('');
  const [message, setMessage] = useState(`Hi! I scanned ${petName}'s Puppy ID tag.`);
  const [finderLocation, setFinderLocation] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleGetLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setFinderLocation(`GPS: ${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)}`);
        },
        () => {
          setFinderLocation('Location permission denied');
        }
      );
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          petId,
          senderName: senderName || 'Good Samaritan Finder',
          senderPhone,
          message,
          finderLocation,
        }),
      });

      if (res.ok) {
        setIsSuccess(true);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Send Message to ${petName}'s Family`}>
      {isSuccess ? (
        <div className="py-8 text-center space-y-4 animate-fadeIn">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <h4 className="text-xl font-extrabold text-slate-800">Message Sent Successfully!</h4>
          <p className="text-sm text-slate-600 max-w-sm mx-auto">
            Thank you for helping {petName}! {petName}&apos;s owner has been notified on their dashboard inbox.
          </p>
          <Button onClick={onClose} variant="primary" className="mt-4">
            Close Window
          </Button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Your Name</label>
            <input
              type="text"
              value={senderName}
              onChange={(e) => setSenderName(e.target.value)}
              placeholder="e.g. Vikram Sharma"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-brand-coral"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Your Phone Number (Optional)</label>
            <input
              type="tel"
              value={senderPhone}
              onChange={(e) => setSenderPhone(e.target.value)}
              placeholder="+91 98765 43210"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-brand-coral"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-bold text-slate-700 uppercase">Where is {petName} right now?</label>
              <button
                type="button"
                onClick={handleGetLocation}
                className="text-[11px] font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
              >
                <MapPin className="w-3 h-3" />
                <span>Use My Location</span>
              </button>
            </div>
            <input
              type="text"
              value={finderLocation}
              onChange={(e) => setFinderLocation(e.target.value)}
              placeholder="e.g. Road No. 5 Banjara Hills near GVK Mall"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-brand-coral"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Message to Owner *</label>
            <textarea
              required
              rows={4}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={`Write details about where you found ${petName}...`}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-brand-coral"
            />
          </div>

          <div className="flex justify-end gap-3 pt-3">
            <Button type="button" variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={isSubmitting}
              icon={<Send className="w-4 h-4" />}
            >
              {isSubmitting ? 'Sending...' : 'Send Finder Message'}
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
};
