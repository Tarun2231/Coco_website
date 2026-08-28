'use client';

import React, { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Send, MapPin, CheckCircle2, UserCheck, AlertCircle } from 'lucide-react';

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
  const [message, setMessage] = useState(`Hi! I spotted ${petName}. Here is the location info:`);
  const [finderLocation, setFinderLocation] = useState('');

  // Handover state fields
  const [hasHandedOver, setHasHandedOver] = useState(false);
  const [handoverName, setHandoverName] = useState('');
  const [handoverPhone, setHandoverPhone] = useState('');
  const [handoverLocation, setHandoverLocation] = useState('');
  const [handoverNotes, setHandoverNotes] = useState('');

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
          hasHandedOver,
          handoverName,
          handoverPhone,
          handoverLocation: handoverLocation || finderLocation,
          handoverNotes,
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
    <Modal isOpen={isOpen} onClose={onClose} title={`Send Location & Caretaker Info to ${petName}'s Owner`}>
      {isSuccess ? (
        <div className="py-8 text-center space-y-4 animate-fadeIn">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <h4 className="text-xl font-extrabold text-slate-800">Location Alert Sent!</h4>
          <p className="text-sm text-slate-600 max-w-sm mx-auto">
            Thank you for helping {petName}! The owner has received your location pin {hasHandedOver ? 'and handover caretaker details' : ''} on their dashboard.
          </p>
          <Button onClick={onClose} variant="primary" className="mt-4">
            Close Window
          </Button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Your Phone Number</label>
              <input
                type="tel"
                value={senderPhone}
                onChange={(e) => setSenderPhone(e.target.value)}
                placeholder="+91 98765 43210"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-brand-coral"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-bold text-slate-700 uppercase">Where did you find / see {petName}?</label>
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
              required
              value={finderLocation}
              onChange={(e) => setFinderLocation(e.target.value)}
              placeholder="e.g. Near Banjara Hills Park, Road No. 5"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-brand-coral"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Message for Owner *</label>
            <textarea
              required
              rows={2}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={`Write details about ${petName}...`}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-brand-coral"
            />
          </div>

          {/* Handover / Caretaker Section */}
          <div className="pt-2 border-t border-slate-100">
            <label className="flex items-start gap-3 cursor-pointer p-3 bg-amber-50 rounded-2xl border border-amber-200 hover:bg-amber-100/60 transition-colors">
              <input
                type="checkbox"
                checked={hasHandedOver}
                onChange={(e) => setHasHandedOver(e.target.checked)}
                className="mt-0.5 w-4 h-4 text-brand-coral rounded border-slate-300 focus:ring-brand-coral"
              />
              <div>
                <span className="text-xs font-extrabold text-amber-900 flex items-center gap-1.5">
                  <UserCheck className="w-4 h-4 text-amber-700" />
                  <span>Are you busy & handing {petName} over to another person / shopkeeper?</span>
                </span>
                <p className="text-[11px] text-amber-800 mt-0.5">
                  Check this box if you cannot wait and are leaving {petName} with a shopkeeper, neighbor, or security guard so the owner knows where to pick up the puppy.
                </p>
              </div>
            </label>

            {hasHandedOver && (
              <div className="mt-3 p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3 animate-fadeIn">
                <div className="flex items-center gap-1.5 text-xs font-extrabold text-slate-800">
                  <AlertCircle className="w-4 h-4 text-brand-coral" />
                  <span>Handover Caretaker Details</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Caretaker Name *</label>
                    <input
                      type="text"
                      required={hasHandedOver}
                      value={handoverName}
                      onChange={(e) => setHandoverName(e.target.value)}
                      placeholder="e.g. Ramesh (Tea Stall Owner)"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-brand-coral"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Caretaker Phone *</label>
                    <input
                      type="tel"
                      required={hasHandedOver}
                      value={handoverPhone}
                      onChange={(e) => setHandoverPhone(e.target.value)}
                      placeholder="+91 98490 55443"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-brand-coral"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Exact Pickup Address / Shop Name *</label>
                  <input
                    type="text"
                    required={hasHandedOver}
                    value={handoverLocation}
                    onChange={(e) => setHandoverLocation(e.target.value)}
                    placeholder="e.g. Ramesh Tea Stall, Opposite GVK Entrance"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-brand-coral"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Special Pickup Instructions</label>
                  <input
                    type="text"
                    value={handoverNotes}
                    onChange={(e) => setHandoverNotes(e.target.value)}
                    placeholder="e.g. Puppy is safe inside the shop, ask Ramesh at the counter"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-brand-coral"
                  />
                </div>
              </div>
            )}
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
              {isSubmitting ? 'Sending Location...' : 'Send Rescue Alert'}
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
};
