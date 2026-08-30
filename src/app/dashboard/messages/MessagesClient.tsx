'use client';

import React, { useState } from 'react';
import { MessageSquare, MapPin, PhoneCall, UserCheck, Navigation, CheckCircle2, Trash2, MailCheck, Mail } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { useRouter } from 'next/navigation';

interface FinderMsg {
  id: string;
  senderName: string;
  senderPhone?: string | null;
  message: string;
  finderLocation?: string | null;
  hasHandedOver: boolean;
  handoverName?: string | null;
  handoverPhone?: string | null;
  handoverLocation?: string | null;
  handoverNotes?: string | null;
  isRead: boolean;
  createdAt: string | Date;
  pet?: { name: string; photo?: string | null } | null;
}

interface MessagesClientProps {
  initialMessages: FinderMsg[];
}

export const MessagesClient: React.FC<MessagesClientProps> = ({ initialMessages }) => {
  const [messages, setMessages] = useState<FinderMsg[]>(initialMessages);
  const [deletingMsg, setDeletingMsg] = useState<FinderMsg | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleToggleRead = async (msg: FinderMsg) => {
    const newIsRead = !msg.isRead;
    // Optimistic update
    setMessages((prev) =>
      prev.map((m) => (m.id === msg.id ? { ...m, isRead: newIsRead } : m))
    );

    try {
      await fetch(`/api/messages/${msg.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isRead: newIsRead }),
      });
      router.refresh();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteMessage = async () => {
    if (!deletingMsg) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/messages/${deletingMsg.id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setMessages((prev) => prev.filter((m) => m.id !== deletingMsg.id));
        setDeletingMsg(null);
        router.refresh();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const unreadCount = messages.filter((m) => !m.isRead).length;

  return (
    <div className="space-y-6 max-w-5xl animate-fadeIn">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Pet Location & Rescue Tracker</h1>
          <p className="text-sm text-slate-500 font-medium">
            Real-time GPS locations and caretaker handover details reported by finders
          </p>
        </div>

        {messages.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold px-3 py-1 bg-brand-coral/10 text-brand-coral rounded-full">
              {unreadCount} Unread Alert{unreadCount === 1 ? '' : 's'}
            </span>
          </div>
        )}
      </div>

      <div className="space-y-4">
        {messages.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-100 max-w-md mx-auto">
            <MessageSquare className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-slate-800">No Location Alerts Yet</h3>
            <p className="text-xs text-slate-500 mt-1">
              When someone scans your pet tag and submits location or handover info, rescue alerts appear here.
            </p>
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`bg-white rounded-3xl p-6 border shadow-sm space-y-4 transition-all ${
                !msg.isRead ? 'border-brand-coral/40 ring-1 ring-brand-coral/20 bg-rose-50/10' : 'border-slate-100'
              }`}
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-2xl font-bold flex items-center justify-center ${
                      msg.hasHandedOver ? 'bg-amber-500 text-white' : 'bg-brand-coral/10 text-brand-coral'
                    }`}
                  >
                    {msg.hasHandedOver ? <UserCheck className="w-5 h-5" /> : <MapPin className="w-5 h-5" />}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-extrabold text-slate-900">{msg.senderName}</h3>
                      {!msg.isRead && (
                        <span className="px-2 py-0.5 bg-brand-coral text-white text-[9px] font-extrabold rounded-full uppercase tracking-wider">
                          New Alert
                        </span>
                      )}
                      {msg.hasHandedOver && (
                        <span className="px-2.5 py-0.5 bg-amber-500 text-slate-950 font-black text-[10px] rounded-full uppercase">
                          🤝 Handed Over to Caretaker
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 font-medium">
                      Spotted <strong className="text-slate-800">{msg.pet?.name || 'Pet'}</strong> • {formatDate(msg.createdAt, 'dd MMM yyyy, hh:mm a')}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end md:self-auto">
                  {msg.senderPhone && (
                    <a
                      href={`tel:${msg.senderPhone}`}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm"
                    >
                      <PhoneCall className="w-4 h-4" />
                      <span>Call Finder: {msg.senderPhone}</span>
                    </a>
                  )}

                  <button
                    onClick={() => handleToggleRead(msg)}
                    className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-bold flex items-center gap-1.5"
                    title={msg.isRead ? 'Mark as Unread' : 'Mark as Read'}
                  >
                    {msg.isRead ? <Mail className="w-4 h-4 text-slate-400" /> : <MailCheck className="w-4 h-4 text-brand-coral" />}
                    <span className="hidden sm:inline">{msg.isRead ? 'Mark Unread' : 'Mark Read'}</span>
                  </button>

                  <button
                    onClick={() => setDeletingMsg(msg)}
                    className="p-2 rounded-xl border border-slate-200 hover:bg-rose-50 text-slate-400 hover:text-rose-600 text-xs font-bold"
                    title="Delete Message"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Message Details */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-2">
                <p className="text-sm font-semibold text-slate-800 leading-relaxed">&quot;{msg.message}&quot;</p>

                {msg.finderLocation && (
                  <div className="flex items-center justify-between gap-2 text-xs font-bold text-slate-700 pt-2 border-t border-slate-200/60">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-rose-500 shrink-0" />
                      <span>Found Spot: <strong className="text-slate-900">{msg.finderLocation}</strong></span>
                    </div>
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(msg.finderLocation)}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-blue-600 hover:underline flex items-center gap-1 font-bold shrink-0 text-[11px]"
                    >
                      <Navigation className="w-3.5 h-3.5" />
                      <span>Open Map</span>
                    </a>
                  </div>
                )}
              </div>

              {/* Handover Caretaker Rescue Box */}
              {msg.hasHandedOver && (
                <div className="bg-amber-100/70 border-2 border-amber-300 p-4 rounded-2xl space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-amber-950 font-extrabold text-sm">
                      <UserCheck className="w-5 h-5 text-amber-800" />
                      <span>Retrieval Location & Caretaker Info</span>
                    </div>
                    <span className="text-[10px] font-black text-amber-900 uppercase bg-white px-2.5 py-1 rounded-full border border-amber-300">
                      Go Here To Bring Puppy Home
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                    <div>
                      <span className="text-amber-800 font-bold block">Caretaker Name:</span>
                      <span className="font-black text-slate-900 text-sm">{msg.handoverName || 'Local Caretaker'}</span>
                    </div>
                    <div>
                      <span className="text-amber-800 font-bold block">Caretaker Phone:</span>
                      <a href={`tel:${msg.handoverPhone || ''}`} className="font-black text-emerald-800 text-sm hover:underline">
                        {msg.handoverPhone || 'N/A'}
                      </a>
                    </div>
                    <div className="md:col-span-2">
                      <span className="text-amber-800 font-bold block">Exact Pickup Address / Shop:</span>
                      <span className="font-extrabold text-slate-900">{msg.handoverLocation || msg.finderLocation}</span>
                    </div>
                    {msg.handoverNotes && (
                      <div className="md:col-span-2 pt-1">
                        <span className="text-amber-800 font-bold block">Pickup Notes:</span>
                        <span className="italic text-slate-800">&quot;{msg.handoverNotes}&quot;</span>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-3 pt-2">
                    {msg.handoverPhone && (
                      <a
                        href={`tel:${msg.handoverPhone}`}
                        className="py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-md flex items-center gap-2"
                      >
                        <PhoneCall className="w-4 h-4" />
                        <span>Call Caretaker ({msg.handoverName?.split(' ')[0]})</span>
                      </a>
                    )}
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(msg.handoverLocation || msg.finderLocation || '')}`}
                      target="_blank"
                      rel="noreferrer"
                      className="py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs rounded-xl shadow-md flex items-center gap-2"
                    >
                      <Navigation className="w-4 h-4 text-amber-400" />
                      <span>Navigate To Pickup Spot</span>
                    </a>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={Boolean(deletingMsg)}
        onClose={() => setDeletingMsg(null)}
        title="Confirm Delete Alert"
      >
        <div className="space-y-4 text-xs">
          <p className="text-slate-700 font-medium leading-relaxed">
            Are you sure you want to delete this alert message from{' '}
            <strong className="text-slate-900 font-bold">{deletingMsg?.senderName}</strong>?
          </p>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <Button variant="outline" onClick={() => setDeletingMsg(null)} disabled={loading}>
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={handleDeleteMessage}
              disabled={loading}
              className="font-bold bg-rose-600 hover:bg-rose-700 text-white"
            >
              {loading ? 'Deleting...' : 'Delete Alert'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
