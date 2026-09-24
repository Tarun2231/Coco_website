'use client';

import React, { useState, useEffect } from 'react';
import {
  Syringe,
  CheckCircle2,
  Calendar,
  Plus,
  Clock,
  AlertCircle,
  Dog,
  Edit3,
  Hash,
  DollarSign,
  Trash2,
  Camera,
  Eye,
  X,
  Upload,
  FileText,
  Image as ImageIcon,
} from 'lucide-react';
import { formatDate, formatCurrency } from '@/lib/utils';
import { Button } from '@/components/ui/Button';

export interface VaccinationItem {
  id: string;
  petId: string;
  vaccineName: string;
  doseCount?: number | string;
  cost?: number | string;
  dateAdministered: string;
  nextDueDate?: string;
  vetName?: string;
  clinic?: string;
  notes?: string;
  photo?: string;
  status: string;
}

interface VaccinationsClientProps {
  initialVaccinations: VaccinationItem[];
  petId: string;
  petName: string;
}

export const COMPREHENSIVE_PET_VACCINES = [
  'Rabies Anti-Rabies Vaccine (ARV 1-Year)',
  'Rabies Anti-Rabies Vaccine (ARV 3-Year)',
  'DHPPi + L (7-in-1 Core Combination Shot)',
  'DHPPi + L4 (9-in-1 Mega Combination Shot)',
  'DHPP Core Vaccine (Distemper, Hepatitis, Parvo, Parainfluenza)',
  'Canine Parvovirus Booster Shot (CPV)',
  'Bordetella Kennel Cough (Oral/Nasal Spray)',
  'Leptospirosis 4-Strain Protection (L4)',
  'Lyme Disease Vaccine (Borrelia Burgdorferi)',
  'Canine Coronavirus Protection (CCV)',
  'Feline FVRCP (Cat 3-in-1 Core Vaccine)',
  'Feline Leukemia Virus Protection (FeLV)',
  'Annual Immunity Booster Drive',
  'Deworming & Anti-Parasite Shot',
  'Custom / Special Vet Vaccine',
];

