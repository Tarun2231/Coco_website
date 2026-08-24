'use client';

import React, { useState } from 'react';
import { ChevronDown, Plus, Dog } from 'lucide-react';
import { Pet } from '@/types';

interface PetSelectorProps {
  pets: Pet[];
  selectedPet: Pet | null;
  onSelectPet: (pet: Pet) => void;
  onAddPetClick: () => void;
}

export const PetSelector: React.FC<PetSelectorProps> = ({
  pets,
  selectedPet,
  onSelectPet,
  onAddPetClick,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative inline-block text-left z-30">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 bg-white border border-slate-200 hover:border-brand-coral/50 px-4 py-2.5 rounded-2xl shadow-xs transition-all"
      >
        <div className="w-8 h-8 rounded-full bg-brand-coral/10 text-brand-coral flex items-center justify-center overflow-hidden font-bold text-sm">
          {selectedPet?.photo ? (
            <img src={selectedPet.photo} alt={selectedPet.name} className="w-full h-full object-cover" />
          ) : (
            <Dog className="w-4 h-4" />
          )}
        </div>
        <div className="text-left">
          <div className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
            {selectedPet ? selectedPet.name : 'Select Pet'}
            <ChevronDown className="w-4 h-4 text-slate-400" />
          </div>
          <p className="text-[11px] text-slate-500">{selectedPet?.breed || 'Manage profile'}</p>
        </div>
      </button>

      {isOpen && (
        <div className="absolute left-0 mt-2 w-64 rounded-2xl bg-white shadow-xl border border-slate-100 p-2 z-50 animate-fadeIn">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-3 py-1.5">
            My Pets
          </div>

          <div className="space-y-1 max-h-60 overflow-y-auto">
            {pets.map((pet) => (
              <button
                key={pet.id}
                onClick={() => {
                  onSelectPet(pet);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-left transition-colors ${
                  selectedPet?.id === pet.id
                    ? 'bg-brand-coral/10 text-brand-coral font-bold'
                    : 'hover:bg-slate-50 text-slate-700 font-medium'
                }`}
              >
                <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center overflow-hidden shrink-0">
                  {pet.photo ? (
                    <img src={pet.photo} alt={pet.name} className="w-full h-full object-cover" />
                  ) : (
                    <Dog className="w-4 h-4 text-slate-400" />
                  )}
                </div>
                <div className="truncate flex-1">
                  <div className="text-sm truncate">{pet.name}</div>
                  <div className="text-[10px] text-slate-400 truncate">{pet.breed}</div>
                </div>
                {pet.isLost && (
                  <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" title="Marked Lost" />
                )}
              </button>
            ))}
          </div>

          <div className="pt-2 mt-2 border-t border-slate-100">
            <button
              onClick={() => {
                setIsOpen(false);
                onAddPetClick();
              }}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-brand-coral hover:bg-brand-coral/5 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Pet</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
