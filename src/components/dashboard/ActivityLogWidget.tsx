'use client';

import React, { useState, useEffect } from 'react';
import { History, Clock, Sparkles } from 'lucide-react';

interface ActivityLogItem {
  id: string;
  timestamp: string;
  formattedTime: string;
  type: string;
  title: string;
  details: string;
  petName: string;
}

interface ActivityLogWidgetProps {
  petName?: string;
}

export const ActivityLogWidget: React.FC<ActivityLogWidgetProps> = ({ petName }) => {
  const [activities, setActivities] = useState<ActivityLogItem[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('puppy_id_activities');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        } catch (e) {
          console.error(e);
        }
      }
    }
    const now = new Date();
    return [
      {
        id: 'act-demo-1',
        timestamp: now.toISOString(),
        formattedTime: `${now.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} • ${now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`,
        type: 'VACCINE_ADDED',
        title: 'Vaccine Logged: "Rabies Anti-Rabies Vaccine"',
        details: `Given: ${now.toISOString().split('T')[0]} • Vet: Dr. Rahul Verma`,
        petName: petName || 'Bruno',
      },
      {
        id: 'act-demo-2',
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        formattedTime: `${now.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} • 02:15 PM`,
        type: 'PUPPY_ADDED',
        title: `Added New Puppy "${petName || 'Bruno'}"`,
        details: 'Breed: Golden Retriever • Gender: Male',
        petName: petName || 'Bruno',
      },
    ];
  });

  useEffect(() => {
    const handleStorage = () => {
      const saved = localStorage.getItem('puppy_id_activities');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) setActivities(parsed);
        } catch (e) {
          console.error(e);
        }
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const filtered = petName
    ? activities.filter((a) => a.petName?.toLowerCase() === petName.toLowerCase() || a.petName === 'Bruno')
    : activities;

  return (
    <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-slate-800 font-extrabold text-base">
          <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <History className="w-4 h-4" />
          </div>
          <span>Recent Activity & Update Log</span>
        </div>
        <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
          Live Tracker
        </span>
      </div>

      <p className="text-xs text-slate-500 font-medium">
        Timestamped activity records of added puppies, vaccinations, reminders, and updates.
      </p>

      <div className="space-y-2.5 max-h-64 overflow-y-auto">
        {filtered.slice(0, 8).map((act) => (
          <div
            key={act.id}
            className="p-3 bg-slate-50/90 rounded-2xl border border-slate-100 flex items-start justify-between text-xs gap-3 hover:bg-slate-100/70 transition-colors"
          >
            <div className="space-y-0.5">
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-slate-800">{act.title}</span>
                {act.petName && (
                  <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-brand-coral/10 text-brand-coral border border-brand-coral/20">
                    {act.petName}
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-500 font-medium">{act.details}</p>
            </div>
            <div className="text-[10px] font-bold text-amber-600 shrink-0 bg-amber-50 px-2 py-1 rounded-lg border border-amber-200/80 flex items-center gap-1">
              <Clock className="w-3 h-3" />
              <span>{act.formattedTime}</span>
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <p className="text-xs text-slate-400 italic text-center py-6">No recent activity logged for this pet.</p>
        )}
      </div>
    </div>
  );
};
