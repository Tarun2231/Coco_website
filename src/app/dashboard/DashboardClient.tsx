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
import { Pet, Expense, Reminder } from '@/types';
import { Button } from '@/components/ui/Button';

interface DashboardClientProps {
  initialPets: Pet[];
  userName?: string;
}

export const DashboardClient: React.FC<DashboardClientProps> = ({ initialPets, userName }) => {
  const [pets, setPets] = useState<Pet[]>(initialPets);
  const [selectedPet, setSelectedPet] = useState<Pet | null>(initialPets[0] || null);
  const [isAddPetOpen, setIsAddPetOpen] = useState(false);

  const fetchPets = async () => {
    try {
      const res = await fetch('/api/pets');
      const data = await res.json();
      if (data.pets && Array.isArray(data.pets)) {
        setPets(data.pets);
        if (data.pets.length > 0) {
          setSelectedPet(data.pets[data.pets.length - 1]);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handlePetAdded = (newPet?: any) => {
    if (newPet) {
      setPets((prev) => [...prev, newPet]);
      setSelectedPet(newPet);
    }
    fetchPets();
  };

  const currentPet = selectedPet || (pets.length > 0 ? pets[pets.length - 1] : null);

  const vaccinations = (currentPet as any)?.vaccinations || [];
  const expenses = (currentPet as any)?.expenses || [];
  const reminders = (currentPet as any)?.reminders || [];
  const totalSpent = expenses.reduce((acc: number, curr: Expense) => acc + Number(curr.amount || 0), 0);

  return (
    <div className="space-y-8 animate-fadeIn">
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
          onSelectPet={(p) => setSelectedPet(p)}
          onAddPetClick={() => setIsAddPetOpen(true)}
        />
      </div>

      {/* 4 Stat Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          title="Vaccinations"
          value={currentPet ? vaccinations.length : 0}
          subtitle="Total Records"
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
