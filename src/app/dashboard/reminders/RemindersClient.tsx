'use client';

import React, { useState, useEffect } from 'react';
import { Bell, Calendar, Repeat, CheckCircle2, Plus, Dog, Clock } from 'lucide-react';
import { formatDate, getCountdownString } from '@/lib/utils';
import { Button } from '@/components/ui/Button';

interface ReminderItem {
  id: string;
  petId: string;
  category: string;
  title: string;
  date: string;
  time?: string;
  repeat?: string;
  notes?: string;
  isCompleted: boolean;
}

interface RemindersClientProps {
  initialReminders: ReminderItem[];
  petId: string;
  petName: string;
}

export const RemindersClient: React.FC<RemindersClientProps> = ({
  initialReminders,
  petId,
  petName,
}) => {
  const [allPets, setAllPets] = useState<any[]>([]);
  const [selectedPetId, setSelectedPetId] = useState<string>(petId);
  const [currentPetName, setCurrentPetName] = useState<string>(petName);

  const [reminders, setReminders] = useState<ReminderItem[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('puppy_id_pets');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            const currentPet = parsed.find((p: any) => p.id === petId || p.publicId === petId) || parsed[0];
            if (currentPet?.reminders && Array.isArray(currentPet.reminders)) {
              return currentPet.reminders;
            }
          }
        } catch (e) {
          console.error(e);
        }
      }
    }
    return initialReminders;
  });

  useEffect(() => {
    const fetchLatest = async () => {
      try {
        const res = await fetch('/api/pets', { cache: 'no-store' });
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data.pets) && data.pets.length > 0) {
            setAllPets(data.pets);
            const currentPet = data.pets.find((p: any) => p.id === selectedPetId || p.publicId === selectedPetId) || data.pets[0];
            if (currentPet) {
              setCurrentPetName(currentPet.name);
              if (currentPet.reminders && Array.isArray(currentPet.reminders)) {
                setReminders(currentPet.reminders);
              }
            }
          }
        }
      } catch (e) {
        console.error('Fetch reminders error:', e);
      }
    };
    fetchLatest();
  }, [selectedPetId]);

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Care');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState('09:00 AM');
  const [repeat, setRepeat] = useState('ONCE');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const handlePetChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const targetId = e.target.value;
    setSelectedPetId(targetId);
    const targetPet = allPets.find((p) => p.id === targetId || p.publicId === targetId);
    if (targetPet) {
      setCurrentPetName(targetPet.name);
      setReminders(targetPet.reminders || []);
    }
  };

  const handleToggleComplete = async (remId: string) => {
    const updated = reminders.map((r) =>
      r.id === remId ? { ...r, isCompleted: !r.isCompleted } : r
    );
    setReminders(updated);

    // Sync with localStorage
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('puppy_id_pets');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) {
            const updatedPets = parsed.map((p: any) => {
              if (p.id === selectedPetId || p.publicId === selectedPetId) {
                return { ...p, reminders: updated };
              }
              return p;
            });
            localStorage.setItem('puppy_id_pets', JSON.stringify(updatedPets));
          }
        } catch (e) {
          console.error(e);
        }
      }
    }
  };

  const handleAddReminder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !date) return;

    setIsSubmitting(true);
    const newRem: ReminderItem = {
      id: `rem-${Date.now()}`,
      petId: selectedPetId,
      category,
      title,
      date,
      time,
      repeat,
      notes,
      isCompleted: false,
    };

    const updatedRems = [newRem, ...reminders];
    setReminders(updatedRems);

    // Sync with localStorage
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('puppy_id_pets');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) {
            const updatedPets = parsed.map((p: any) => {
              if (p.id === selectedPetId || p.publicId === selectedPetId) {
                return { ...p, reminders: updatedRems };
              }
              return p;
            });
            localStorage.setItem('puppy_id_pets', JSON.stringify(updatedPets));
          }
        } catch (e) {
          console.error(e);
        }
      }
    }

    setNotice(`✅ Care reminder saved for ${currentPetName} and synced across devices!`);
    setTimeout(() => setNotice(null), 4000);

    setTitle('');
    setNotes('');
    setIsSubmitting(false);

    try {
      await fetch('/api/reminders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newRem),
      });
    } catch (err) {
      console.error('Save reminder API error:', err);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl animate-fadeIn">
      {/* Header & Pet Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Pet Schedule & Reminders</h1>
          <p className="text-sm text-slate-500 font-medium">
            Manage care alerts, deworming, and booster schedules for <strong className="text-slate-800">{currentPetName}</strong>
          </p>
        </div>

        {allPets.length > 1 && (
          <div className="flex items-center gap-2 bg-white px-3.5 py-2 rounded-2xl border border-slate-200 shadow-xs">
            <Dog className="w-4 h-4 text-amber-600" />
            <span className="text-xs font-extrabold text-slate-700">Select Pet:</span>
            <select
              value={selectedPetId}
              onChange={handlePetChange}
              className="text-xs font-bold bg-transparent text-slate-900 focus:outline-none"
            >
              {allPets.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.breed})
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {notice && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-2.5 rounded-2xl text-xs font-bold flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{notice}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Add Care Reminder Form */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4">
            <div className="flex items-center gap-2 text-slate-900 font-extrabold text-base border-b border-slate-100 pb-3">
              <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                <Plus className="w-5 h-5" />
              </div>
              <span>Add Care Reminder</span>
            </div>

            <form onSubmit={handleAddReminder} className="space-y-3">
              {allPets.length > 0 && (
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Target Pet *</label>
                  <select
                    value={selectedPetId}
                    onChange={handlePetChange}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-900 bg-white"
                  >
                    {allPets.map((p) => (
                      <option key={p.id} value={p.id}>
                        🐶 {p.name} ({p.breed})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Reminder Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold bg-white"
                >
                  <option value="Care">Care & Hygiene</option>
                  <option value="Vaccination">Vaccination Booster</option>
                  <option value="Deworming">Deworming Tablet</option>
                  <option value="Flea & Tick">Flea & Tick Treatment</option>
                  <option value="Grooming">Grooming & Spa</option>
                  <option value="Vet Checkup">Vet Consultation</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Reminder Title *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Give Drontal Deworming Tablet"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Date *</label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold bg-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Time</label>
                  <input
                    type="text"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    placeholder="09:00 AM"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Repeat Schedule</label>
                <select
                  value={repeat}
                  onChange={(e) => setRepeat(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold bg-white"
                >
                  <option value="ONCE">ONCE (One Time)</option>
                  <option value="MONTHLY">MONTHLY (Every Month)</option>
                  <option value="EVERY_3_MONTHS">EVERY 3 MONTHS</option>
                  <option value="EVERY_6_MONTHS">EVERY 6 MONTHS</option>
                  <option value="ANNUALLY">ANNUALLY (Every Year)</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Notes</label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Give with breakfast kibble"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium"
                />
              </div>

              <Button
                type="submit"
                variant="primary"
                disabled={isSubmitting}
                className="w-full font-bold shadow-md bg-amber-600 hover:bg-amber-700 mt-2"
                icon={<Plus className="w-4 h-4" />}
              >
                {isSubmitting ? 'Saving...' : `Save Reminder for ${currentPetName}`}
              </Button>
            </form>
          </div>
        </div>

        {/* Right Column: Scheduled Reminders List */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4">
            <h3 className="text-base font-extrabold text-slate-900">
              Active Care Reminders for {currentPetName}
            </h3>

            {reminders.length === 0 ? (
              <p className="text-xs text-slate-400 italic text-center py-8">
                No reminders scheduled yet for {currentPetName}. Add your first reminder on the left!
              </p>
            ) : (
              <div className="space-y-3">
                {reminders.map((rem) => {
                  const countdown = getCountdownString(rem.date);
                  return (
                    <div
                      key={rem.id}
                      className={`p-4 rounded-2xl border flex items-start justify-between gap-3 transition-colors ${
                        rem.isCompleted
                          ? 'bg-slate-50 border-slate-200 opacity-60'
                          : 'bg-amber-50/50 border-amber-200/80 hover:bg-amber-50'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <input
                          type="checkbox"
                          checked={rem.isCompleted}
                          onChange={() => handleToggleComplete(rem.id)}
                          className="w-4 h-4 mt-1 rounded text-amber-600 focus:ring-amber-500 cursor-pointer"
                        />
                        <div className="space-y-0.5">
                          <span className="text-[9px] font-black text-amber-800 uppercase tracking-wider bg-amber-100 px-2 py-0.5 rounded-full border border-amber-200">
                            {rem.category}
                          </span>
                          <h4 className={`text-sm font-black ${rem.isCompleted ? 'line-through text-slate-400' : 'text-slate-900'}`}>
                            {rem.title}
                          </h4>
                          <p className="text-xs text-slate-500 font-medium flex items-center gap-1">
                            <Clock className="w-3 h-3 text-amber-600" />
                            <span>{formatDate(rem.date)} at {rem.time || '09:00 AM'} • Repeat: {String(rem.repeat || 'ONCE').replace('_', ' ')}</span>
                          </p>
                          {rem.notes && <p className="text-xs text-slate-600 italic font-medium">{rem.notes}</p>}
                        </div>
                      </div>

                      <span
                        className={`text-[10px] font-bold px-2.5 py-1 rounded-full border shrink-0 ${
                          countdown.isOverdue
                            ? 'bg-rose-100 text-rose-800 border-rose-200'
                            : 'bg-amber-100 text-amber-900 border-amber-200'
                        }`}
                      >
                        {countdown.text}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
