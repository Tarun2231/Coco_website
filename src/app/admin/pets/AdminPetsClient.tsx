'use client';

import React, { useState, useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import {
  Download,
  ExternalLink,
  Dog,
  Plus,
  Syringe,
  Edit3,
  CheckCircle2,
  Tag,
  Camera,
  FileText,
  Upload,
  X,
  AlertTriangle,
  QrCode,
  Search,
  DollarSign,
  Bell,
  Printer,
  Sparkles,
} from 'lucide-react';
import Link from 'next/link';
import { getPetPublicUrl } from '@/lib/qr';
import { Button } from '@/components/ui/Button';
import { INDIAN_DOG_BREEDS } from '@/lib/breeds';

interface AdminPetsClientProps {
  initialPets: any[];
}

export const AdminPetsClient: React.FC<AdminPetsClientProps> = ({ initialPets }) => {
  const [pets, setPets] = useState<any[]>(initialPets);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('ALL');

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingPet, setEditingPet] = useState<any | null>(null);
  const [vaccinationPet, setVaccinationPet] = useState<any | null>(null);
  const [expensePet, setExpensePet] = useState<any | null>(null);
  const [reminderPet, setReminderPet] = useState<any | null>(null);
  const [passportPet, setPassportPet] = useState<any | null>(null);

  // Add Step-by-Step Form state
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newPetData, setNewPetData] = useState({
    name: '',
    species: 'Dog',
    breed: 'Golden Retriever',
    gender: 'Male',
    dob: '',
    color: '',
    weight: '',
    microchipId: '',
    registrationNo: '',
    licenseNo: '',
    photo: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=600&h=600&fit=crop',
    importantNotes: '',
    // Initial vaccination
    vaccineName: 'Rabies Anti-Rabies Vaccine',
    dateAdministered: new Date().toISOString().split('T')[0],
    nextDueDate: '',
    vetName: 'Dr. Rahul Verma',
    clinic: 'Banjara Vet Hospital',
    vaccineStatus: 'COMPLETED',
  });

  // Edit Form state
  const [editFormData, setEditFormData] = useState<any>({});

  // Vaccination Form state
  const [newVac, setNewVac] = useState({
    vaccineName: 'Rabies Vaccine',
    dateAdministered: new Date().toISOString().split('T')[0],
    nextDueDate: '',
    vetName: 'Dr. Rahul Verma',
    clinic: 'Banjara Vet Hospital',
    status: 'COMPLETED',
  });

  // Expense Form state
  const [newExp, setNewExp] = useState({
    category: 'Food',
    description: 'Pet Kibble & Treats',
    amount: '',
    vendor: 'Pet Supermarket',
  });

  // Reminder Form state
  const [newRem, setNewRem] = useState({
    category: 'Deworming',
    title: 'Deworming Tablet',
    date: new Date().toISOString().split('T')[0],
    time: '09:00 AM',
    repeat: 'EVERY_3_MONTHS',
    notes: 'Give tablet with breakfast',
  });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const toggleLostStatus = async (petId: string, currentStatus: boolean) => {
    try {
      const res = await fetch(`/api/pets/${petId}/lost`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isLost: !currentStatus }),
      });

      if (res.ok) {
        setPets((prev) =>
          prev.map((p) => (p.id === petId ? { ...p, isLost: !currentStatus } : p))
        );
      }
    } catch (err) {
      console.error('Failed to toggle lost mode:', err);
    }
  };

  const downloadQR = (petName: string, svgId: string) => {
    const svg = document.getElementById(svgId);
    if (!svg) return;
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    img.onload = () => {
      canvas.width = img.width + 40;
      canvas.height = img.height + 40;
      if (ctx) {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 20, 20);
        const pngFile = canvas.toDataURL('image/png');
        const downloadLink = document.createElement('a');
        downloadLink.download = `${petName.toLowerCase()}-qr-code.png`;
        downloadLink.href = pngFile;
        downloadLink.click();
      }
    };
    img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setNewPetData((prev) => ({ ...prev, photo: reader.result as string }));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Submit New Puppy (Step 4)
  const handleAddPuppySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPetData.name) {
      alert('Please enter Puppy Name');
      return;
    }

    setIsSubmitting(true);
    try {
      const initialVaccinations = newPetData.vaccineName
        ? [
            {
              id: `vac-${Date.now()}`,
              petId: '',
              vaccineName: newPetData.vaccineName,
              dateAdministered: newPetData.dateAdministered,
              nextDueDate: newPetData.nextDueDate || undefined,
              vetName: newPetData.vetName,
              clinic: newPetData.clinic,
              status: newPetData.vaccineStatus,
            },
          ]
        : [];

      const payload = {
        ...newPetData,
        vaccinations: initialVaccinations,
      };

      const res = await fetch('/api/pets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => ({}));
      if (data.pet) {
        setPets((prev) => [data.pet, ...prev]);
        setIsAddModalOpen(false);
        setStep(1);
        setNewPetData({
          name: '',
          species: 'Dog',
          breed: 'Golden Retriever',
          gender: 'Male',
          dob: '',
          color: '',
          weight: '',
          microchipId: '',
          registrationNo: '',
          licenseNo: '',
          photo: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=600&h=600&fit=crop',
          importantNotes: '',
          vaccineName: 'Rabies Anti-Rabies Vaccine',
          dateAdministered: new Date().toISOString().split('T')[0],
          nextDueDate: '',
          vetName: 'Dr. Rahul Verma',
          clinic: 'Banjara Vet Hospital',
          vaccineStatus: 'COMPLETED',
        });
      }
    } catch (err) {
      console.error('Failed to add puppy:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Submit Edit Details
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPet) return;

    try {
      const res = await fetch(`/api/pets/${editingPet.id}/lost`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editFormData),
      });

      if (res.ok) {
        setPets((prev) =>
          prev.map((p) => (p.id === editingPet.id ? { ...p, ...editFormData } : p))
        );
        setEditingPet(null);
      }
    } catch (err) {
      console.error('Failed to edit pet:', err);
    }
  };

  // Submit Add Vaccination
  const handleAddVaccinationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!vaccinationPet) return;

    try {
      const payload = { petId: vaccinationPet.id, ...newVac };
      const res = await fetch('/api/vaccinations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => ({}));
      if (data.vaccination) {
        setPets((prev) =>
          prev.map((p) => {
            if (p.id === vaccinationPet.id) {
              const currentVacs = p.vaccinations || [];
              return { ...p, vaccinations: [data.vaccination, ...currentVacs] };
            }
            return p;
          })
        );
        setVaccinationPet((prev: any) =>
          prev ? { ...prev, vaccinations: [data.vaccination, ...(prev.vaccinations || [])] } : null
        );
        setNewVac({
          vaccineName: 'Rabies Vaccine',
          dateAdministered: new Date().toISOString().split('T')[0],
          nextDueDate: '',
          vetName: 'Dr. Rahul Verma',
          clinic: 'Banjara Vet Hospital',
          status: 'COMPLETED',
        });
      }
    } catch (err) {
      console.error('Failed to add vaccination:', err);
    }
  };

  // Submit Add Expense
  const handleAddExpenseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!expensePet || !newExp.amount) return;

    try {
      const payload = { petId: expensePet.id, ...newExp, amount: Number(newExp.amount) };
      const res = await fetch('/api/expenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => ({}));
      if (data.expense) {
        setPets((prev) =>
          prev.map((p) => {
            if (p.id === expensePet.id) {
              const currentExps = p.expenses || [];
              return { ...p, expenses: [data.expense, ...currentExps] };
            }
            return p;
          })
        );
        setExpensePet(null);
        setNewExp({ category: 'Food', description: 'Pet Kibble & Treats', amount: '', vendor: 'Pet Supermarket' });
      }
    } catch (err) {
      console.error('Failed to add expense:', err);
    }
  };

  // Submit Add Reminder
  const handleAddReminderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reminderPet || !newRem.title) return;

    try {
      const payload = { petId: reminderPet.id, ...newRem };
      const res = await fetch('/api/reminders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => ({}));
      if (data.reminder) {
        setPets((prev) =>
          prev.map((p) => {
            if (p.id === reminderPet.id) {
              const currentRems = p.reminders || [];
              return { ...p, reminders: [data.reminder, ...currentRems] };
            }
            return p;
          })
        );
        setReminderPet(null);
        setNewRem({ category: 'Deworming', title: 'Deworming Tablet', date: new Date().toISOString().split('T')[0], time: '09:00 AM', repeat: 'EVERY_3_MONTHS', notes: 'Give tablet with breakfast' });
      }
    } catch (err) {
      console.error('Failed to add reminder:', err);
    }
  };

  // Update existing vaccination status
  const handleUpdateVaccinationStatus = async (petId: string, vacId: string, newStatus: string) => {
    try {
      const res = await fetch('/api/vaccinations', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ petId, id: vacId, status: newStatus }),
      });

      if (res.ok) {
        setPets((prev) =>
          prev.map((p) => {
            if (p.id === petId) {
              const updatedVacs = (p.vaccinations || []).map((v: any) =>
                v.id === vacId ? { ...v, status: newStatus } : v
              );
              return { ...p, vaccinations: updatedVacs };
            }
            return p;
          })
        );
        if (vaccinationPet && vaccinationPet.id === petId) {
          setVaccinationPet((prev: any) => ({
            ...prev,
            vaccinations: (prev.vaccinations || []).map((v: any) =>
              v.id === vacId ? { ...v, status: newStatus } : v
            ),
          }));
        }
      }
    } catch (err) {
      console.error('Failed to update vaccination status:', err);
    }
  };

  // Filtering Logic
  const filteredPets = pets.filter((pet) => {
    const matchesSearch =
      pet.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pet.breed.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (pet.microchipId && pet.microchipId.toLowerCase().includes(searchQuery.toLowerCase()));

    if (!matchesSearch) return false;
    if (filterCategory === 'LOST') return pet.isLost;
    if (filterCategory === 'SAFE') return !pet.isLost;
    if (filterCategory === 'MALE') return pet.gender === 'Male';
    if (filterCategory === 'FEMALE') return pet.gender === 'Female';
    return true;
  });

  const totalPuppies = pets.length;
  const lostPuppiesCount = pets.filter((p) => p.isLost).length;
  const totalVaccinations = pets.reduce((acc, p) => acc + (p.vaccinations?.length || 0), 0);
  const totalScans = pets.reduce((acc, p) => acc + (p.qrCode?.scanCount || 0), 0);

  const isMale = newPetData.gender === 'Male';
  const themeBgClass = isMale
    ? 'bg-blue-50 border-blue-200 text-blue-900'
    : 'bg-rose-50 border-rose-200 text-rose-900';

  const steps = [
    { num: 1, label: 'Details', icon: Dog },
    { num: 2, label: 'ID Tags', icon: Tag },
    { num: 3, label: 'Vaccines', icon: Syringe },
    { num: 4, label: 'Photo & Confirm', icon: FileText },
  ];

  return (
    <div className="space-y-8 max-w-7xl animate-fadeIn text-slate-900">
      {/* Hidden File Inputs */}
      <input type="file" ref={fileInputRef} accept="image/*" onChange={handleFileUpload} className="hidden" />
      <input type="file" ref={cameraInputRef} accept="image/*" capture="environment" onChange={handleFileUpload} className="hidden" />

      {/* Main Studio Banner Header (Light Aesthetic) */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-white via-slate-50 to-white p-6 md:p-8 border border-slate-200/80 shadow-md">
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-brand-coral/10 border border-brand-coral/20 text-brand-coral text-xs font-black uppercase tracking-wider">
              <Sparkles className="w-4 h-4 fill-current" />
              <span>Puppy ID Studio Registry (Light Theme)</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">
              Multi-Puppy Management & QR Code Tag Studio
            </h1>
            <p className="text-sm text-slate-600 font-medium max-w-2xl leading-relaxed">
              Add puppies step-by-step, generate separate printable QR collar tags, manage vaccinations, expenses, reminders & Lost Mode.
            </p>
          </div>

          <Button
            onClick={() => {
              setStep(1);
              setIsAddModalOpen(true);
            }}
            variant="primary"
            size="lg"
            className="font-black bg-gradient-to-r from-brand-coral via-rose-500 to-amber-500 hover:from-rose-600 hover:to-amber-600 text-white shadow-xl shadow-brand-coral/20 px-8 py-3.5 rounded-2xl text-sm transform hover:scale-[1.02] transition-transform"
            icon={<Plus className="w-5 h-5" />}
          >
            ➕ Add New Puppy (Step-by-Step)
          </Button>
        </div>
      </div>

      {/* 4 Stat Overview Metrics Row (Light Aesthetic) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-sm space-y-2 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-black uppercase tracking-wider">Registered Puppies</span>
            <div className="w-9 h-9 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
              <Dog className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-black text-slate-900">{totalPuppies}</div>
          <p className="text-[11px] text-slate-500 font-medium">Digital QR ID tags created</p>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-sm space-y-2 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-black uppercase tracking-wider">Lost Emergencies</span>
            <div className="w-9 h-9 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-black text-rose-600">{lostPuppiesCount}</div>
          <p className="text-[11px] text-slate-500 font-medium">Active emergency alerts</p>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-sm space-y-2 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-black uppercase tracking-wider">Verified Vaccines</span>
            <div className="w-9 h-9 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <Syringe className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-black text-emerald-700">{totalVaccinations}</div>
          <p className="text-[11px] text-slate-500 font-medium">Rabies & booster records</p>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-sm space-y-2 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-black uppercase tracking-wider">QR Code Scans</span>
            <div className="w-9 h-9 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <QrCode className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-black text-slate-900">{totalScans}</div>
          <p className="text-[11px] text-slate-500 font-medium">Collar tag scans logged</p>
        </div>
      </div>

      {/* NEW FUNCTIONALITY: Search & Filter Toolbar */}
      <div className="bg-white rounded-3xl p-4 border border-slate-200/80 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search puppy by Name, Breed, Microchip..."
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:ring-2 focus:ring-brand-coral bg-slate-50/50"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto max-w-full w-full md:w-auto pb-1 md:pb-0">
          {[
            { id: 'ALL', label: 'All Puppies' },
            { id: 'SAFE', label: '❤️ Safe at Home' },
            { id: 'LOST', label: '🚨 Lost Only' },
            { id: 'MALE', label: '♂ Male' },
            { id: 'FEMALE', label: '♀ Female' },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setFilterCategory(cat.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all shrink-0 ${
                filterCategory === cat.id
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Puppy Registry Cards Grid (Light Aesthetic) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPets.map((pet) => {
          const publicUrl = getPetPublicUrl(pet.publicId);
          const svgId = `admin-qr-${pet.id}`;
          const isPetMale = pet.gender === 'Male';
          const vacList = pet.vaccinations || [];
          const expList = pet.expenses || [];
          const remList = pet.reminders || [];
          const totalSpent = expList.reduce((acc: number, curr: any) => acc + Number(curr.amount || 0), 0);

          return (
            <div
              key={pet.id}
              className={`bg-white rounded-3xl p-6 border flex flex-col justify-between space-y-4 hover:shadow-xl transition-all ${
                pet.isLost ? 'border-rose-400 bg-rose-50/30 ring-2 ring-rose-300' : 'border-slate-200/90 shadow-sm'
              }`}
            >
              <div>
                {/* Dog Card Header */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <img
                      src={pet.photo || 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=400'}
                      alt={pet.name}
                      className={`w-13 h-13 rounded-full object-cover shrink-0 border-2 shadow-md ${
                        isPetMale ? 'border-blue-400 ring-2 ring-blue-100' : 'border-rose-400 ring-2 ring-rose-100'
                      }`}
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-black text-slate-900 text-xl leading-tight">{pet.name}</h3>
                        <span className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase ${
                          isPetMale ? 'bg-blue-100 text-blue-800 border border-blue-200' : 'bg-rose-100 text-rose-800 border border-rose-200'
                        }`}>
                          {isPetMale ? '♂ Male' : '♀ Female'}
                        </span>
                      </div>
                      <p className="text-xs text-brand-coral font-extrabold mt-0.5">{pet.breed}</p>
                    </div>
                  </div>

                  <button
                    onClick={() => toggleLostStatus(pet.id, pet.isLost)}
                    className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider transition-all shadow-xs ${
                      pet.isLost
                        ? 'bg-rose-600 text-white animate-pulse shadow-rose-200'
                        : 'bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100'
                    }`}
                  >
                    {pet.isLost ? '🚨 LOST MODE' : '❤️ SAFE AT HOME'}
                  </button>
                </div>

                {/* Unique High-Contrast Printable QR Code Container */}
                <div className="my-4 p-4 bg-white rounded-2xl flex flex-col items-center justify-center text-center shadow-sm border border-slate-200">
                  <QRCodeSVG
                    id={svgId}
                    value={publicUrl}
                    size={145}
                    bgColor={'#ffffff'}
                    fgColor={'#182232'}
                    level={'H'}
                    includeMargin={true}
                  />
                  <div className="text-[11px] font-mono text-slate-700 mt-2 truncate max-w-full font-bold bg-slate-50 px-3 py-1 rounded-lg border border-slate-200">
                    /pet/{pet.publicId}
                  </div>
                </div>

                {/* Info Details Grid */}
                <div className="space-y-2 text-xs text-slate-700 bg-slate-50/80 p-4 rounded-2xl border border-slate-100">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 font-medium">Species & Color:</span>
                    <span className="font-extrabold text-slate-900">{pet.species} • {pet.color || 'Golden'}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 font-medium">Weight:</span>
                    <span className="font-extrabold text-slate-900">{pet.weight || '28 kg'}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 font-medium">Microchip ID:</span>
                    <span className="font-mono font-bold text-slate-900">{pet.microchipId || '988 000 123 456 789'}</span>
                  </div>
                  <div className="flex justify-between items-center pt-1.5 border-t border-slate-200/80">
                    <span className="text-slate-500 font-medium">Vaccines & Care:</span>
                    <span className="font-extrabold text-emerald-700 flex items-center gap-1">
                      <Syringe className="w-3.5 h-3.5" />
                      <span>{vacList.length} Record(s)</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Enhanced Action Buttons Grid */}
              <div className="space-y-2 pt-2">
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => {
                      setEditingPet(pet);
                      setEditFormData({
                        name: pet.name,
                        breed: pet.breed,
                        color: pet.color,
                        weight: pet.weight,
                        microchipId: pet.microchipId,
                        importantNotes: pet.importantNotes,
                        photo: pet.photo,
                      });
                    }}
                    className="py-2.5 px-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-extrabold text-xs rounded-xl border border-slate-200 flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Edit3 className="w-3.5 h-3.5 text-amber-600" />
                    <span>Edit Details</span>
                  </button>

                  <button
                    onClick={() => setVaccinationPet(pet)}
                    className="py-2.5 px-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 font-extrabold text-xs rounded-xl border border-emerald-200 flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Syringe className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Vaccines ({vacList.length})</span>
                  </button>
                </div>

                {/* NEW FUNCTIONALITY: Quick Expenses, Reminders & Passport Buttons */}
                <div className="grid grid-cols-3 gap-1.5">
                  <button
                    onClick={() => setExpensePet(pet)}
                    className="py-2 px-1 bg-blue-50 hover:bg-blue-100 text-blue-900 font-extrabold text-[11px] rounded-xl border border-blue-200 flex items-center justify-center gap-1 transition-colors"
                  >
                    <DollarSign className="w-3.5 h-3.5 text-blue-600" />
                    <span>Expenses</span>
                  </button>

                  <button
                    onClick={() => setReminderPet(pet)}
                    className="py-2 px-1 bg-amber-50 hover:bg-amber-100 text-amber-900 font-extrabold text-[11px] rounded-xl border border-amber-200 flex items-center justify-center gap-1 transition-colors"
                  >
                    <Bell className="w-3.5 h-3.5 text-amber-600" />
                    <span>Reminders</span>
                  </button>

                  <button
                    onClick={() => setPassportPet(pet)}
                    className="py-2 px-1 bg-purple-50 hover:bg-purple-100 text-purple-900 font-extrabold text-[11px] rounded-xl border border-purple-200 flex items-center justify-center gap-1 transition-colors"
                  >
                    <Printer className="w-3.5 h-3.5 text-purple-600" />
                    <span>Passport</span>
                  </button>
                </div>

                <Button
                  onClick={() => downloadQR(pet.name, svgId)}
                  variant="primary"
                  className="w-full text-xs font-black py-2.5 bg-gradient-to-r from-brand-coral to-rose-600 hover:from-rose-600 hover:to-brand-coral text-white shadow-md rounded-xl"
                  icon={<Download className="w-4 h-4" />}
                >
                  Download Separate QR PNG
                </Button>

                <Link href={`/pet/${pet.publicId}`} target="_blank" className="block">
                  <button className="w-full py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold text-[11px] rounded-xl border border-slate-200 flex items-center justify-center gap-1.5 transition-colors">
                    <span>Preview Public Profile (/pet/{pet.publicId})</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                </Link>
              </div>
            </div>
          );
        })}
      </div>

      {/* ==================== STEP-BY-STEP ADD PUPPY MODAL ==================== */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white text-slate-900 border border-slate-200 rounded-3xl p-6 md:p-8 max-w-lg w-full space-y-5 shadow-2xl animate-fadeIn">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                  <Dog className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-black text-slate-900">Add New Puppy Studio</h2>
                  <p className="text-[11px] text-slate-500 font-medium">Step {step} of 4</p>
                </div>
              </div>
              <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-slate-700 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Step Tabs */}
            <div className={`grid grid-cols-4 gap-1 p-1 rounded-2xl border transition-colors ${themeBgClass}`}>
              {steps.map((s) => {
                const Icon = s.icon;
                const isActive = step === s.num;
                return (
                  <button
                    key={s.num}
                    type="button"
                    onClick={() => setStep(s.num)}
                    className={`py-2 px-1 rounded-xl text-[10px] font-black flex items-center justify-center gap-1 transition-all ${
                      isActive
                        ? isMale ? 'bg-blue-600 text-white shadow-sm' : 'bg-rose-500 text-white shadow-sm'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">{s.label}</span>
                  </button>
                );
              })}
            </div>

            <form onSubmit={handleAddPuppySubmit} className="space-y-4">
              {/* Step 1: Basic Info */}
              {step === 1 && (
                <div className="space-y-3 animate-fadeIn">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Puppy Name *</label>
                    <input
                      type="text"
                      required
                      value={newPetData.name}
                      onChange={(e) => setNewPetData({ ...newPetData, name: e.target.value })}
                      placeholder="e.g. Bruno / Coco / Bella"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-brand-coral bg-white"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Species</label>
                      <select
                        value={newPetData.species}
                        onChange={(e) => setNewPetData({ ...newPetData, species: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-brand-coral bg-white"
                      >
                        <option value="Dog">Dog</option>
                        <option value="Cat">Cat</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Gender (Theme Accent) *</label>
                      <select
                        value={newPetData.gender}
                        onChange={(e) => setNewPetData({ ...newPetData, gender: e.target.value as any })}
                        className={`w-full px-3.5 py-2.5 rounded-xl border font-black text-xs focus:outline-none focus:ring-2 ${
                          isMale
                            ? 'bg-blue-50 text-blue-900 border-blue-300 focus:ring-blue-400'
                            : 'bg-rose-50 text-rose-900 border-rose-300 focus:ring-rose-400'
                        }`}
                      >
                        <option value="Male">Male (Light Blue Theme ♂)</option>
                        <option value="Female">Female (Light Pink Theme ♀)</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Dog Breed *</label>
                    <select
                      value={newPetData.breed}
                      onChange={(e) => setNewPetData({ ...newPetData, breed: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-brand-coral bg-white"
                    >
                      {INDIAN_DOG_BREEDS.map((b) => (
                        <option key={b} value={b}>{b}</option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Color</label>
                      <input
                        type="text"
                        value={newPetData.color}
                        onChange={(e) => setNewPetData({ ...newPetData, color: e.target.value })}
                        placeholder="e.g. Golden / Black"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-brand-coral bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Weight</label>
                      <input
                        type="text"
                        value={newPetData.weight}
                        onChange={(e) => setNewPetData({ ...newPetData, weight: e.target.value })}
                        placeholder="e.g. 28 kg"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-brand-coral bg-white"
                      />
                    </div>
                  </div>

                  <div className="pt-2">
                    <Button
                      type="button"
                      variant="primary"
                      onClick={() => {
                        if (!newPetData.name) {
                          alert('Please enter Puppy Name');
                          return;
                        }
                        setStep(2);
                      }}
                      className="w-full text-xs font-black py-2.5 bg-brand-coral hover:bg-rose-600 text-white shadow-md"
                    >
                      Next: ID Tags &rarr;
                    </Button>
                  </div>
                </div>
              )}

              {/* Step 2: ID Tags */}
              {step === 2 && (
                <div className="space-y-3 animate-fadeIn">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Microchip ID</label>
                    <input
                      type="text"
                      value={newPetData.microchipId}
                      onChange={(e) => setNewPetData({ ...newPetData, microchipId: e.target.value })}
                      placeholder="e.g. 988 000 123 456 789"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-brand-coral bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Pet Registration Number</label>
                    <input
                      type="text"
                      value={newPetData.registrationNo}
                      onChange={(e) => setNewPetData({ ...newPetData, registrationNo: e.target.value })}
                      placeholder="e.g. PET-HYD-2026-001"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-brand-coral bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Municipal License Number</label>
                    <input
                      type="text"
                      value={newPetData.licenseNo}
                      onChange={(e) => setNewPetData({ ...newPetData, licenseNo: e.target.value })}
                      placeholder="e.g. LIC-99210-A"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-brand-coral bg-white"
                    />
                  </div>

                  <div className="flex justify-between gap-2 pt-2">
                    <Button type="button" variant="secondary" onClick={() => setStep(1)} className="text-xs py-2">
                      &larr; Back
                    </Button>
                    <Button type="button" variant="primary" onClick={() => setStep(3)} className="text-xs font-black py-2 bg-brand-coral hover:bg-rose-600 text-white">
                      Next: Vaccinations &rarr;
                    </Button>
                  </div>
                </div>
              )}

              {/* Step 3: Initial Vaccinations */}
              {step === 3 && (
                <div className="space-y-3 animate-fadeIn">
                  <div className="flex items-center gap-2 text-emerald-700 font-extrabold text-xs mb-1">
                    <Syringe className="w-4 h-4 text-emerald-600" />
                    <span>Add Initial Vaccine Record</span>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Vaccine Name</label>
                    <select
                      value={newPetData.vaccineName}
                      onChange={(e) => setNewPetData({ ...newPetData, vaccineName: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                    >
                      <option value="Rabies Anti-Rabies Vaccine">Rabies Anti-Rabies Vaccine</option>
                      <option value="DHPP Core Vaccine">DHPP (Distemper, Hepatitis, Parvo)</option>
                      <option value="Annual Booster Shot">Annual Immunity Booster</option>
                      <option value="Bordetella Kennel Cough">Bordetella Kennel Cough</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Date Given</label>
                      <input
                        type="date"
                        value={newPetData.dateAdministered}
                        onChange={(e) => setNewPetData({ ...newPetData, dateAdministered: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Next Due Date</label>
                      <input
                        type="date"
                        value={newPetData.nextDueDate}
                        onChange={(e) => setNewPetData({ ...newPetData, nextDueDate: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                      />
                    </div>
                  </div>

                  <div className="flex justify-between gap-2 pt-2">
                    <Button type="button" variant="secondary" onClick={() => setStep(2)} className="text-xs py-2">
                      &larr; Back
                    </Button>
                    <Button type="button" variant="primary" onClick={() => setStep(4)} className="text-xs font-black py-2 bg-brand-coral hover:bg-rose-600 text-white">
                      Next: Photo & Confirm &rarr;
                    </Button>
                  </div>
                </div>
              )}

              {/* Step 4: Photo & Public Notes */}
              {step === 4 && (
                <div className="space-y-3.5 animate-fadeIn">
                  <label className="block text-[11px] font-bold text-slate-700 uppercase">Pet Photo (Upload or Take Photo)</label>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => cameraInputRef.current?.click()}
                      className="py-2.5 px-3 bg-blue-50 hover:bg-blue-100 text-blue-900 border border-blue-200 font-extrabold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <Camera className="w-4 h-4 text-blue-600" />
                      <span>📷 Take Photo</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="py-2.5 px-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-200 font-extrabold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <Upload className="w-4 h-4 text-emerald-600" />
                      <span>📁 Gallery Upload</span>
                    </button>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Important Public Notes</label>
                    <textarea
                      rows={2}
                      value={newPetData.importantNotes}
                      onChange={(e) => setNewPetData({ ...newPetData, importantNotes: e.target.value })}
                      placeholder="e.g. Friendly boy, loves kids. Please call my family immediately."
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-brand-coral bg-white"
                    />
                  </div>

                  <div className="flex justify-between gap-2 pt-2">
                    <Button type="button" variant="secondary" onClick={() => setStep(3)} className="text-xs py-2">
                      &larr; Back
                    </Button>
                    <Button type="submit" variant="primary" disabled={isSubmitting} className="text-xs font-black py-2.5 bg-gradient-to-r from-brand-coral to-rose-600 hover:from-rose-600 hover:to-brand-coral text-white shadow-xl">
                      {isSubmitting ? 'Generating QR Code...' : 'Add Puppy & Generate QR'}
                    </Button>
                  </div>
                </div>
              )}
            </form>
          </div>
        </div>
      )}

      {/* ==================== EDIT PET DETAILS MODAL ==================== */}
      {editingPet && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white text-slate-900 border border-slate-200 rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl animate-fadeIn">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h2 className="text-lg font-black text-slate-900">Edit {editingPet.name}&apos;s Details</h2>
              <button onClick={() => setEditingPet(null)} className="text-slate-400 hover:text-slate-700 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Pet Name</label>
                <input
                  type="text"
                  value={editFormData.name || ''}
                  onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-bold bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Breed</label>
                  <input
                    type="text"
                    value={editFormData.breed || ''}
                    onChange={(e) => setEditFormData({ ...editFormData, breed: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-bold bg-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Weight</label>
                  <input
                    type="text"
                    value={editFormData.weight || ''}
                    onChange={(e) => setEditFormData({ ...editFormData, weight: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-bold bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Microchip ID</label>
                <input
                  type="text"
                  value={editFormData.microchipId || ''}
                  onChange={(e) => setEditFormData({ ...editFormData, microchipId: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-mono font-bold bg-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Important Notes</label>
                <textarea
                  rows={2}
                  value={editFormData.importantNotes || ''}
                  onChange={(e) => setEditFormData({ ...editFormData, importantNotes: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-semibold bg-white"
                />
              </div>

              <div className="flex justify-between gap-2 pt-2">
                <Button type="button" variant="secondary" onClick={() => setEditingPet(null)} className="text-xs py-2">
                  Cancel
                </Button>
                <Button type="submit" variant="primary" className="text-xs font-black py-2 bg-slate-900 hover:bg-slate-800 text-white">
                  Save Details
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================== MANAGE VACCINATIONS MODAL ==================== */}
      {vaccinationPet && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white text-slate-900 border border-slate-200 rounded-3xl p-6 max-w-xl w-full space-y-4 shadow-2xl animate-fadeIn">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Syringe className="w-5 h-5 text-emerald-600" />
                <h2 className="text-lg font-black text-slate-900">Manage Vaccinations for {vaccinationPet.name}</h2>
              </div>
              <button onClick={() => setVaccinationPet(null)} className="text-slate-400 hover:text-slate-700 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Existing Vaccinations List */}
            <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
              <span className="text-[11px] font-bold text-slate-500 uppercase block">Current Records ({vaccinationPet.vaccinations?.length || 0})</span>
              {(vaccinationPet.vaccinations || []).map((vac: any) => (
                <div key={vac.id} className="p-3 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-extrabold text-slate-900 block">{vac.vaccineName}</span>
                    <span className="text-[10px] text-slate-500 font-medium">Given: {vac.dateAdministered} • Vet: {vac.vetName || 'Dr. Verma'}</span>
                  </div>
                  <select
                    value={vac.status}
                    onChange={(e) => handleUpdateVaccinationStatus(vaccinationPet.id, vac.id, e.target.value)}
                    className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase bg-white border ${
                      vac.status === 'COMPLETED' ? 'text-emerald-800 border-emerald-300 bg-emerald-50' : 'text-amber-800 border-amber-300 bg-amber-50'
                    }`}
                  >
                    <option value="COMPLETED">COMPLETED</option>
                    <option value="UPCOMING">UPCOMING</option>
                    <option value="OVERDUE">OVERDUE</option>
                  </select>
                </div>
              ))}
            </div>

            {/* Add New Vaccine Form */}
            <form onSubmit={handleAddVaccinationSubmit} className="pt-3 border-t border-slate-100 space-y-2.5">
              <span className="text-[11px] font-bold text-emerald-700 uppercase block">➕ Add New Vaccine Record</span>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] font-bold text-slate-600 uppercase mb-0.5">Vaccine Name</label>
                  <input
                    type="text"
                    required
                    value={newVac.vaccineName}
                    onChange={(e) => setNewVac({ ...newVac, vaccineName: e.target.value })}
                    placeholder="Rabies Vaccine"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-600 uppercase mb-0.5">Date Given</label>
                  <input
                    type="date"
                    required
                    value={newVac.dateAdministered}
                    onChange={(e) => setNewVac({ ...newVac, dateAdministered: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold"
                  />
                </div>
              </div>

              <div className="flex justify-between gap-2 pt-2">
                <Button type="button" variant="secondary" onClick={() => setVaccinationPet(null)} className="text-xs py-2">
                  Done
                </Button>
                <Button type="submit" variant="primary" className="text-xs font-black py-2 bg-emerald-600 hover:bg-emerald-700 text-white shadow-md">
                  Add Vaccine
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================== NEW FUNCTIONALITY: ADD EXPENSE MODAL ==================== */}
      {expensePet && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white text-slate-900 border border-slate-200 rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl animate-fadeIn">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-blue-600" />
                <h2 className="text-lg font-black text-slate-900">Add Expense for {expensePet.name}</h2>
              </div>
              <button onClick={() => setExpensePet(null)} className="text-slate-400 hover:text-slate-700 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddExpenseSubmit} className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Category</label>
                  <select
                    value={newExp.category}
                    onChange={(e) => setNewExp({ ...newExp, category: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-bold"
                  >
                    <option value="Food">Food & Kibble</option>
                    <option value="Vet">Vet Visit</option>
                    <option value="Grooming">Grooming & Spa</option>
                    <option value="Accessories">Accessories & Tags</option>
                    <option value="Medicine">Medicine & Vitamins</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Amount (₹) *</label>
                  <input
                    type="number"
                    required
                    value={newExp.amount}
                    onChange={(e) => setNewExp({ ...newExp, amount: e.target.value })}
                    placeholder="e.g. 1500"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Description</label>
                <input
                  type="text"
                  value={newExp.description}
                  onChange={(e) => setNewExp({ ...newExp, description: e.target.value })}
                  placeholder="e.g. 15kg Royal Canin Adult Food"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold"
                />
              </div>

              <div className="flex justify-between gap-2 pt-2">
                <Button type="button" variant="secondary" onClick={() => setExpensePet(null)} className="text-xs py-2">
                  Cancel
                </Button>
                <Button type="submit" variant="primary" className="text-xs font-black py-2 bg-blue-600 hover:bg-blue-700 text-white shadow-md">
                  Save Expense
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================== NEW FUNCTIONALITY: ADD REMINDER MODAL ==================== */}
      {reminderPet && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white text-slate-900 border border-slate-200 rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl animate-fadeIn">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Bell className="w-5 h-5 text-amber-600" />
                <h2 className="text-lg font-black text-slate-900">Schedule Reminder for {reminderPet.name}</h2>
              </div>
              <button onClick={() => setReminderPet(null)} className="text-slate-400 hover:text-slate-700 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddReminderSubmit} className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Title *</label>
                <input
                  type="text"
                  required
                  value={newRem.title}
                  onChange={(e) => setNewRem({ ...newRem, title: e.target.value })}
                  placeholder="e.g. Deworming Tablet"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Date *</label>
                  <input
                    type="date"
                    required
                    value={newRem.date}
                    onChange={(e) => setNewRem({ ...newRem, date: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Repeat</label>
                  <select
                    value={newRem.repeat}
                    onChange={(e) => setNewRem({ ...newRem, repeat: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-bold"
                  >
                    <option value="ONCE">ONCE</option>
                    <option value="MONTHLY">MONTHLY</option>
                    <option value="EVERY_3_MONTHS">EVERY 3 MONTHS</option>
                    <option value="YEARLY">YEARLY</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-between gap-2 pt-2">
                <Button type="button" variant="secondary" onClick={() => setReminderPet(null)} className="text-xs py-2">
                  Cancel
                </Button>
                <Button type="submit" variant="primary" className="text-xs font-black py-2 bg-amber-600 hover:bg-amber-700 text-white shadow-md">
                  Save Reminder
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================== NEW FUNCTIONALITY: MEDICAL PASSPORT PRINT PREVIEW ==================== */}
      {passportPet && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white text-slate-900 border border-slate-200 rounded-3xl p-6 md:p-8 max-w-xl w-full space-y-5 shadow-2xl animate-fadeIn max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <Printer className="w-5 h-5 text-purple-600" />
                <h2 className="text-lg font-black text-slate-900">Official Pet Identity & Medical Passport</h2>
              </div>
              <button onClick={() => setPassportPet(null)} className="text-slate-400 hover:text-slate-700 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Passport Card Content */}
            <div className="p-6 bg-slate-50 border-2 border-slate-900 rounded-3xl space-y-4 font-sans text-slate-900">
              <div className="flex items-center justify-between pb-3 border-b-2 border-slate-900">
                <div>
                  <h3 className="text-xl font-black tracking-tight">{passportPet.name}</h3>
                  <p className="text-xs font-bold text-brand-coral uppercase">{passportPet.breed} • {passportPet.gender}</p>
                </div>
                <span className="text-xs font-mono font-black bg-slate-900 text-white px-3 py-1 rounded-full">
                  ID: {passportPet.publicId}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs font-medium">
                <div>
                  <span className="text-slate-500 block">Microchip ID:</span>
                  <span className="font-mono font-bold text-slate-900">{passportPet.microchipId || '988 000 123 456 789'}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Registration No:</span>
                  <span className="font-bold text-slate-900">{passportPet.registrationNo || 'PET-HYD-2026-001'}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Color & Weight:</span>
                  <span className="font-bold text-slate-900">{passportPet.color || 'Golden'} • {passportPet.weight || '28 kg'}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Emergency Phone:</span>
                  <span className="font-bold text-slate-900">{passportPet.user?.phone || '+91 96526 36993'}</span>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-200">
                <span className="text-[11px] font-black uppercase text-slate-700 block mb-1">Vaccination Certificate Status</span>
                <div className="space-y-1">
                  {(passportPet.vaccinations || []).map((v: any) => (
                    <div key={v.id} className="flex justify-between text-xs py-1 border-b border-slate-200/60">
                      <span className="font-bold text-slate-900">{v.vaccineName}</span>
                      <span className="font-bold text-emerald-700">✅ {v.status} ({v.dateAdministered})</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="secondary" onClick={() => setPassportPet(null)} className="text-xs py-2">
                Close
              </Button>
              <Button type="button" onClick={() => window.print()} variant="primary" className="text-xs font-black py-2 bg-purple-600 hover:bg-purple-700 text-white shadow-md">
                🖨️ Print Passport Document
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
