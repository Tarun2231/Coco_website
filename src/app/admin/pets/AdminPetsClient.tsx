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
  Share2,
  Paperclip,
  Trash2,
  SlidersHorizontal,
} from 'lucide-react';
import Link from 'next/link';
import { getPetPublicUrl } from '@/lib/qr';
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
  const [managePet, setManagePet] = useState<any | null>(null);
  const [manageTab, setManageTab] = useState<string>('EDIT');
  const [editingPet, setEditingPet] = useState<any | null>(null);
  const [vaccinationPet, setVaccinationPet] = useState<any | null>(null);
  const [expensePet, setExpensePet] = useState<any | null>(null);
  const [reminderPet, setReminderPet] = useState<any | null>(null);
  const [passportPet, setPassportPet] = useState<any | null>(null);
  const [broadcastPet, setBroadcastPet] = useState<any | null>(null);
  const [docPet, setDocPet] = useState<any | null>(null);
  const [deletingPet, setDeletingPet] = useState<any | null>(null);

  // QR Color Customizer state
  const [qrFgColor, setQrFgColor] = useState('#182232');

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

  // Document Upload Form state
  const [newDoc, setNewDoc] = useState({
    title: 'Vaccination Certificate PDF',
    type: 'Vaccination Record',
    url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
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

  // Delete / Remove Pet Handler
  const handleDeletePet = async () => {
    if (!deletingPet) return;
    try {
      await fetch(`/api/pets/${deletingPet.id}`, { method: 'DELETE' });
      setPets((prev) => prev.filter((p) => p.id !== deletingPet.id));
      setDeletingPet(null);
      setManagePet(null);
    } catch (err) {
      console.error('Failed to delete pet:', err);
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
    if (!editingPet && !managePet) return;

    const targetPet = editingPet || managePet;
    try {
      const res = await fetch(`/api/pets/${targetPet.id}/lost`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editFormData),
      });

      if (res.ok) {
        setPets((prev) =>
          prev.map((p) => (p.id === targetPet.id ? { ...p, ...editFormData } : p))
        );
        setEditingPet(null);
        setManagePet(null);
      }
    } catch (err) {
      console.error('Failed to edit pet:', err);
    }
  };

  // Submit Add Vaccination
  const handleAddVaccinationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const targetPet = vaccinationPet || managePet;
    if (!targetPet) return;

    try {
      const payload = { petId: targetPet.id, ...newVac };
      const res = await fetch('/api/vaccinations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => ({}));
      if (data.vaccination) {
        setPets((prev) =>
          prev.map((p) => {
            if (p.id === targetPet.id) {
              const currentVacs = p.vaccinations || [];
              return { ...p, vaccinations: [data.vaccination, ...currentVacs] };
            }
            return p;
          })
        );
        if (vaccinationPet) {
          setVaccinationPet((prev: any) =>
            prev ? { ...prev, vaccinations: [data.vaccination, ...(prev.vaccinations || [])] } : null
          );
        }
        if (managePet) {
          setManagePet((prev: any) =>
            prev ? { ...prev, vaccinations: [data.vaccination, ...(prev.vaccinations || [])] } : null
          );
        }
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
    const targetPet = expensePet || managePet;
    if (!targetPet || !newExp.amount) return;

    try {
      const payload = { petId: targetPet.id, ...newExp, amount: Number(newExp.amount) };
      const res = await fetch('/api/expenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => ({}));
      if (data.expense) {
        setPets((prev) =>
          prev.map((p) => {
            if (p.id === targetPet.id) {
              const currentExps = p.expenses || [];
              return { ...p, expenses: [data.expense, ...currentExps] };
            }
            return p;
          })
        );
        setExpensePet(null);
        if (managePet) {
          setManagePet((prev: any) =>
            prev ? { ...prev, expenses: [data.expense, ...(prev.expenses || [])] } : null
          );
        }
        setNewExp({ category: 'Food', description: 'Pet Kibble & Treats', amount: '', vendor: 'Pet Supermarket' });
      }
    } catch (err) {
      console.error('Failed to add expense:', err);
    }
  };

  // Submit Add Reminder
  const handleAddReminderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const targetPet = reminderPet || managePet;
    if (!targetPet || !newRem.title) return;

    try {
      const payload = { petId: targetPet.id, ...newRem };
      const res = await fetch('/api/reminders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => ({}));
      if (data.reminder) {
        setPets((prev) =>
          prev.map((p) => {
            if (p.id === targetPet.id) {
              const currentRems = p.reminders || [];
              return { ...p, reminders: [data.reminder, ...currentRems] };
            }
            return p;
          })
        );
        setReminderPet(null);
        if (managePet) {
          setManagePet((prev: any) =>
            prev ? { ...prev, reminders: [data.reminder, ...(prev.reminders || [])] } : null
          );
        }
        setNewRem({ category: 'Deworming', title: 'Deworming Tablet', date: new Date().toISOString().split('T')[0], time: '09:00 AM', repeat: 'EVERY_3_MONTHS', notes: 'Give tablet with breakfast' });
      }
    } catch (err) {
      console.error('Failed to add reminder:', err);
    }
  };

  // Submit Document Vault Upload
  const handleAddDocSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const targetPet = docPet || managePet;
    if (!targetPet || !newDoc.title) return;

    const docItem = { id: `doc-${Date.now()}`, ...newDoc, createdAt: new Date().toISOString() };
    setPets((prev) =>
      prev.map((p) => {
        if (p.id === targetPet.id) {
          const currentDocs = (p as any).documents || [];
          return { ...p, documents: [docItem, ...currentDocs] };
        }
        return p;
      })
    );
    setDocPet(null);
    if (managePet) {
      setManagePet((prev: any) =>
        prev ? { ...prev, documents: [docItem, ...(prev.documents || [])] } : null
      );
    }
    setNewDoc({ title: 'Vaccination Certificate PDF', type: 'Vaccination Record', url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf' });
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
        if (managePet && managePet.id === petId) {
          setManagePet((prev: any) => ({
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
    ? 'bg-blue-50/90 border-blue-200 text-blue-800'
    : 'bg-pink-50/90 border-pink-200 text-pink-800';

  const steps = [
    { num: 1, label: 'Details', icon: Dog },
    { num: 2, label: 'ID Tags', icon: Tag },
    { num: 3, label: 'Vaccines', icon: Syringe },
    { num: 4, label: 'Photo & Confirm', icon: FileText },
  ];

  return (
    <div className="space-y-6 sm:space-y-8 max-w-7xl animate-fadeIn text-slate-700 px-1 sm:px-0">
      {/* Hidden File Inputs */}
      <input type="file" ref={fileInputRef} accept="image/*" onChange={handleFileUpload} className="hidden" />
      <input type="file" ref={cameraInputRef} accept="image/*" capture="environment" onChange={handleFileUpload} className="hidden" />

      {/* Main Studio Banner Header (Light Aesthetic & Mobile Responsive) */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-white via-cream-50 to-white p-5 sm:p-7 md:p-8 border border-slate-200/80 shadow-xs">
        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-coral/10 border border-brand-coral/20 text-brand-coral text-[11px] font-extrabold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 fill-current" />
              <span>Puppy ID Studio Registry (Live Production)</span>
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-800 tracking-tight leading-tight">
              Multi-Puppy Management & QR Code Tag Studio
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 font-medium max-w-2xl leading-relaxed">
              Add puppies step-by-step, generate separate printable QR collar tags, manage vaccinations, expenses, reminders, Lost Mode & remove pets.
            </p>
          </div>

          <button
            onClick={() => {
              setStep(1);
              setIsAddModalOpen(true);
            }}
            className="w-full sm:w-auto font-extrabold bg-brand-coral/10 hover:bg-brand-coral/20 text-brand-coral border border-brand-coral/30 px-6 py-3 rounded-2xl text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-xs shrink-0"
          >
            <Plus className="w-4 h-4 text-brand-coral" />
            <span>➕ Add New Puppy (Step-by-Step)</span>
          </button>
        </div>
      </div>

      {/* 4 Stat Overview Metrics Row (Light Aesthetic & Mobile Responsive) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
        <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200/80 shadow-xs space-y-1.5 hover:shadow-sm transition-shadow">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[10px] sm:text-[11px] font-extrabold uppercase tracking-wider">Registered Puppies</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
              <Dog className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-800">{totalPuppies}</div>
          <p className="text-[10px] text-slate-500 font-medium truncate">Digital QR ID tags created</p>
        </div>

        <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200/80 shadow-xs space-y-1.5 hover:shadow-sm transition-shadow">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[10px] sm:text-[11px] font-extrabold uppercase tracking-wider">Lost Emergencies</span>
            <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-rose-600">{lostPuppiesCount}</div>
          <p className="text-[10px] text-slate-500 font-medium truncate">Active emergency alerts</p>
        </div>

        <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200/80 shadow-xs space-y-1.5 hover:shadow-sm transition-shadow">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[10px] sm:text-[11px] font-extrabold uppercase tracking-wider">Verified Vaccines</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <Syringe className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-emerald-700">{totalVaccinations}</div>
          <p className="text-[10px] text-slate-500 font-medium truncate">Rabies & booster records</p>
        </div>

        <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200/80 shadow-xs space-y-1.5 hover:shadow-sm transition-shadow">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[10px] sm:text-[11px] font-extrabold uppercase tracking-wider">QR Code Scans</span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <QrCode className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-800">{totalScans}</div>
          <p className="text-[10px] text-slate-500 font-medium truncate">Collar tag scans logged</p>
        </div>
      </div>

      {/* Search & Filter Toolbar (Light Theme & Mobile Responsive) */}
      <div className="bg-white rounded-3xl p-4 border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3 sm:gap-4">
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

        <div className="flex items-center gap-1.5 overflow-x-auto max-w-full w-full md:w-auto pb-1 md:pb-0 whitespace-nowrap">
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
              className={`px-3 py-1.5 rounded-xl text-[11px] sm:text-xs font-extrabold transition-all shrink-0 ${
                filterCategory === cat.id
                  ? 'bg-brand-coral/10 text-brand-coral border border-brand-coral/30 shadow-xs'
                  : 'bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Empty State when no pets registered */}
      {filteredPets.length === 0 && (
        <div className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-200/80 shadow-xs text-center max-w-xl mx-auto space-y-4 my-6 animate-fadeIn">
          <div className="w-16 h-16 rounded-2xl bg-brand-coral/10 text-brand-coral flex items-center justify-center mx-auto shadow-xs">
            <Dog className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h3 className="text-xl font-extrabold text-slate-800">Welcome to Live Production!</h3>
            <p className="text-xs text-slate-500 font-medium leading-relaxed max-w-md mx-auto">
              Sample data has been removed. Click below to add your first puppy, enter their health & owner details, and generate a live printable QR collar tag.
            </p>
          </div>
          <button
            onClick={() => {
              setStep(1);
              setIsAddModalOpen(true);
            }}
            className="px-6 py-3 font-extrabold bg-brand-coral/10 hover:bg-brand-coral/20 text-brand-coral border border-brand-coral/30 rounded-2xl text-xs inline-flex items-center justify-center gap-2 transition-all shadow-xs"
          >
            <Plus className="w-4 h-4 text-brand-coral" />
            <span>➕ Add Your First Puppy</span>
          </button>
        </div>
      )}

      {/* Puppy Registry Cards Grid (CLEAN, UNCLUTTERED DESIGNS) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPets.map((pet) => {
          const publicUrl = getPetPublicUrl(pet.publicId);
          const svgId = `admin-qr-${pet.id}`;
          const isPetMale = pet.gender === 'Male';
          const vacList = pet.vaccinations || [];

          return (
            <div
              key={pet.id}
              className={`bg-white rounded-3xl p-5 sm:p-6 border flex flex-col justify-between space-y-4 hover:shadow-lg transition-all ${
                pet.isLost ? 'border-rose-300 bg-rose-50/20 ring-2 ring-rose-200' : 'border-slate-200/80 shadow-xs'
              }`}
            >
              <div>
                {/* Dog Card Header (NO TEXT "Male/Female" - ONLY SKY BLUE OR PINK DOT BADGE) */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <img
                      src={pet.photo || 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=400'}
                      alt={pet.name}
                      className={`w-12 h-12 sm:w-13 sm:h-13 rounded-full object-cover shrink-0 border-2 shadow-sm ${
                        isPetMale ? 'border-blue-300 ring-2 ring-blue-50' : 'border-pink-300 ring-2 ring-pink-50'
                      }`}
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-extrabold text-slate-800 text-lg sm:text-xl leading-tight">{pet.name}</h3>
                        {/* STYLISH BLUE / PINK DOT ACCENT (NO GENDER TEXT) */}
                        <span
                          title={isPetMale ? 'Male' : 'Female'}
                          className={`w-3.5 h-3.5 rounded-full shrink-0 border shadow-xs ${
                            isPetMale
                              ? 'bg-blue-400 border-blue-500 ring-2 ring-blue-100'
                              : 'bg-pink-400 border-pink-500 ring-2 ring-pink-100'
                          }`}
                        />
                      </div>
                      <p className="text-xs text-brand-coral font-extrabold mt-0.5">{pet.breed}</p>
                    </div>
                  </div>

                  {/* LOST MODE BUTTON WITH BLINKING ANIMATION WHEN ACTIVE */}
                  <button
                    onClick={() => toggleLostStatus(pet.id, pet.isLost)}
                    className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider transition-all shadow-sm shrink-0 ${
                      pet.isLost
                        ? 'bg-rose-600 text-white animate-pulse shadow-rose-300 border border-rose-500 ring-4 ring-rose-400/40 font-black'
                        : 'bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100 font-extrabold'
                    }`}
                  >
                    {pet.isLost ? '🚨 LOST MODE (BLINKING)' : '❤️ SAFE AT HOME'}
                  </button>
                </div>

                {/* Unique High-Contrast Printable QR Code Container */}
                <div className="my-4 p-4 bg-white rounded-2xl flex flex-col items-center justify-center text-center shadow-xs border border-slate-200/90">
                  <QRCodeSVG
                    id={svgId}
                    value={publicUrl}
                    size={140}
                    bgColor={'#ffffff'}
                    fgColor={qrFgColor}
                    level={'H'}
                    includeMargin={true}
                  />
                  <div className="text-[11px] font-mono text-slate-600 mt-2 truncate max-w-full font-bold bg-slate-50 px-3 py-1 rounded-lg border border-slate-200">
                    /pet/{pet.publicId}
                  </div>

                  {/* QR Color Accent Customizer Buttons */}
                  <div className="flex items-center gap-1.5 mt-2.5">
                    <span className="text-[9px] font-bold text-slate-400 uppercase">QR Accent:</span>
                    {[
                      { color: '#182232', name: 'Dark' },
                      { color: '#2563EB', name: 'Royal Blue' },
                      { color: '#DB2777', name: 'Soft Pink' },
                      { color: '#059669', name: 'Emerald' },
                      { color: '#FF6B6B', name: 'Coral' },
                    ].map((c) => (
                      <button
                        key={c.color}
                        type="button"
                        onClick={() => setQrFgColor(c.color)}
                        title={c.name}
                        style={{ backgroundColor: c.color }}
                        className={`w-4 h-4 rounded-full border border-white shadow-xs transition-transform hover:scale-125 ${
                          qrFgColor === c.color ? 'ring-2 ring-slate-800 scale-110' : ''
                        }`}
                      />
                    ))}
                  </div>
                </div>

                {/* Info Details Grid */}
                <div className="space-y-2 text-xs text-slate-600 bg-slate-50/70 p-3.5 sm:p-4 rounded-2xl border border-slate-100">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 font-medium">Species & Color:</span>
                    <span className="font-extrabold text-slate-800">{pet.species} • {pet.color || 'Golden'}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 font-medium">Weight:</span>
                    <span className="font-extrabold text-slate-800">{pet.weight || '28 kg'}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 font-medium">Microchip ID:</span>
                    <span className="font-mono font-bold text-slate-800">{pet.microchipId || '988 000 123 456 789'}</span>
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

              {/* SLEEK, MINIMALIST & UNCLUTTERED ACTION BUTTONS */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => {
                      setManagePet(pet);
                      setEditFormData({
                        name: pet.name,
                        breed: pet.breed,
                        color: pet.color,
                        weight: pet.weight,
                        microchipId: pet.microchipId,
                        importantNotes: pet.importantNotes,
                        photo: pet.photo,
                      });
                      setManageTab('EDIT');
                    }}
                    className="py-2.5 px-3 bg-brand-coral/10 hover:bg-brand-coral/20 text-brand-coral font-extrabold text-xs rounded-xl border border-brand-coral/30 flex items-center justify-center gap-1.5 transition-colors shadow-xs"
                  >
                    <SlidersHorizontal className="w-4 h-4 text-brand-coral" />
                    <span>Manage Care Hub</span>
                  </button>

                  <button
                    onClick={() => downloadQR(pet.name, svgId)}
                    className="py-2.5 px-3 bg-blue-50 hover:bg-blue-100 text-blue-900 font-extrabold text-xs rounded-xl border border-blue-200 flex items-center justify-center gap-1.5 transition-colors shadow-xs"
                  >
                    <Download className="w-4 h-4 text-blue-600" />
                    <span>Download QR</span>
                  </button>
                </div>

                <Link href={`/pet/${pet.publicId}`} target="_blank" className="block">
                  <button className="w-full py-2 bg-slate-50 hover:bg-slate-100 text-slate-600 font-semibold text-[11px] rounded-xl border border-slate-200 flex items-center justify-center gap-1.5 transition-colors">
                    <span>Preview Public Profile (/pet/{pet.publicId})</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                </Link>
              </div>
            </div>
          );
        })}
      </div>

      {/* ==================== SLEEK PET MANAGEMENT HUB MODAL ==================== */}
      {managePet && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white text-slate-800 border border-slate-200 rounded-3xl p-5 sm:p-7 max-w-2xl w-full space-y-4 shadow-2xl animate-fadeIn max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <img src={managePet.photo} alt={managePet.name} className="w-10 h-10 rounded-full object-cover border-2 border-brand-coral" />
                <div>
                  <h2 className="text-base sm:text-lg font-extrabold text-slate-800">Manage {managePet.name}&apos;s Studio</h2>
                  <p className="text-[11px] text-slate-500 font-medium">{managePet.breed} • {managePet.gender}</p>
                </div>
              </div>
              <button onClick={() => setManagePet(null)} className="text-slate-400 hover:text-slate-700 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Tab Header Navigation Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-slate-100 text-xs font-extrabold">
              {[
                { id: 'EDIT', label: '✏️ Edit Info' },
                { id: 'VACCINES', label: `💉 Vaccines (${managePet.vaccinations?.length || 0})` },
                { id: 'EXPENSES', label: `💰 Expenses` },
                { id: 'REMINDERS', label: `🔔 Reminders` },
                { id: 'PASSPORT', label: `📋 Passport` },
                { id: 'ALERT', label: `📢 Missing Alert` },
                { id: 'DOCS', label: `📁 Docs Vault` },
                { id: 'DELETE', label: `🗑️ Remove Pet` },
              ].map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setManageTab(t.id)}
                  className={`px-3 py-2 rounded-xl shrink-0 transition-all ${
                    manageTab === t.id
                      ? 'bg-brand-coral/10 text-brand-coral border border-brand-coral/30 shadow-xs font-black'
                      : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {/* Tab 1: Edit Details */}
            {manageTab === 'EDIT' && (
              <form onSubmit={handleEditSubmit} className="space-y-3 pt-2 animate-fadeIn">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Pet Name</label>
                  <input
                    type="text"
                    value={editFormData.name || ''}
                    onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-bold bg-white"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Breed</label>
                    <input
                      type="text"
                      value={editFormData.breed || ''}
                      onChange={(e) => setEditFormData({ ...editFormData, breed: e.target.value })}
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-bold bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Weight</label>
                    <input
                      type="text"
                      value={editFormData.weight || ''}
                      onChange={(e) => setEditFormData({ ...editFormData, weight: e.target.value })}
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-bold bg-white"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Microchip ID</label>
                  <input
                    type="text"
                    value={editFormData.microchipId || ''}
                    onChange={(e) => setEditFormData({ ...editFormData, microchipId: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-mono font-bold bg-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Important Notes</label>
                  <textarea
                    rows={2}
                    value={editFormData.importantNotes || ''}
                    onChange={(e) => setEditFormData({ ...editFormData, importantNotes: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-semibold bg-white"
                  />
                </div>
                <div className="pt-2 flex justify-end">
                  <button type="submit" className="px-6 py-2.5 bg-brand-coral/10 hover:bg-brand-coral/20 text-brand-coral font-black text-xs rounded-xl border border-brand-coral/30">
                    Save Changes
                  </button>
                </div>
              </form>
            )}

            {/* Tab 2: Vaccinations */}
            {manageTab === 'VACCINES' && (
              <div className="space-y-3 pt-2 animate-fadeIn">
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {(managePet.vaccinations || []).map((vac: any) => (
                    <div key={vac.id} className="p-3 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between text-xs">
                      <div>
                        <span className="font-extrabold text-slate-800 block">{vac.vaccineName}</span>
                        <span className="text-[10px] text-slate-500 font-medium">Given: {vac.dateAdministered} • Vet: {vac.vetName || 'Dr. Verma'}</span>
                      </div>
                      <select
                        value={vac.status}
                        onChange={(e) => handleUpdateVaccinationStatus(managePet.id, vac.id, e.target.value)}
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
                <form onSubmit={handleAddVaccinationSubmit} className="pt-3 border-t border-slate-100 space-y-2.5">
                  <span className="text-[11px] font-bold text-emerald-700 uppercase block">➕ Add New Vaccine</span>
                  <div className="grid grid-cols-2 gap-2">
                    <input type="text" required value={newVac.vaccineName} onChange={(e) => setNewVac({ ...newVac, vaccineName: e.target.value })} placeholder="Vaccine Name" className="px-3 py-2 rounded-xl border border-slate-200 text-xs" />
                    <input type="date" required value={newVac.dateAdministered} onChange={(e) => setNewVac({ ...newVac, dateAdministered: e.target.value })} className="px-3 py-2 rounded-xl border border-slate-200 text-xs" />
                  </div>
                  <div className="flex justify-end">
                    <button type="submit" className="px-5 py-2 bg-emerald-50 text-emerald-800 font-black text-xs rounded-xl border border-emerald-200">
                      Add Vaccine
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Tab 3: Expenses */}
            {manageTab === 'EXPENSES' && (
              <div className="space-y-3 pt-2 animate-fadeIn">
                <form onSubmit={handleAddExpenseSubmit} className="space-y-3">
                  <div className="grid grid-cols-2 gap-2">
                    <select value={newExp.category} onChange={(e) => setNewExp({ ...newExp, category: e.target.value })} className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold">
                      <option value="Food">Food & Kibble</option>
                      <option value="Vet">Vet Visit</option>
                      <option value="Grooming">Grooming & Spa</option>
                      <option value="Accessories">Accessories & Tags</option>
                    </select>
                    <input type="number" required value={newExp.amount} onChange={(e) => setNewExp({ ...newExp, amount: e.target.value })} placeholder="Amount (₹)" className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold" />
                  </div>
                  <input type="text" value={newExp.description} onChange={(e) => setNewExp({ ...newExp, description: e.target.value })} placeholder="Description" className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs" />
                  <div className="flex justify-end">
                    <button type="submit" className="px-5 py-2 bg-blue-50 text-blue-900 font-black text-xs rounded-xl border border-blue-200">
                      Save Expense
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Tab 4: Reminders */}
            {manageTab === 'REMINDERS' && (
              <div className="space-y-3 pt-2 animate-fadeIn">
                <form onSubmit={handleAddReminderSubmit} className="space-y-3">
                  <input type="text" required value={newRem.title} onChange={(e) => setNewRem({ ...newRem, title: e.target.value })} placeholder="Reminder Title" className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold" />
                  <div className="grid grid-cols-2 gap-2">
                    <input type="date" required value={newRem.date} onChange={(e) => setNewRem({ ...newRem, date: e.target.value })} className="px-3 py-2 rounded-xl border border-slate-200 text-xs" />
                    <select value={newRem.repeat} onChange={(e) => setNewRem({ ...newRem, repeat: e.target.value })} className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold">
                      <option value="ONCE">ONCE</option>
                      <option value="MONTHLY">MONTHLY</option>
                      <option value="EVERY_3_MONTHS">EVERY 3 MONTHS</option>
                    </select>
                  </div>
                  <div className="flex justify-end">
                    <button type="submit" className="px-5 py-2 bg-amber-50 text-amber-900 font-black text-xs rounded-xl border border-amber-200">
                      Save Reminder
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Tab 5: Passport */}
            {manageTab === 'PASSPORT' && (
              <div className="space-y-3 pt-2 animate-fadeIn text-center">
                <p className="text-xs text-slate-500">Preview or print the official medical passport for {managePet.name}.</p>
                <div className="flex justify-center gap-3">
                  <button type="button" onClick={() => window.print()} className="px-6 py-2.5 bg-purple-50 hover:bg-purple-100 text-purple-900 font-black text-xs rounded-xl border border-purple-200">
                    🖨️ Print Passport Document
                  </button>
                </div>
              </div>
            )}

            {/* Tab 6: Missing Alert */}
            {manageTab === 'ALERT' && (
              <div className="space-y-3 pt-2 animate-fadeIn">
                <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl font-mono text-[11px] text-rose-950 font-bold space-y-1">
                  <p>🚨 EMERGENCY MISSING PET ALERT 🚨</p>
                  <p>Name: {managePet.name}</p>
                  <p>Breed: {managePet.breed}</p>
                  <p>Scan QR: {getPetPublicUrl(managePet.publicId)}</p>
                </div>
                <div className="flex gap-2">
                  <button type="button" onClick={() => {
                    const text = `🚨 EMERGENCY MISSING PET ALERT 🚨\nName: ${managePet.name}\nBreed: ${managePet.breed}\nScan QR: ${getPetPublicUrl(managePet.publicId)}`;
                    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
                  }} className="flex-1 py-2 bg-emerald-50 text-emerald-800 font-extrabold text-xs rounded-xl border border-emerald-300">
                    Share to WhatsApp
                  </button>
                </div>
              </div>
            )}

            {/* Tab 7: Docs Vault */}
            {manageTab === 'DOCS' && (
              <div className="space-y-3 pt-2 animate-fadeIn">
                <form onSubmit={handleAddDocSubmit} className="space-y-2">
                  <input type="text" required value={newDoc.title} onChange={(e) => setNewDoc({ ...newDoc, title: e.target.value })} placeholder="Document Title" className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs" />
                  <div className="flex justify-end">
                    <button type="submit" className="px-5 py-2 bg-indigo-50 text-indigo-800 font-black text-xs rounded-xl border border-indigo-200">
                      Save Document
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Tab 8: Delete Pet */}
            {manageTab === 'DELETE' && (
              <div className="space-y-3 pt-2 animate-fadeIn text-center">
                <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 border border-rose-200 flex items-center justify-center mx-auto">
                  <Trash2 className="w-6 h-6" />
                </div>
                <p className="text-xs text-slate-600">Are you sure you want to permanently remove {managePet.name} from the registry?</p>
                <button
                  type="button"
                  onClick={() => {
                    setDeletingPet(managePet);
                  }}
                  className="px-6 py-2.5 bg-rose-500 hover:bg-rose-600 text-white font-black text-xs rounded-xl shadow-md"
                >
                  Remove Pet Permanently
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ==================== DELETE / REMOVE PET CONFIRMATION MODAL ==================== */}
      {deletingPet && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white text-slate-800 border border-slate-200 rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl animate-fadeIn text-center">
            <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 border border-rose-200 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>

            <div className="space-y-1">
              <h3 className="text-lg font-black text-slate-800">Remove {deletingPet.name}?</h3>
              <p className="text-xs text-slate-500 leading-relaxed font-medium">
                Are you sure you want to delete <span className="font-bold text-slate-800">{deletingPet.name}</span> ({deletingPet.breed}) from your Puppy ID registry? This action will disable the QR collar tag.
              </p>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeletingPet(null)}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold text-xs rounded-xl border border-slate-200 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeletePet}
                className="flex-1 py-2.5 bg-rose-500 hover:bg-rose-600 text-white font-black text-xs rounded-xl shadow-md transition-colors"
              >
                Remove Pet Permanently
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================== STEP-BY-STEP ADD PUPPY MODAL ==================== */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white text-slate-800 border border-slate-200 rounded-3xl p-5 sm:p-7 max-w-lg w-full space-y-4 shadow-2xl animate-fadeIn max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                  <Dog className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-black text-slate-800">Add New Puppy Studio</h2>
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
                    className={`py-1.5 sm:py-2 px-1 rounded-xl text-[9px] sm:text-[10px] font-black flex items-center justify-center gap-1 transition-all ${
                      isActive
                        ? isMale ? 'bg-blue-600 text-white shadow-xs' : 'bg-pink-500 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-800 hover:bg-white/60'
                    }`}
                  >
                    <Icon className="w-3 h-3 shrink-0" />
                    <span className="truncate">{s.label}</span>
                  </button>
                );
              })}
            </div>

            <form onSubmit={handleAddPuppySubmit} className="space-y-3 sm:space-y-4">
              {/* Step 1: Basic Info */}
              {step === 1 && (
                <div className="space-y-3 animate-fadeIn">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Puppy Name *</label>
                    <input
                      type="text"
                      required
                      value={newPetData.name}
                      onChange={(e) => setNewPetData({ ...newPetData, name: e.target.value })}
                      placeholder="e.g. Bruno / Coco / Bella"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-brand-coral bg-white"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Species</label>
                      <select
                        value={newPetData.species}
                        onChange={(e) => setNewPetData({ ...newPetData, species: e.target.value })}
                        className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-brand-coral bg-white"
                      >
                        <option value="Dog">Dog</option>
                        <option value="Cat">Cat</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Gender (Theme Accent) *</label>
                      <select
                        value={newPetData.gender}
                        onChange={(e) => setNewPetData({ ...newPetData, gender: e.target.value as any })}
                        className={`w-full px-3 py-2.5 rounded-xl border font-black text-xs focus:outline-none focus:ring-2 ${
                          isMale
                            ? 'bg-blue-50 text-blue-900 border-blue-300 focus:ring-blue-400'
                            : 'bg-pink-50 text-pink-900 border-pink-300 focus:ring-pink-400'
                        }`}
                      >
                        <option value="Male">Male (Sky Blue Theme Dot)</option>
                        <option value="Female">Female (Soft Pink Theme Dot)</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Dog Breed *</label>
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
                      <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Color</label>
                      <input
                        type="text"
                        value={newPetData.color}
                        onChange={(e) => setNewPetData({ ...newPetData, color: e.target.value })}
                        placeholder="e.g. Golden / Black"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-brand-coral bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Weight</label>
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
                    <button
                      type="button"
                      onClick={() => {
                        if (!newPetData.name) {
                          alert('Please enter Puppy Name');
                          return;
                        }
                        setStep(2);
                      }}
                      className="w-full py-2.5 font-black bg-brand-coral/10 hover:bg-brand-coral/20 text-brand-coral border border-brand-coral/30 rounded-xl text-xs flex items-center justify-center transition-colors"
                    >
                      Next: ID Tags &rarr;
                    </button>
                  </div>
                </div>
              )}

              {/* Step 2: ID Tags */}
              {step === 2 && (
                <div className="space-y-3 animate-fadeIn">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Microchip ID</label>
                    <input
                      type="text"
                      value={newPetData.microchipId}
                      onChange={(e) => setNewPetData({ ...newPetData, microchipId: e.target.value })}
                      placeholder="e.g. 988 000 123 456 789"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-brand-coral bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Pet Registration Number</label>
                    <input
                      type="text"
                      value={newPetData.registrationNo}
                      onChange={(e) => setNewPetData({ ...newPetData, registrationNo: e.target.value })}
                      placeholder="e.g. PET-HYD-2026-001"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-brand-coral bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Municipal License Number</label>
                    <input
                      type="text"
                      value={newPetData.licenseNo}
                      onChange={(e) => setNewPetData({ ...newPetData, licenseNo: e.target.value })}
                      placeholder="e.g. LIC-99210-A"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-brand-coral bg-white"
                    />
                  </div>

                  <div className="flex justify-between gap-2 pt-2">
                    <button type="button" onClick={() => setStep(1)} className="px-4 py-2 bg-slate-100 text-slate-700 font-extrabold text-xs rounded-xl border border-slate-200">
                      &larr; Back
                    </button>
                    <button type="button" onClick={() => setStep(3)} className="px-5 py-2 bg-brand-coral/10 text-brand-coral font-black text-xs rounded-xl border border-brand-coral/30">
                      Next: Vaccinations &rarr;
                    </button>
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
                    <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Vaccine Name</label>
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
                      <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Date Given</label>
                      <input
                        type="date"
                        value={newPetData.dateAdministered}
                        onChange={(e) => setNewPetData({ ...newPetData, dateAdministered: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Next Due Date</label>
                      <input
                        type="date"
                        value={newPetData.nextDueDate}
                        onChange={(e) => setNewPetData({ ...newPetData, nextDueDate: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                      />
                    </div>
                  </div>

                  <div className="flex justify-between gap-2 pt-2">
                    <button type="button" onClick={() => setStep(2)} className="px-4 py-2 bg-slate-100 text-slate-700 font-extrabold text-xs rounded-xl border border-slate-200">
                      &larr; Back
                    </button>
                    <button type="button" onClick={() => setStep(4)} className="px-5 py-2 bg-brand-coral/10 text-brand-coral font-black text-xs rounded-xl border border-brand-coral/30">
                      Next: Photo & Confirm &rarr;
                    </button>
                  </div>
                </div>
              )}

              {/* Step 4: Photo & Public Notes */}
              {step === 4 && (
                <div className="space-y-3.5 animate-fadeIn">
                  <label className="block text-[11px] font-bold text-slate-600 uppercase">Pet Photo (Upload or Take Photo)</label>
                  
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
                    <button type="button" onClick={() => setStep(3)} className="px-4 py-2 bg-slate-100 text-slate-700 font-extrabold text-xs rounded-xl border border-slate-200">
                      &larr; Back
                    </button>
                    <button type="submit" disabled={isSubmitting} className="px-5 py-2.5 bg-brand-coral/10 hover:bg-brand-coral/20 text-brand-coral border border-brand-coral/30 font-black text-xs rounded-xl shadow-xs">
                      {isSubmitting ? 'Generating QR Code...' : 'Add Puppy & Generate QR'}
                    </button>
                  </div>
                </div>
              )}
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
