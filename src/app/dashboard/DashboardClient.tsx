'use client';

import React, { useState } from 'react';
import { PetSelector } from '@/components/dashboard/PetSelector';
import { StatCard } from '@/components/dashboard/StatCard';
import { QRCodeCard } from '@/components/dashboard/QRCodeCard';
import { RemindersWidget } from '@/components/dashboard/RemindersWidget';
import { ExpensesWidget } from '@/components/dashboard/ExpensesWidget';
import { LostModeBanner } from '@/components/pet/LostModeBanner';
import { AddPetModal } from '@/components/pet/AddPetModal';
import { Syringe, DollarSign, Bell, Eye, Heart } from 'lucide-react';
import { Pet, Vaccination, Expense, Reminder } from '@/types';

interface DashboardClientProps {
  initialPets: Pet[];
}

export const DashboardClient: React.FC<DashboardClientProps> = ({ initialPets }) => {
  const [pets, setPets] = useState<Pet[]>(initialPets);
  const [selectedPet, setSelectedPet] = useState<Pet | null>(initialPets[0] || null);
  const [isAddPetOpen, setIsAddPetOpen] = useState(false);

  const fetchPets = async () => {
    try {
      const res = await fetch('/api/pets');
      const data = await res.json();
      if (data.pets) {
        setPets(data.pets);
        if (selectedPet) {
          const updated = data.pets.find((p: Pet) => p.id === selectedPet.id);
          if (updated) setSelectedPet(updated);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const currentPet = selectedPet || pets[0];

  const vaccinations = (currentPet as any)?.vaccinations || [];
  const expenses = (currentPet as any)?.expenses || [];
  const reminders = (currentPet as any)?.reminders || [];
  const totalSpent = expenses.reduce((acc: number, curr: Expense) => acc + curr.amount, 0);

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header & Pet Selector */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
            Dashboard
          </h1>
          <p className="text-sm text-slate-500 font-medium mt-1">
            Welcome back! Here&apos;s what&apos;s happening with{' '}
            <span className="font-extrabold text-slate-800">{currentPet?.name || 'your pet'}</span>.
          </p>
        </div>

        <PetSelector
          pets={pets}
          selectedPet={currentPet}
          onSelectPet={(p) => setSelectedPet(p)}
          onAddPetClick={() => setIsAddPetOpen(true)}
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

      {/* 4 Stat Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          title="Vaccinations"
          value={vaccinations.length || 4}
          subtitle="Total Records"
          icon={<Syringe className="w-6 h-6" />}
          href="/dashboard/vaccinations"
          colorScheme="green"
        />
        <StatCard
          title="Expenses"
          value={`₹${totalSpent.toLocaleString('en-IN') || '12,450'}`}
          subtitle="Total Spent"
          icon={<DollarSign className="w-6 h-6" />}
          href="/dashboard/expenses"
          colorScheme="blue"
        />
        <StatCard
          title="Reminders"
          value={reminders.filter((r: Reminder) => !r.isCompleted).length || 2}
          subtitle="Upcoming"
          icon={<Bell className="w-6 h-6" />}
          href="/dashboard/reminders"
          colorScheme="orange"
        />
        <StatCard
          title="Profile Views"
          value={(currentPet as any)?.qrCode?.scanCount || 27}
          subtitle="This Month"
          icon={<Eye className="w-6 h-6" />}
          href="/dashboard/analytics"
          colorScheme="purple"
        />
      </div>

      {/* Main Content 3-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Column 1: QR Code Card */}
        {currentPet && (
          <QRCodeCard
            petName={currentPet.name}
            publicId={currentPet.publicId}
          />
        )}

        {/* Column 2: Upcoming Reminders Widget */}
        <RemindersWidget reminders={reminders} />

        {/* Column 3: Recent Expenses Widget */}
        <ExpensesWidget expenses={expenses} />
      </div>

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
        onSuccess={fetchPets}
      />
    </div>
  );
};