export const VaccinationsClient: React.FC<VaccinationsClientProps> = ({
  initialVaccinations,
  petId,
  petName,
}) => {
  const [allPets, setAllPets] = useState<any[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('puppy_id_pets');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        } catch (e) {}
      }
    }
    return [];
  });

  const [selectedPetId, setSelectedPetId] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('puppy_id_pets');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            const match = parsed.find(
              (p: any) =>
                String(p.id).toLowerCase() === String(petId).toLowerCase() ||
                String(p.publicId).toLowerCase() === String(petId).toLowerCase()
            );
            return match ? match.id : parsed[0].id;
          }
        } catch (e) {}
      }
    }
    return petId;
  });

  const [currentPetName, setCurrentPetName] = useState<string>(() => {
    if (allPets.length > 0) {
      const match = allPets.find((p) => p.id === selectedPetId || p.publicId === selectedPetId);
      return match ? match.name : allPets[0].name;
    }
    return petName;
  });

  const [vaccinations, setVaccinations] = useState<VaccinationItem[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('puppy_id_pets');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            const currentPet =
              parsed.find(
                (p: any) =>
                  String(p.id).toLowerCase() === String(selectedPetId).toLowerCase() ||
                  String(p.publicId).toLowerCase() === String(selectedPetId).toLowerCase()
              ) || parsed[0];
            if (currentPet?.vaccinations && Array.isArray(currentPet.vaccinations)) {
              return currentPet.vaccinations;
            }
          }
        } catch (e) {
          console.error(e);
        }
      }
    }
    return initialVaccinations;
  });

  // Re-fetch latest authoritative data from API
  useEffect(() => {
    const fetchLatest = async () => {
      try {
        const res = await fetch('/api/pets', { cache: 'no-store' });
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data.pets) && data.pets.length > 0) {
            setAllPets(data.pets);
            const currentPet =
              data.pets.find(
                (p: any) =>
                  String(p.id).toLowerCase() === String(selectedPetId).toLowerCase() ||
                  String(p.publicId).toLowerCase() === String(selectedPetId).toLowerCase()
              ) || data.pets[0];

            if (currentPet) {
              setSelectedPetId(currentPet.id);
              setCurrentPetName(currentPet.name);
              const serverVacs = currentPet.vaccinations || [];

              // Merge local & server vaccinations so newly added vaccines are NEVER lost by race conditions
              setVaccinations((prevLocal) => {
                const map = new Map<string, VaccinationItem>();
                serverVacs.forEach((v: VaccinationItem) => map.set(v.id, v));
                prevLocal.forEach((v: VaccinationItem) => {
                  if (!map.has(v.id)) {
                    map.set(v.id, v);
                  }
                });
                return Array.from(map.values());
              });
            }
          }
        }
      } catch (e) {
        console.error('Fetch vaccinations error:', e);
      }
    };
    fetchLatest();

    const timer = setInterval(() => {
      fetchLatest();
    }, 5000);

    const handleStorageUpdate = () => fetchLatest();
    window.addEventListener('puppy_id_pets_updated', handleStorageUpdate);
    window.addEventListener('focus', handleStorageUpdate);

    return () => {
      clearInterval(timer);
      window.removeEventListener('puppy_id_pets_updated', handleStorageUpdate);
      window.removeEventListener('focus', handleStorageUpdate);
    };
  }, [selectedPetId]);

  // Add Vaccination Form State
  const [vaccineName, setVaccineName] = useState(COMPREHENSIVE_PET_VACCINES[0]);
  const [doseCount, setDoseCount] = useState<string>('1');
  const [cost, setCost] = useState<string>('1500');
  const [dateAdministered, setDateAdministered] = useState(new Date().toISOString().split('T')[0]);
  const [nextDueDate, setNextDueDate] = useState('');
  const [vetName, setVetName] = useState('');
  const [clinic, setClinic] = useState('');
  const [status, setStatus] = useState('COMPLETED');
  const [addReminderAlert, setAddReminderAlert] = useState(true);
  const [notes, setNotes] = useState('');
  const [photo, setPhoto] = useState<string>('');
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  // Quick Count Add Modal State
  const [isQuickCountOpen, setIsQuickCountOpen] = useState(false);
  const [customCountInput, setCustomCountInput] = useState('');

  // Edit & View Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingVac, setEditingVac] = useState<VaccinationItem | null>(null);
  const [editVaccineName, setEditVaccineName] = useState('');
  const [editDoseCount, setEditDoseCount] = useState('1');
  const [editCost, setEditCost] = useState('0');
  const [editDateAdministered, setEditDateAdministered] = useState('');
  const [editNextDueDate, setEditNextDueDate] = useState('');
  const [editVetName, setEditVetName] = useState('');
  const [editClinic, setEditClinic] = useState('');
  const [editNotes, setEditNotes] = useState('');
  const [editStatus, setEditStatus] = useState('COMPLETED');
  const [editPhoto, setEditPhoto] = useState('');
  const [editPhotoPreview, setEditPhotoPreview] = useState<string | null>(null);
  const [isEditLoading, setIsEditLoading] = useState(false);
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  // Lightbox View Photo State
  const [viewingPhotoUrl, setViewingPhotoUrl] = useState<string | null>(null);

  const handlePetChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const targetId = e.target.value;
    setSelectedPetId(targetId);
    const targetPet = allPets.find((p) => p.id === targetId || p.publicId === targetId);
    if (targetPet) {
      setCurrentPetName(targetPet.name);
      setVaccinations(targetPet.vaccinations || []);
    }
  };

  const handlePhotoFileChange = (e: React.ChangeEvent<HTMLInputElement>, isEdit: boolean = false) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        if (isEdit) {
          setEditPhoto(result);
          setEditPhotoPreview(result);
        } else {
          setPhoto(result);
          setPhotoPreview(result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const syncVaccinationsToStorage = (updatedVacs: VaccinationItem[], updatedExpenses?: any[]) => {
    setVaccinations(updatedVacs);
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('puppy_id_pets');
      let petsArr = saved ? JSON.parse(saved) : allPets;
      if (!Array.isArray(petsArr) || petsArr.length === 0) {
        petsArr = [
          {
            id: selectedPetId || 'pet-demo-id',
            publicId: 'bruno-demo',
            name: currentPetName || 'Bruno',
            breed: 'Golden Retriever',
            vaccinations: updatedVacs,
            expenses: updatedExpenses || [],
          },
        ];
      }

      const searchId = String(selectedPetId).toLowerCase();
      let matched = false;
      const updatedPets = petsArr.map((p: any) => {
        if (
          String(p.id).toLowerCase() === searchId ||
          String(p.publicId).toLowerCase() === searchId ||
          petsArr.length === 1
        ) {
          matched = true;
          return {
            ...p,
            vaccinations: updatedVacs,
            expenses: updatedExpenses || p.expenses || [],
          };
        }
        return p;
      });

      if (!matched && updatedPets.length > 0) {
        updatedPets[0] = {
          ...updatedPets[0],
          vaccinations: updatedVacs,
          expenses: updatedExpenses || updatedPets[0].expenses || [],
        };
      }

      localStorage.setItem('puppy_id_pets', JSON.stringify(updatedPets));
      window.dispatchEvent(new Event('puppy_id_pets_updated'));
      return updatedPets;
    }
    return [];
  };

  // Add Vaccination Submit Handler
  const handleAddVaccination = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!vaccineName || !dateAdministered) return;

    setIsSubmitting(true);
    const countNum = parseInt(doseCount) || 1;
    const costVal = parseFloat(cost) || 0;
    const displayName = countNum > 1 ? `${vaccineName} (Dose #${countNum})` : vaccineName;

    const newVac: VaccinationItem = {
      id: `vac-${Date.now()}`,
      petId: selectedPetId,
      vaccineName: displayName,
      doseCount: countNum,
      cost: costVal,
      dateAdministered,
      nextDueDate: nextDueDate || undefined,
      vetName: vetName || 'Dr. Rahul Verma',
      clinic: clinic || 'Banjara Vet Hospital',
      notes,
      photo: photo || undefined,
      status,
    };

    const updatedVacs = [newVac, ...vaccinations];

    // Create linked expense record for transaction tracking across dashboard & admin
    let updatedExpenses: any[] | undefined = undefined;
    const targetPet = allPets.find((p) => p.id === selectedPetId || p.publicId === selectedPetId) || allPets[0];
    if (costVal > 0) {
      const currentExps = targetPet?.expenses || [];
      const newVacExpense = {
        id: `exp-vac-${newVac.id}`,
        petId: selectedPetId,
        category: 'Vaccination',
        description: `Vaccination: ${displayName}`,
        amount: costVal,
        currency: '₹',
        date: dateAdministered,
        vendor: clinic || 'Banjara Vet Hospital',
        paymentMethod: 'UPI',
      };
      updatedExpenses = [newVacExpense, ...currentExps];
    }

    // Save timestamped Activity & Transaction Log Entry
    if (typeof window !== 'undefined') {
      const now = new Date();
      const newAct = {
        id: `act-${Date.now()}`,
        timestamp: now.toISOString(),
        formattedTime: `${now.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} • ${now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`,
        type: 'VACCINE_ADDED',
        title: `Vaccine & Expense Logged: "${displayName}" (${formatCurrency(costVal)})`,
        details: `Transaction: ${formatCurrency(costVal)} • Given: ${dateAdministered} • Vet: ${vetName || 'Dr. Verma'}`,
        petName: currentPetName,
      };
      const savedActs = localStorage.getItem('puppy_id_activities');
      let currentActs = savedActs ? JSON.parse(savedActs) : [];
      if (!Array.isArray(currentActs)) currentActs = [];
      localStorage.setItem('puppy_id_activities', JSON.stringify([newAct, ...currentActs]));
    }

    // Update state & localStorage immediately
    const updatedPetsArr = syncVaccinationsToStorage(updatedVacs, updatedExpenses);

    setNotice(`✅ Vaccine & Transaction Amount (${formatCurrency(costVal)}) saved & linked across Dashboard!`);
    setTimeout(() => setNotice(null), 4500);

    setDoseCount('1');
    setCost('1500');
    setNextDueDate('');
    setVetName('');
    setClinic('');
    setNotes('');
    setPhoto('');
    setPhotoPreview(null);
    setIsSubmitting(false);

    try {
      // 1. Post to vaccinations API
      await fetch('/api/vaccinations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newVac),
      });

      // 2. Post to expenses API so transaction is saved on server
      if (costVal > 0) {
        await fetch('/api/expenses', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: `exp-vac-${newVac.id}`,
            petId: selectedPetId,
            category: 'Vaccination',
            description: `Vaccination: ${displayName}`,
            amount: costVal,
            currency: '₹',
            date: dateAdministered,
            vendor: clinic || 'Banjara Vet Hospital',
          }),
        });
      }

      // 3. Update pet object in cloud store for Admin Panel & Owner Dashboard sync
      const activePetToSave = targetPet || (updatedPetsArr.length > 0 ? updatedPetsArr[0] : null);
      if (activePetToSave) {
        const updatedPetPayload = {
          ...activePetToSave,
          vaccinations: updatedVacs,
          expenses: updatedExpenses || activePetToSave.expenses || [],
        };
        await fetch('/api/pets', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updatedPetPayload),
        });
      }

      if (addReminderAlert && nextDueDate) {
        await fetch('/api/reminders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            petId: selectedPetId,
            category: 'Vaccination',
            title: `${displayName} Booster Shot`,
            date: nextDueDate,
            repeat: 'ONCE',
          }),
        });
      }
    } catch (err) {
      console.error('Save vaccination API error:', err);
    }
  };

  // Open Edit & View Modal (Fetches latest authoritative state from DB)
  const handleOpenEditModal = async (vac: VaccinationItem) => {
    setIsEditLoading(true);
    setIsEditModalOpen(true);
    try {
      const res = await fetch(`/api/vaccinations?petId=${selectedPetId}&vacId=${vac.id}`, { cache: 'no-store' });
      let latestVac = vac;
      if (res.ok) {
        const data = await res.json();
        if (data.vaccination) {
          latestVac = data.vaccination;
        }
      }
      setEditingVac(latestVac);
      setEditVaccineName(latestVac.vaccineName);
      setEditDoseCount(String(latestVac.doseCount || 1));
      setEditCost(String(latestVac.cost || 0));
      setEditDateAdministered(latestVac.dateAdministered);
      setEditNextDueDate(latestVac.nextDueDate || '');
      setEditVetName(latestVac.vetName || '');
      setEditClinic(latestVac.clinic || '');
      setEditNotes(latestVac.notes || '');
      setEditStatus(latestVac.status || 'COMPLETED');
      setEditPhoto(latestVac.photo || '');
      setEditPhotoPreview(latestVac.photo || null);
    } catch (e) {
      console.error('Failed to fetch latest vaccination from DB:', e);
      setEditingVac(vac);
      setEditVaccineName(vac.vaccineName);
      setEditDoseCount(String(vac.doseCount || 1));
      setEditCost(String(vac.cost || 0));
      setEditDateAdministered(vac.dateAdministered);
      setEditNextDueDate(vac.nextDueDate || '');
      setEditVetName(vac.vetName || '');
      setEditClinic(vac.clinic || '');
      setEditNotes(vac.notes || '');
      setEditStatus(vac.status || 'COMPLETED');
      setEditPhoto(vac.photo || '');
      setEditPhotoPreview(vac.photo || null);
    } finally {
      setIsEditLoading(false);
    }
  };

  // Save Edit Handler
  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingVac) return;
    setIsSavingEdit(true);

    const countNum = parseInt(editDoseCount) || 1;
    const costVal = parseFloat(editCost) || 0;

    const updatedVac: VaccinationItem = {
      ...editingVac,
      vaccineName: editVaccineName,
      doseCount: countNum,
      cost: costVal,
      dateAdministered: editDateAdministered,
      nextDueDate: editNextDueDate || undefined,
      vetName: editVetName || 'Dr. Rahul Verma',
      clinic: editClinic || 'Banjara Vet Hospital',
      notes: editNotes,
      status: editStatus,
      // Preserve existing photo if not explicitly replaced
      photo: editPhoto !== undefined ? editPhoto : editingVac.photo,
    };

    const updatedVacs = vaccinations.map((v) => (v.id === editingVac.id ? updatedVac : v));
    const targetPet = allPets.find((p) => p.id === selectedPetId || p.publicId === selectedPetId) || allPets[0];
    let updatedExpenses: any[] | undefined = undefined;

    if (targetPet && targetPet.expenses) {
      const vacExpId = `exp-vac-${editingVac.id}`;
      if (costVal > 0) {
        const expExists = targetPet.expenses.some((e: any) => e.id === vacExpId);
        if (expExists) {
          updatedExpenses = targetPet.expenses.map((e: any) =>
            e.id === vacExpId
              ? {
                  ...e,
                  description: `Vaccination: ${editVaccineName}`,
                  amount: costVal,
                  date: editDateAdministered,
                  vendor: editClinic || 'Vet Clinic',
                }
              : e
          );
        } else {
          updatedExpenses = [
            {
              id: vacExpId,
              petId: selectedPetId,
              category: 'Vaccination',
              description: `Vaccination: ${editVaccineName}`,
              amount: costVal,
              currency: '₹',
              date: editDateAdministered,
              vendor: editClinic || 'Vet Clinic',
            },
            ...targetPet.expenses,
          ];
        }
      } else {
        updatedExpenses = targetPet.expenses.filter((e: any) => e.id !== vacExpId);
      }
    }

    const updatedPetsArr = syncVaccinationsToStorage(updatedVacs, updatedExpenses);

    setNotice(`✅ Vaccination record updated and saved to DB!`);
    setTimeout(() => setNotice(null), 4000);

    setIsEditModalOpen(false);
    setIsSavingEdit(false);

    try {
      await fetch('/api/vaccinations', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedVac),
      });

      const activePetToSave = targetPet || (updatedPetsArr.length > 0 ? updatedPetsArr[0] : null);
      if (activePetToSave) {
        const updatedPetPayload = {
          ...activePetToSave,
          vaccinations: updatedVacs,
          expenses: updatedExpenses || activePetToSave.expenses || [],
        };
        await fetch('/api/pets', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updatedPetPayload),
        });
      }
    } catch (err) {
      console.error('Update vaccination API error:', err);
    }
  };

  // Delete Vaccination Record with Confirmation Statement
  const handleDeleteVaccination = async (vac: VaccinationItem) => {
    const confirmDelete = window.confirm(`Are you sure you want to delete the vaccination record "${vac.vaccineName}"?`);
    if (!confirmDelete) return;

    if (isEditModalOpen) setIsEditModalOpen(false);

    const updatedVacs = vaccinations.filter((v) => v.id !== vac.id);
    const targetPet = allPets.find((p) => p.id === selectedPetId || p.publicId === selectedPetId) || allPets[0];
    let updatedExpenses: any[] | undefined = undefined;

    if (targetPet && targetPet.expenses) {
      updatedExpenses = targetPet.expenses.filter((e: any) => e.id !== `exp-vac-${vac.id}`);
    }

    if (typeof window !== 'undefined') {
      const now = new Date();
      const newAct = {
        id: `act-${Date.now()}`,
        timestamp: now.toISOString(),
        formattedTime: `${now.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} • ${now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`,
        type: 'VACCINE_DELETED',
        title: `Removed Vaccine Record: "${vac.vaccineName}"`,
        details: `Vaccination record & transaction deleted from registry`,
        petName: currentPetName,
      };
      const savedActs = localStorage.getItem('puppy_id_activities');
      let currentActs = savedActs ? JSON.parse(savedActs) : [];
      if (!Array.isArray(currentActs)) currentActs = [];
      localStorage.setItem('puppy_id_activities', JSON.stringify([newAct, ...currentActs]));
    }

    const updatedPetsArr = syncVaccinationsToStorage(updatedVacs, updatedExpenses);

    setNotice(`✅ Vaccination record "${vac.vaccineName}" removed.`);
    setTimeout(() => setNotice(null), 3500);

    try {
      await fetch(`/api/vaccinations?petId=${selectedPetId}&vacId=${vac.id}`, { method: 'DELETE' });

      const activePetToSave = targetPet || (updatedPetsArr.length > 0 ? updatedPetsArr[0] : null);
      if (activePetToSave) {
        const updatedPetPayload = {
          ...activePetToSave,
          vaccinations: updatedVacs,
          expenses: updatedExpenses || activePetToSave.expenses || [],
        };
        await fetch('/api/pets', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updatedPetPayload),
        });
      }
    } catch (err) {
      console.error('Delete vaccination API error:', err);
    }
  };

  // Quick Add Count Handler
  const handleQuickAddCountSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const countToAdd = parseInt(customCountInput) || 1;
    if (countToAdd <= 0) return;

    const newItems: VaccinationItem[] = [];
    const todayStr = new Date().toISOString().split('T')[0];

    for (let i = 1; i <= countToAdd; i++) {
      newItems.push({
        id: `vac-quick-${Date.now()}-${i}`,
        petId: selectedPetId,
        vaccineName: `Immunization Record #${vaccinations.length + i}`,
        doseCount: vaccinations.length + i,
        cost: 1500,
        dateAdministered: todayStr,
        vetName: 'Dr. Rahul Verma',
        clinic: 'Banjara Vet Hospital',
        status: 'COMPLETED',
      });
    }

    const updatedVacs = [...newItems, ...vaccinations];
    const updatedPetsArr = syncVaccinationsToStorage(updatedVacs);

    setNotice(`✅ Added ${countToAdd} vaccination count(s) for ${currentPetName}!`);
    setTimeout(() => setNotice(null), 4000);
    setIsQuickCountOpen(false);
    setCustomCountInput('');

    try {
      const targetPet = allPets.find((p) => p.id === selectedPetId || p.publicId === selectedPetId) || (updatedPetsArr.length > 0 ? updatedPetsArr[0] : null);
      if (targetPet) {
        const updatedPet = { ...targetPet, vaccinations: updatedVacs };
        await fetch('/api/pets', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updatedPet),
        });
      }
    } catch (err) {
      console.error(err);
    }
  };

  const totalVacCost = vaccinations.reduce((acc, curr) => acc + Number(curr.cost || 0), 0);

  return (
    <div className="space-y-6 max-w-6xl animate-fadeIn text-slate-800">
      {/* Header & Pet Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Vaccination Records, Cost & History</h1>
          <p className="text-sm text-slate-500 font-medium">
            Immunization history, vaccination cost, doctor details & certificates for <strong className="text-slate-800">{currentPetName}</strong>
          </p>
        </div>

        {/* Pet Selector Dropdown */}
        {allPets.length > 1 && (
          <div className="flex items-center gap-2 bg-white px-3.5 py-2 rounded-2xl border border-slate-200 shadow-xs">
            <Dog className="w-4 h-4 text-emerald-600" />
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

      {/* Notice Banner */}
      {notice && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-2.5 rounded-2xl text-xs font-bold flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{notice}</span>
        </div>
      )}

      {/* Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (5 cols): Summary Stat & Add Form */}
        <div className="lg:col-span-5 space-y-5">
          {/* Quick Summary Card */}
          <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Total Immunizations</span>
                <div className="text-2xl font-black text-slate-900 mt-1">{vaccinations.length}</div>
                <p className="text-[10px] text-slate-500 mt-0.5 font-medium">Vaccine count</p>
              </div>

              <div>
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Total Vaccine Cost</span>
                <div className="text-2xl font-black text-emerald-700 mt-1">{formatCurrency(totalVacCost)}</div>
                <p className="text-[10px] text-slate-500 mt-0.5 font-medium">Linked to expenses</p>
              </div>
            </div>

            {/* QUICK ADD VACCINATION COUNT BUTTON */}
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => setIsQuickCountOpen(!isQuickCountOpen)}
                className="w-full py-2 px-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-extrabold text-xs rounded-xl border border-emerald-200 flex items-center justify-center gap-1.5 transition-colors"
              >
                <Plus className="w-4 h-4 text-emerald-600" />
                <span>➕ Quick Add / Set Vaccination Count</span>
              </button>
            </div>

            {/* Quick Count Inline Form */}
            {isQuickCountOpen && (
              <form onSubmit={handleQuickAddCountSubmit} className="pt-2 space-y-2 animate-fadeIn">
                <label className="block text-[10px] font-bold text-slate-600 uppercase">
                  How many vaccination counts to add for {currentPetName}?
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    min="1"
                    max="50"
                    required
                    value={customCountInput}
                    onChange={(e) => setCustomCountInput(e.target.value)}
                    placeholder="e.g. 1, 2, 5"
                    className="flex-1 px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-bold"
                  />
                  <button
                    type="submit"
                    className="px-4 py-1.5 bg-emerald-600 text-white font-extrabold text-xs rounded-xl shadow-xs"
                  >
                    Add Count
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Add Vaccine Record Form */}
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4">
            <div className="flex items-center justify-between text-slate-900 font-extrabold text-base border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <Plus className="w-5 h-5" />
                </div>
                <span>Add Vaccine Record</span>
              </div>
            </div>

            <form onSubmit={handleAddVaccination} className="space-y-3">
              {/* Target Pet Selection */}
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

              {/* Vaccine Type Dropdown */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Vaccine Name / Type *</label>
                <select
                  value={vaccineName}
                  onChange={(e) => setVaccineName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-extrabold text-slate-900 focus:ring-2 focus:ring-emerald-500 bg-white"
                >
                  {COMPREHENSIVE_PET_VACCINES.map((vac) => (
                    <option key={vac} value={vac}>
                      💉 {vac}
                    </option>
                  ))}
                </select>
              </div>

              {/* DOSE COUNT & COST */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1 flex items-center gap-1">
                    <Hash className="w-3 h-3 text-emerald-600" />
                    <span>Dose / Count #</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="20"
                    value={doseCount}
                    onChange={(e) => setDoseCount(e.target.value)}
                    placeholder="1"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-extrabold focus:ring-2 focus:ring-emerald-500 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1 flex items-center gap-1">
                    <DollarSign className="w-3 h-3 text-emerald-600" />
                    <span>Transaction Cost (₹)</span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={cost}
                    onChange={(e) => setCost(e.target.value)}
                    placeholder="1500"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-extrabold focus:ring-2 focus:ring-emerald-500 bg-white"
                  />
                </div>
              </div>

              {/* DATES */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Date Given *</label>
                  <input
                    type="date"
                    required
                    value={dateAdministered}
                    onChange={(e) => setDateAdministered(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Next Due Date</label>
                  <input
                    type="date"
                    value={nextDueDate}
                    onChange={(e) => setNextDueDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500 bg-white"
                  />
                </div>
              </div>

              {/* DOCTOR NAME & HOSPITAL NAME */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Doctor Name</label>
                  <input
                    type="text"
                    value={vetName}
                    onChange={(e) => setVetName(e.target.value)}
                    placeholder="Dr. Rahul Verma"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Hospital / Clinic</label>
                  <input
                    type="text"
                    value={clinic}
                    onChange={(e) => setClinic(e.target.value)}
                    placeholder="Banjara Vet Hospital"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500 bg-white"
                  />
                </div>
              </div>

              {/* STATUS & NOTES */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Status *</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold focus:ring-2 focus:ring-emerald-500 bg-white"
                  >
                    <option value="COMPLETED">✅ COMPLETED</option>
                    <option value="UPCOMING">⏰ UPCOMING</option>
                    <option value="OVERDUE">⚠️ OVERDUE</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Notes (Optional)</label>
                  <input
                    type="text"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Batch #, reaction, etc."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500 bg-white"
                  />
                </div>
              </div>

              {/* VACCINATION IMAGE / PHOTO UPLOAD */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1 flex items-center gap-1">
                  <Camera className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Vaccination Photo / Certificate</span>
                </label>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <label className="flex-1 px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer transition-colors">
                      <Upload className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Upload Certificate / Photo</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handlePhotoFileChange(e, false)}
                        className="hidden"
                      />
                    </label>
                  </div>

                  {photoPreview && (
                    <div className="relative w-20 h-20 rounded-2xl overflow-hidden border border-emerald-300 shadow-xs group">
                      <img src={photoPreview} alt="Vaccine Certificate Preview" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => {
                          setPhoto('');
                          setPhotoPreview(null);
                        }}
                        className="absolute top-1 right-1 bg-rose-600 text-white p-1 rounded-full text-[10px] shadow-sm hover:bg-rose-700"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* AUTO-REMINDER CHECKBOX */}
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="add-reminder"
                  checked={addReminderAlert}
                  onChange={(e) => setAddReminderAlert(e.target.checked)}
                  className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                />
                <label htmlFor="add-reminder" className="text-xs font-semibold text-slate-700 cursor-pointer">
                  🔔 Auto-create care reminder alert for next booster
                </label>
              </div>

              <Button
                type="submit"
                variant="primary"
                disabled={isSubmitting}
                className="w-full font-bold shadow-md bg-emerald-600 hover:bg-emerald-700 mt-2"
                icon={<Plus className="w-4 h-4" />}
              >
                {isSubmitting ? 'Saving & Syncing...' : `Save Vaccine & Transaction for ${currentPetName}`}
              </Button>
            </form>
          </div>
        </div>

        {/* Right Column (7 cols): Vaccination Records Table */}
        <div className="lg:col-span-7 space-y-5">
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-extrabold text-slate-900">
                Immunization History Log for {currentPetName}
              </h3>
              <span className="text-xs font-black text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                Count: {vaccinations.length} Records
              </span>
            </div>

            {vaccinations.length === 0 ? (
              <p className="text-xs text-slate-400 italic text-center py-8">
                No vaccination records logged yet for {currentPetName}. Add your first record on the left!
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase">
                      <th className="py-3 px-2">Photo</th>
                      <th className="py-3 px-3">Vaccine Name & Doctor</th>
                      <th className="py-3 px-3">Cost (₹)</th>
                      <th className="py-3 px-3">Date Given</th>
                      <th className="py-3 px-3">Next Due</th>
                      <th className="py-3 px-3 text-right">Actions / Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50 text-xs">
                    {vaccinations.map((vac) => (
                      <tr key={vac.id} className="hover:bg-slate-50/70 transition-colors">
                        {/* PHOTO THUMBNAIL */}
                        <td className="py-3.5 px-2">
                          {vac.photo ? (
                            <button
                              type="button"
                              onClick={() => setViewingPhotoUrl(vac.photo || null)}
                              title="Click to view vaccination certificate"
                              className="w-10 h-10 rounded-xl overflow-hidden border border-slate-200 hover:opacity-80 transition-opacity flex-shrink-0"
                            >
                              <img src={vac.photo} alt={vac.vaccineName} className="w-full h-full object-cover" />
                            </button>
                          ) : (
                            <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400">
                              <Syringe className="w-5 h-5 text-emerald-600" />
                            </div>
                          )}
                        </td>

                        {/* VACCINE NAME & DOCTOR */}
                        <td className="py-3.5 px-3">
                          <div className="font-extrabold text-slate-900 flex items-center gap-1.5">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                            <span>{vac.vaccineName}</span>
                          </div>
                          <div className="text-[11px] text-slate-500 font-medium mt-0.5">
                            👨‍⚕️ {vac.vetName || 'Dr. Rahul Verma'} • 🏥 {vac.clinic || 'Banjara Vet Hospital'}
                          </div>
                        </td>

                        {/* COST */}
                        <td className="py-3.5 px-3 font-black text-emerald-700">
                          {Number(vac.cost || 0) > 0 ? formatCurrency(Number(vac.cost)) : 'Free'}
                        </td>

                        {/* DATE GIVEN */}
                        <td className="py-3.5 px-3 font-semibold text-slate-700">{formatDate(vac.dateAdministered)}</td>

                        {/* NEXT DUE */}
                        <td className="py-3.5 px-3 font-semibold text-slate-700">
                          {vac.nextDueDate ? formatDate(vac.nextDueDate) : 'N/A'}
                        </td>

                        {/* ACTIONS & STATUS */}
                        <td className="py-3.5 px-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <span
                              className={`px-2 py-0.5 rounded-full font-bold text-[9px] uppercase ${
                                vac.status === 'COMPLETED'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : vac.status === 'UPCOMING'
                                  ? 'bg-amber-100 text-amber-800'
                                  : 'bg-rose-100 text-rose-800'
                              }`}
                            >
                              {vac.status}
                            </span>

                            {/* VIEW / EDIT BUTTON */}
                            <button
                              type="button"
                              onClick={() => handleOpenEditModal(vac)}
                              title="View / Edit Vaccination Details"
                              className="p-1.5 text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors flex items-center gap-1"
                            >
                              <Edit3 className="w-3.5 h-3.5 text-emerald-600" />
                            </button>

                            {/* DELETE BUTTON */}
                            <button
                              type="button"
                              onClick={() => handleDeleteVaccination(vac)}
                              title="Delete Vaccination Record"
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* EDIT & VIEW VACCINATION MODAL */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
                  <Syringe className="w-5 h-5 text-emerald-600" />
                  <span>Edit Vaccination Record</span>
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  Authoritative database record for <strong>{currentPetName}</strong>
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {isEditLoading ? (
              <div className="py-8 text-center text-xs font-bold text-slate-500">
                Loading authoritative database record...
              </div>
            ) : (
              <form onSubmit={handleSaveEdit} className="space-y-4">
                {/* Vaccine Name */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Vaccine Name *</label>
                  <input
                    type="text"
                    required
                    value={editVaccineName}
                    onChange={(e) => setEditVaccineName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-extrabold focus:ring-2 focus:ring-emerald-500 bg-white"
                  />
                </div>

                {/* DOCTOR NAME & HOSPITAL NAME */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Doctor Name</label>
                    <input
                      type="text"
                      value={editVetName}
                      onChange={(e) => setEditVetName(e.target.value)}
                      placeholder="Dr. Rahul Verma"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Hospital / Clinic</label>
                    <input
                      type="text"
                      value={editClinic}
                      onChange={(e) => setEditClinic(e.target.value)}
                      placeholder="Banjara Vet Hospital"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                {/* DOSE COUNT & COST */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Dose Count #</label>
                    <input
                      type="number"
                      min="1"
                      value={editDoseCount}
                      onChange={(e) => setEditDoseCount(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Cost (₹)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={editCost}
                      onChange={(e) => setEditCost(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                {/* DATES */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Date Given *</label>
                    <input
                      type="date"
                      required
                      value={editDateAdministered}
                      onChange={(e) => setEditDateAdministered(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Next Due Date</label>
                    <input
                      type="date"
                      value={editNextDueDate}
                      onChange={(e) => setEditNextDueDate(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                {/* STATUS & NOTES */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Status</label>
                    <select
                      value={editStatus}
                      onChange={(e) => setEditStatus(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold focus:ring-2 focus:ring-emerald-500 bg-white"
                    >
                      <option value="COMPLETED">✅ COMPLETED</option>
                      <option value="UPCOMING">⏰ UPCOMING</option>
                      <option value="OVERDUE">⚠️ OVERDUE</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Notes</label>
                    <input
                      type="text"
                      value={editNotes}
                      onChange={(e) => setEditNotes(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                {/* PHOTO PRESERVATION & UPLOAD */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Vaccination Certificate / Image</label>
                  <div className="space-y-2">
                    {editPhotoPreview ? (
                      <div className="flex items-center gap-3">
                        <div className="relative w-20 h-20 rounded-2xl overflow-hidden border border-emerald-300 shadow-xs">
                          <img src={editPhotoPreview} alt="Certificate" className="w-full h-full object-cover" />
                        </div>
                        <div className="space-y-1">
                          <p className="text-[11px] text-emerald-700 font-bold">Image linked & preserved</p>
                          <button
                            type="button"
                            onClick={() => {
                              setEditPhoto('');
                              setEditPhotoPreview(null);
                            }}
                            className="text-xs text-rose-600 font-bold hover:underline"
                          >
                            Remove / Change Photo
                          </button>
                        </div>
                      </div>
                    ) : (
                      <label className="px-4 py-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer transition-colors w-full">
                        <Upload className="w-4 h-4 text-emerald-600" />
                        <span>Upload New Certificate Photo</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handlePhotoFileChange(e, true)}
                          className="hidden"
                        />
                      </label>
                    )}
                  </div>
                </div>

                {/* MODAL ACTIONS */}
                <div className="flex items-center justify-between pt-3 border-t border-slate-100 gap-3">
                  <button
                    type="button"
                    onClick={() => editingVac && handleDeleteVaccination(editingVac)}
                    className="px-4 py-2 bg-rose-50 text-rose-700 hover:bg-rose-100 font-extrabold text-xs rounded-xl border border-rose-200 flex items-center gap-1.5 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Delete Record</span>
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setIsEditModalOpen(false)}
                      className="px-4 py-2 text-slate-600 hover:bg-slate-100 font-bold text-xs rounded-xl"
                    >
                      Cancel
                    </button>
                    <Button
                      type="submit"
                      variant="primary"
                      disabled={isSavingEdit}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs px-5 py-2 shadow-xs"
                    >
                      {isSavingEdit ? 'Saving...' : 'Save Database Changes'}
                    </Button>
                  </div>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* FULL-SIZE IMAGE LIGHTBOX MODAL */}
      {viewingPhotoUrl && (
        <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="relative max-w-3xl w-full bg-white rounded-3xl overflow-hidden shadow-2xl">
            <button
              type="button"
              onClick={() => setViewingPhotoUrl(null)}
              className="absolute top-4 right-4 bg-slate-900/60 text-white p-2 rounded-full hover:bg-slate-900 transition-colors z-10"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="p-4 bg-slate-950 flex items-center justify-center min-h-[300px] max-h-[80vh]">
              <img src={viewingPhotoUrl} alt="Vaccination Certificate" className="max-w-full max-h-[75vh] object-contain rounded-xl" />
            </div>
            <div className="p-4 bg-white flex items-center justify-between">
              <span className="text-xs font-extrabold text-slate-800">Vaccination Certificate / Receipt</span>
              <button
                type="button"
                onClick={() => setViewingPhotoUrl(null)}
                className="px-4 py-1.5 bg-slate-100 text-slate-800 hover:bg-slate-200 font-bold text-xs rounded-xl"
              >
                Close Viewer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
