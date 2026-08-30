'use client';

import React, { useState } from 'react';
import { PetSelector } from '@/components/dashboard/PetSelector';
import { StatCard } from '@/components/dashboard/StatCard';
import { QRCodeCard } from '@/components/dashboard/QRCodeCard';
import { RemindersWidget } from '@/components/dashboard/RemindersWidget';
import { ExpensesWidget } from '@/components/dashboard/ExpensesWidget';
import { LostModeBanner } from '@/components/pet/LostModeBanner';
import { AddPetModal } from '@/components/pet/AddPetModal';
import { Syringe, DollarSign, Bell, Eye, Heart, Plus, Dog, QrCode } from 'lucide-react';
import { Pet, Expense } from '@/types';
import { Button } from '@/components/ui/Button';

interface DashboardClientProps {
  initialPets: Pet[];
  userName?: string;
}

export const DashboardClient: React.FC<DashboardClientProps> = ({ initialPets, userName }) => {
  const [pets, setPets] = useState<Pet[]>(initialPets);

  const getActivePetFromList = (petList: Pet[]) => {
    if (!petList || petList.length === 0) return null;
    if (typeof document !== 'undefined') {
      const match = document.cookie.match(/puppy_active_pet_id=([^;]+)/);
      if (match && match[1]) {
        const found = petList.find((p) => p.id === match[1]);
        if (found) return found;
      }
    }
    return petList[petList.length - 1] || petList[0];
  };

  const [selectedPet, setSelectedPet] = useState<Pet | null>(() => getActivePetFromList(initialPets));
  const [isAddPetOpen, setIsAddPetOpen] = useState(false);

  const fetchPets = async () => {
    try {
      const res = await fetch('/api/pets');
      const data = await res.json();
      if (data.pets && Array.isArray(data.pets)) {
        setPets(data.pets);
        if (data.pets.length > 0) {
          setSelectedPet(getActivePetFromList(data.pets));
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handlePetAdded = (newPet?: Pet) => {
    if (newPet && newPet.id) {
      document.cookie = `puppy_active_pet_id=${newPet.id}; Path=/; Max-Age=31536000; SameSite=Lax`;
      setPets((prev) => {
        const filtered = prev.filter((p) => p.id !== newPet.id);
        return [...filtered, newPet];
      });
      setSelectedPet(newPet);
    }
    fetchPets();
  };

  const currentPet = selectedPet || (pets.length > 0 ? pets[pets.length - 1] : null);

  const vaccinations = (currentPet as any)?.vaccinations || [];
  const expenses = (currentPet as any)?.expenses || [];
  const reminders = (currentPet as any)?.reminders || [];
  const totalSpent = expenses.reduce((acc: number, curr: Expense) => acc + curr.amount, 0);

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Top Header & Pet Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-100 shadow-xs">
        <div className="flex items-center gap-4">
          {currentPet?.photo ? (
            <img
              src={currentPet.photo}
              alt={currentPet.name}
              className="w-14 h-14 rounded-2xl object-cover border-2 border-brand-coral/20 shadow-xs shrink-0"
            />
          ) : (
            <div className="w-14 h-14 rounded-2xl bg-brand-coral/10 text-brand-coral flex items-center justify-center font-bold text-xl shrink-0">
              🐾
            </div>
          )}
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Welcome back, {userName || 'Pet Owner'}! 👋
            </h1>
            <p className="text-xs text-slate-500 font-semibold mt-0.5">
              Managing profile, health, expenses &amp; QR protection for{' '}
              <span className="text-brand-coral font-bold">{currentPet ? currentPet.name : 'your pets'}</span>
            </p>
          </div>
        </div>

        <PetSelector
          pets={pets}
          selectedPet={currentPet}
          onSelectPet={setSelectedPet}
          onAddPetClick={() => setIsAddPetOpen(true)}
        />
      </div>

      {/* Lost Pet Status Banner if lost */}
      {currentPet && (
        <LostModeBanner
          petId={currentPet.id}
          petName={currentPet.name}
          isLost={!!currentPet.isLost}
          onStatusChange={fetchPets}
        />
      )}

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <StatCard
          title="Vaccinations"
          value={vaccinations.length.toString()}
          subtitle={`${vaccinations.filter((v: any) => v.status === 'COMPLETED').length} Completed`}
          icon={<Syringe className="w-6 h-6" />}
          href="/dashboard/vaccinations"
          colorScheme="green"
        />
        <StatCard
          title="Total Expenses"
          value={`₹${totalSpent.toLocaleString()}`}
          subtitle={`${expenses.length} Receipts Saved`}
          icon={<DollarSign className="w-6 h-6" />}
          href="/dashboard/expenses"
          colorScheme="blue"
        />
        <StatCard
          title="Active Reminders"
          value={reminders.length.toString()}
          subtitle={`${reminders.filter((r: any) => !r.isCompleted).length} Pending`}
          icon={<Bell className="w-6 h-6" />}
          href="/dashboard/reminders"
          colorScheme="purple"
        />
        <StatCard
          title="QR Profile Scans"
          value={(currentPet as any)?.qrCode?.scanCount?.toString() || '0'}
          subtitle="Lifetime Finder Scans"
          icon={<Eye className="w-6 h-6" />}
          href="/dashboard/qr-code"
          colorScheme="orange"
        />
      </div>

      {/* Main Grid: Empty state vs Pet Dashboard Widgets */}
      {!currentPet ? (
        <div className="bg-white rounded-3xl p-8 sm:p-12 text-center border border-slate-100 space-y-4 shadow-xs">
          <div className="w-16 h-16 rounded-full bg-brand-coral/10 text-brand-coral flex items-center justify-center mx-auto shadow-xs">
            <Dog className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-extrabold text-slate-900">Add Your First Pet Profile</h2>
          <p className="text-xs text-slate-500 font-medium max-w-md mx-auto leading-relaxed">
            Create a digital QR identity tag, track vaccination history, monitor pet care expenses, and set health reminders for your puppy.
          </p>
          <div className="pt-2">
            <Button
              onClick={() => setIsAddPetOpen(true)}
              variant="primary"
              className="font-bold shadow-md shadow-brand-coral/20 px-6 py-3 text-sm"
              icon={<Plus className="w-4 h-4" />}
            >
              Add Your First Pet
            </Button>
          </div>
          <div className="pt-4 grid grid-cols-3 gap-2 text-[11px] text-slate-400 font-medium max-w-sm mx-auto border-t border-slate-100">
            <div className="flex items-center justify-center gap-1.5">
              <QrCode className="w-4 h-4 text-brand-coral" />
              <span>Digital Tag</span>
            </div>
            <div className="flex items-center justify-center gap-1.5">
              <Syringe className="w-4 h-4 text-emerald-600" />
              <span>Vaccines</span>
            </div>
            <div className="flex items-center justify-center gap-1.5">
              <DollarSign className="w-4 h-4 text-blue-600" />
              <span>Expenses</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Column 1: QR Code Card */}
          <QRCodeCard petName={currentPet.name} publicId={currentPet.publicId} />

          {/* Column 2: Upcoming Reminders Widget */}
          <RemindersWidget reminders={reminders} />

          {/* Column 3: Recent Expenses Widget */}
          <ExpensesWidget expenses={expenses} />
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
