'use client';

import React, { useState } from 'react';
import { Pet } from '@/types';
import { ChevronDown, Plus, Dog, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface PetSelectorProps {
  pets: Pet[];
  selectedPet: Pet | null;
  onSelectPet: (pet: Pet) => void;
  onAddPetClick: () => void;
  onDeletePetClick?: (pet: Pet) => void;
}

export const PetSelector: React.FC<PetSelectorProps> = ({
  pets,
  selectedPet,
  onSelectPet,
  onAddPetClick,
  onDeletePetClick,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleMainButtonClick = () => {
    if (!pets || pets.length === 0) {
      onAddPetClick();
    } else {
      setIsOpen(!isOpen);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={handleMainButtonClick}
        className="flex items-center gap-3 px-4 py-2.5 bg-white border border-slate-200 rounded-2xl shadow-xs hover:border-slate-300 transition-all font-semibold text-slate-800 text-sm"
      >
        <div className="w-6 h-6 rounded-full bg-brand-coral/10 text-brand-coral flex items-center justify-center font-bold text-xs">
          {pets && pets.length > 0 ? <Dog className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
        </div>
        <span>
          {selectedPet
            ? selectedPet.name
            : pets && pets.length > 0
            ? 'Select Pet'
            : '➕ Add Your First Pet'}
        </span>
        <ChevronDown className="w-4 h-4 text-slate-400" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl border border-slate-100 shadow-xl py-2 z-30 animate-fadeIn">
          <div className="px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Your Registered Pets
          </div>

          {pets && pets.length > 0 ? (
            pets.map((pet) => (
              <div
                key={pet.id}
                className={`w-full px-3 py-2 text-left text-xs font-bold flex items-center justify-between transition-colors ${
                  selectedPet?.id === pet.id
                    ? 'bg-brand-coral/10 text-brand-coral'
                    : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <button
                  onClick={() => {
                    onSelectPet(pet);
                    setIsOpen(false);
                  }}
                  className="flex-1 text-left flex flex-col"
                >
                  <span className="font-extrabold">{pet.name}</span>
                  <span className="text-[10px] text-slate-400 font-normal">{pet.breed}</span>
                </button>

                {onDeletePetClick && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsOpen(false);
                      onDeletePetClick(pet);
                    }}
                    title={`Delete ${pet.name}`}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors ml-2"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))
          ) : (
            <div className="px-4 py-3 text-xs text-slate-500 italic text-center">
              No pets registered yet
            </div>
          )}

          <div className="pt-2 mt-1 border-t border-slate-100 px-2">
            <Button
              onClick={() => {
                setIsOpen(false);
                onAddPetClick();
              }}
              variant="outline"
              size="sm"
              className="w-full justify-center text-xs font-bold"
              icon={<Plus className="w-3.5 h-3.5" />}
            >
              Add New Pet
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
