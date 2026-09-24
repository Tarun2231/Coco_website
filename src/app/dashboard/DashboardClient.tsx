'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { PetSelector } from '@/components/dashboard/PetSelector';
import { StatCard } from '@/components/dashboard/StatCard';
import { QRCodeCard } from '@/components/dashboard/QRCodeCard';
import { RemindersWidget } from '@/components/dashboard/RemindersWidget';
import { ExpensesWidget } from '@/components/dashboard/ExpensesWidget';
import { ActivityLogWidget } from '@/components/dashboard/ActivityLogWidget';
import { LostModeBanner } from '@/components/pet/LostModeBanner';
import { AddPetModal } from '@/components/pet/AddPetModal';
import { Syringe, DollarSign, Bell, Eye, Heart, Plus, Dog, QrCode } from 'lucide-react';
import { Pet, Expense, Reminder } from '@/types';
import { Button } from '@/components/ui/Button';
import { mergePetRecords } from '@/lib/store';

interface DashboardClientProps {
  initialPets: Pet[];
  userName?: string;
}

export const DashboardClient: React.FC<DashboardClientProps> = ({ initialPets, userName }) => {
  const [pets, setPets] = useState<Pet[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('puppy_id_pets');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            return mergePetRecords(parsed, initialPets);
          }
        } catch (e) {
          console.error('Failed to parse localStorage pets:', e);
        }
      }
    }
    return initialPets;
  });

  const [selectedPetId, setSelectedPetId] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('puppy_id_pets');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed[0].id;
        } catch (e) {}
      }
    }
    return initialPets[0]?.id || '';
  });

  const [isAddPetOpen, setIsAddPetOpen] = useState(false);

  const fetchPets = useCallback(async () => {
    try {
      const res = await fetch(`/api/pets?t=${Date.now()}`, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
        },
      });
      if (res.ok) {
        const data = await res.json();
        if (data.pets && Array.isArray(data.pets) && data.pets.length > 0) {
          setPets((prevPets) => {
            const merged = mergePetRecords(prevPets, data.pets);
            if (typeof window !== 'undefined') {
              localStorage.setItem('puppy_id_pets', JSON.stringify(merged));
            }
            return merged;
          });
        }
      }
    } catch (err) {
      console.error('Fetch pets error:', err);
    }
  }, []);

  useEffect(() => {
    fetchPets();

    const timer = setInterval(() => {
      fetchPets();
    }, 4000);

    const handleUpdate = () => fetchPets();
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        fetchPets();
      }
    };

    window.addEventListener('puppy_id_pets_updated', handleUpdate);
    window.addEventListener('focus', handleUpdate);
    window.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('pageshow', handleUpdate);
    window.addEventListener('online', handleUpdate);

    return () => {
      clearInterval(timer);
      window.removeEventListener('puppy_id_pets_updated', handleUpdate);
      window.removeEventListener('focus', handleUpdate);
      window.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('pageshow', handleUpdate);
      window.removeEventListener('online', handleUpdate);
    };
  }, [fetchPets]);

  const handlePetAdded = (newPet?: any) => {
    if (newPet) {
      setPets((prev) => {
        const updated = [newPet, ...prev.filter((p) => p.id !== newPet.id)];
        if (typeof window !== 'undefined') {
          localStorage.setItem('puppy_id_pets', JSON.stringify(updated));
          window.dispatchEvent(new Event('puppy_id_pets_updated'));
        }
        return updated;
      });
      setSelectedPetId(newPet.id);
    }
    fetchPets();
  };

  // Always find current target pet dynamically from latest pets state
  const currentPet =
    pets.find(
      (p) =>
        String(p.id).toLowerCase() === String(selectedPetId || '').toLowerCase() ||
        String(p.publicId).toLowerCase() === String(selectedPetId || '').toLowerCase()
    ) ||
    pets[0] ||
    null;

  // Complete aggregation of vaccinations across selected pet or all pets
  const vaccinations = (currentPet as any)?.vaccinations || [];
  const expenses = (currentPet as any)?.expenses || [];
  const totalSpent = expenses.reduce((acc: number, curr: Expense) => acc + Number(curr.amount || 0), 0);
  const reminders = (currentPet as any)?.reminders || [];

  return (
    <div className="space-y-8 animate-fadeIn text-slate-800">
      {/* Header & Pet Selector */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
            Dashboard
          </h1>
          <p className="text-sm text-slate-500 font-medium mt-1">
            Welcome back{userName ? `, ${userName.split(' ')[0]}` : ''}! Here&apos;s what&apos;s happening with{' '}
            <span className="font-extrabold text-slate-800">
              {currentPet?.name || 'your registered pets'}
            </span>.
          </p>
        </div>

        <PetSelector
          pets={pets}
          selectedPet={currentPet}
          onSelectPet={(p) => setSelectedPetId(p.id)}
          onAddPetClick={() => setIsAddPetOpen(true)}
        />
      </div>

      {/* 4 Stat Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          title="Vaccinations"
          value={currentPet ? `${vaccinations.length} Record${vaccinations.length === 1 ? '' : 's'}` : '0 Records'}
          subtitle="Total Immunizations"
          icon={<Syringe className="w-6 h-6" />}
          href="/dashboard/vaccinations"
          colorScheme="green"
        />
        <StatCard
          title="Expenses"
          value={currentPet ? `₹${totalSpent.toLocaleString('en-IN')}` : '₹0'}
          subtitle="Total Spent"
          icon={<DollarSign className="w-6 h-6" />}
          href="/dashboard/expenses"
          colorScheme="blue"
        />
        <StatCard
          title="Reminders"
          value={currentPet ? reminders.filter((r: Reminder) => !r.isCompleted).length : 0}
          subtitle="Upcoming"
          icon={<Bell className="w-6 h-6" />}
          href="/dashboard/reminders"
          colorScheme="orange"
        />
        <StatCard
          title="Profile Views"
          value={currentPet ? (currentPet as any)?.qrCode?.scanCount || 0 : 0}
          subtitle="This Month"
          icon={<Eye className="w-6 h-6" />}
          href="/dashboard/analytics"
          colorScheme="purple"
        />
      </div>

      {/* Lost Mode Banner */}
      {currentPet && (
        <LostModeBanner
          petId={currentPet.id}
          petName={currentPet.name}
          isLost={currentPet.isLost}
          onStatusChange={fetchPets}
        />
      )}

      {/* Main Content: Empty State when No Pets or Active Widgets when Pet exists */}
      {!currentPet ? (
        <div className="bg-white rounded-3xl p-10 md:p-14 border border-slate-100 shadow-sm text-center max-w-2xl mx-auto space-y-6">
          <div className="w-20 h-20 rounded-full bg-brand-coral/10 text-brand-coral flex items-center justify-center mx-auto shadow-md">
            <Dog className="w-10 h-10" />
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-black text-slate-900">
              Welcome{userName ? `, ${userName}` : ''}! Add Your First Pet
            </h2>
            <p className="text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
              Your pet dashboard is currently clean and empty. Click below to add your dog&apos;s details and generate a custom QR collar ID tag.
            </p>
          </div>

          <Button
            onClick={() => setIsAddPetOpen(true)}
            variant="primary"
            size="lg"
            className="font-bold shadow-xl shadow-brand-coral/20 px-8"
            icon={<Plus className="w-5 h-5" />}
          >
            Add Your First Pet
          </Button>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 border-t border-slate-100 text-xs font-semibold text-slate-500">
            <div className="flex items-center justify-center gap-1.5">
              <QrCode className="w-4 h-4 text-brand-coral" />
              <span>Instant QR Collar Tag</span>
            </div>
            <div className="flex items-center justify-center gap-1.5">
              <Syringe className="w-4 h-4 text-emerald-600" />
              <span>Vaccination Tracker</span>
            </div>
            <div className="flex items-center justify-center gap-1.5">
              <DollarSign className="w-4 h-4 text-blue-600" />
              <span>Expense Monitoring</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Column 1: QR Code Card */}
            <QRCodeCard petName={currentPet.name} publicId={currentPet.publicId} />

            {/* Column 2: Upcoming Reminders Widget */}
            <RemindersWidget reminders={reminders} />

            {/* Column 3: Recent Expenses Widget */}
            <ExpensesWidget expenses={expenses} />
          </div>

          {/* Activity History Log Widget */}
          <ActivityLogWidget petName={currentPet?.name} />
        </div>
      )}

      {/* Bottom Safety Tip Banner */}
      <div className="bg-emerald-50/80 border border-emerald-200/80 rounded-2xl p-4 flex items-center gap-3 text-xs font-semibold text-emerald-900">
        <Heart className="w-5 h-5 text-emerald-600 fill-emerald-600 shrink-0" />
        <span>
          Keep {currentPet?.name || 'your pet'}&apos;s information updated so that we can bring them home safely if they get lost.
        </span>
      </div>

      {/* Add Pet Modal */}
      <AddPetModal
        isOpen={isAddPetOpen}
        onClose={() => setIsAddPetOpen(false)}
        onSuccess={handlePetAdded}
      />
    </div>
  );
};
