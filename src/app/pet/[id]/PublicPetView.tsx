'use client';

import React, { useState } from 'react';
import {
  PhoneCall,
  MapPin,
  Mail,
  ShieldCheck,
  CheckCircle2,
  Share2,
  MessageSquare,
  Heart,
  PawPrint,
} from 'lucide-react';
import { calculateAge, formatDate } from '@/lib/utils';
import { ContactOwnerModal } from '@/components/finder/ContactOwnerModal';

interface PublicPetViewProps {
  pet: any;
}

export const PublicPetView: React.FC<PublicPetViewProps> = ({ pet }) => {
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const privacy = pet.privacySetting || {};

  const primaryPhone = pet.user?.phone || '+91 98765 43210';
  const altPhone = pet.user?.altPhone || '+91 91234 56789';
  const ownerEmail = pet.user?.email || 'myfamily@email.com';
  const address = pet.user?.address || '12, Green Meadows Apartment, Road No. 5, Banjara Hills, Hyderabad, Telangana 500034, India';

  const ageText = calculateAge(pet.dob);
  const isMale = pet.gender === 'Male';

  const whatsappMessage = encodeURIComponent(
    `Hi! I found ${pet.name}. I scanned his Puppy ID QR code on his collar tag.`
  );
  const whatsappUrl = `https://wa.me/${primaryPhone.replace(/[^0-9]/g, '')}?text=${whatsappMessage}`;

  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    pet.lastSeenLocation || address
  )}`;

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `Help ${pet.name} find home!`,
        text: `${pet.name} is a ${pet.breed}. Scan QR or contact owner if found.`,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Pet profile link copied to clipboard!');
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF7F2] pb-16">
      {/* Top Banner Notice */}
      <div className="bg-slate-900 text-white py-2.5 px-4 text-center text-xs font-bold flex items-center justify-center gap-2">
        <PawPrint className="w-4 h-4 text-brand-coral fill-current" />
        <span>PUBLIC QR PAGE — Visible to anyone who scans the QR code</span>
      </div>

      {/* Main Mobile-First Container */}
      <main className="max-w-md mx-auto px-4 py-6 space-y-5">
        {/* Top Header Card */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100/80 text-center relative overflow-hidden">
          {/* Paw Prints Decor */}
          <div className="flex items-center justify-between text-brand-coral/30 px-4 mb-1">
            <PawPrint className="w-6 h-6 rotate-[-15deg] fill-current" />
            <PawPrint className="w-6 h-6 rotate-[15deg] fill-current" />
          </div>

          <p className="text-sm font-semibold text-slate-500">Hi, I&apos;m</p>
          <h1 className="text-3xl font-extrabold text-slate-900 flex items-center justify-center gap-1.5 mt-0.5">
            <span>{pet.name}</span>
            <Heart className="w-6 h-6 text-rose-500 fill-rose-500 inline-block" />
          </h1>

          <div className="flex flex-wrap items-center justify-center gap-2 mt-2">
            <span className="text-xs font-bold text-slate-700">{pet.breed}</span>
            <span className="text-slate-300">•</span>
            <span
              className={`text-xs font-extrabold px-2.5 py-0.5 rounded-full border ${
                isMale
                  ? 'bg-blue-50 text-blue-800 border-blue-200'
                  : 'bg-rose-50 text-rose-800 border-rose-200'
              }`}
            >
              {pet.gender === 'Male' ? '♂ Male' : '♀ Female'}
            </span>
            <span className="text-slate-300">•</span>
            <span className="text-xs font-bold text-slate-600">{ageText}</span>
          </div>

          {/* Pet Photo */}
          {privacy.showPhoto !== false && (
            <div className="mt-5 relative rounded-2xl overflow-hidden shadow-md border-4 border-white">
              <img
                src={pet.photo || 'https://images.unsplash.com/photo-1552053831-71594a27632d?w=600&h=600&fit=crop'}
                alt={pet.name}
                className="w-full h-64 object-cover"
              />
            </div>
          )}

          {/* Emergency Lost Banner */}
          {pet.isLost && (
            <div className="mt-5 bg-rose-50 border-2 border-rose-200 p-4 rounded-2xl text-center space-y-1 animate-fadeIn">
              <h3 className="text-lg font-extrabold text-rose-700">I&apos;m lost...</h3>
              <p className="text-xs font-bold text-rose-800 leading-snug">
                Please help me come home.<br />
                {pet.lostNotes || 'I am friendly and I miss my family.'}
              </p>
            </div>
          )}

          {/* Primary Action Buttons */}
          <div className="mt-5 space-y-3">
            <p className="text-xs font-extrabold text-slate-700 tracking-wide">Please call my family</p>

            {privacy.showPhone !== false && (
              <a
                href={`tel:${primaryPhone}`}
                className="w-full py-3.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm rounded-full shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2 transition-all transform active:scale-95"
              >
                <PhoneCall className="w-5 h-5 fill-current" />
                <span>Call {primaryPhone}</span>
              </a>
            )}

            {privacy.showAltPhone !== false && altPhone && (
              <a
                href={`tel:${altPhone}`}
                className="w-full py-3 px-4 bg-[#F4ECE1] hover:bg-[#EADBC8] text-slate-800 font-bold text-xs rounded-full border border-amber-200/60 flex items-center justify-center gap-2 transition-all"
              >
                <PhoneCall className="w-4 h-4 text-slate-600" />
                <span>Call {altPhone}</span>
              </a>
            )}

            {pet.rewardAmount && (
              <div className="w-full py-2.5 px-4 bg-amber-50 text-amber-800 font-bold text-xs rounded-full border border-amber-200 flex items-center justify-center gap-2">
                <ShieldCheck className="w-4 h-4 text-amber-600" />
                <span>{pet.rewardAmount}</span>
              </div>
            )}
          </div>
        </div>

        {/* My Home Card */}
        {privacy.showAddress !== false && address && (
          <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100/80 space-y-3">
            <div className="flex items-center gap-2 text-slate-800 font-extrabold text-sm">
              <MapPin className="w-4 h-4 text-amber-700" />
              <span>My Home</span>
            </div>
            <p className="text-xs text-slate-600 font-medium leading-relaxed">{address}</p>

            <a
              href={googleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-2.5 px-4 bg-[#F4ECE1] hover:bg-[#EADBC8] text-slate-800 font-bold text-xs rounded-full border border-amber-200/60 flex items-center justify-center gap-2 transition-colors"
            >
              <MapPin className="w-4 h-4 text-amber-800" />
              <span>Open in Google Maps</span>
            </a>
          </div>
        )}

        {/* Contact Details Card */}
        <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100/80 space-y-3">
          <div className="flex items-center gap-2 text-slate-800 font-extrabold text-sm">
            <PhoneCall className="w-4 h-4 text-amber-700" />
            <span>Contact Details</span>
          </div>

          <div className="space-y-2 text-xs">
            {privacy.showPhone !== false && (
              <div className="flex justify-between items-center py-1 border-b border-slate-50">
                <span className="text-slate-500 font-medium">Primary</span>
                <a href={`tel:${primaryPhone}`} className="font-bold text-slate-900 hover:text-emerald-600">
                  {primaryPhone}
                </a>
              </div>
            )}
            {privacy.showAltPhone !== false && altPhone && (
              <div className="flex justify-between items-center py-1 border-b border-slate-50">
                <span className="text-slate-500 font-medium">Alternate</span>
                <a href={`tel:${altPhone}`} className="font-bold text-slate-900 hover:text-emerald-600">
                  {altPhone}
                </a>
              </div>
            )}
            {privacy.showEmail !== false && (
              <div className="flex justify-between items-center py-1">
                <span className="text-slate-500 font-medium">Email</span>
                <a href={`mailto:${ownerEmail}`} className="font-bold text-slate-900 hover:text-emerald-600">
                  {ownerEmail}
                </a>
              </div>
            )}
          </div>

          <button
            onClick={() => setIsContactModalOpen(true)}
            className="w-full mt-2 py-2.5 px-4 bg-brand-coral hover:bg-rose-600 text-white font-bold text-xs rounded-full shadow-md flex items-center justify-center gap-2 transition-colors"
          >
            <MessageSquare className="w-4 h-4" />
            <span>Send Direct Message to Owner</span>
          </button>
        </div>

        {/* About Me Card */}
        <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100/80 space-y-3">
          <div className="flex items-center gap-2 text-slate-800 font-extrabold text-sm">
            <PawPrint className="w-4 h-4 text-brand-coral fill-current" />
            <span>About Me</span>
          </div>

          <div className="grid grid-cols-2 gap-y-2.5 text-xs">
            <div>
              <span className="text-slate-400 font-medium block">Breed</span>
              <span className="font-bold text-slate-800">{pet.breed}</span>
            </div>
            <div>
              <span className="text-slate-400 font-medium block">Gender</span>
              <span className="font-bold text-slate-800">{pet.gender}</span>
            </div>
            <div>
              <span className="text-slate-400 font-medium block">Age</span>
              <span className="font-bold text-slate-800">{ageText}</span>
            </div>
            <div>
              <span className="text-slate-400 font-medium block">Color</span>
              <span className="font-bold text-slate-800">{pet.color || 'Golden'}</span>
            </div>
            {privacy.showMicrochip !== false && pet.microchipId && (
              <div className="col-span-2 pt-1 border-t border-slate-50">
                <span className="text-slate-400 font-medium block">Microchip ID</span>
                <span className="font-mono font-bold text-slate-900">{pet.microchipId}</span>
              </div>
            )}
          </div>

          <div
            className={`p-3 rounded-2xl border text-center text-xs font-bold flex items-center justify-center gap-1.5 ${
              isMale
                ? 'bg-blue-50/80 border-blue-100 text-blue-800'
                : 'bg-rose-50/80 border-rose-100 text-rose-800'
            }`}
          >
            <Heart className={`w-4 h-4 shrink-0 ${isMale ? 'text-blue-500 fill-blue-500' : 'text-rose-500 fill-rose-500'}`} />
            <span>Thank you for helping me. You are awesome! 🐶</span>
          </div>
        </div>

        {/* Vaccinations Card */}
        {privacy.showVaccinations !== false && pet.vaccinations && pet.vaccinations.length > 0 && (
          <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100/80 space-y-3">
            <div className="flex items-center gap-2 text-slate-800 font-extrabold text-sm">
              <ShieldCheck className="w-4 h-4 text-purple-600" />
              <span>Vaccinations</span>
            </div>

            <div className="space-y-2 text-xs">
              {pet.vaccinations.map((vac: any) => (
                <div key={vac.id} className="flex items-center justify-between py-1 border-b border-slate-50">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span className="font-bold text-slate-800">{vac.vaccineName}</span>
                  </div>
                  <span className="text-slate-500 font-medium">{formatDate(vac.dateAdministered)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Important Notes Card */}
        {privacy.showNotes !== false && (
          <div
            className={`rounded-3xl p-5 border space-y-2 ${
              isMale ? 'bg-blue-50/50 border-blue-100' : 'bg-rose-50/50 border-rose-100'
            }`}
          >
            <div className={`flex items-center gap-2 font-extrabold text-sm ${isMale ? 'text-blue-900' : 'text-rose-900'}`}>
              <Heart className={`w-4 h-4 ${isMale ? 'text-blue-600 fill-blue-600' : 'text-rose-600 fill-rose-600'}`} />
              <span>Important Notes</span>
            </div>
            <p className={`text-xs font-semibold leading-relaxed ${isMale ? 'text-blue-950' : 'text-rose-950'}`}>
              {pet.importantNotes || `${pet.name} is a friendly boy. He loves people and kids. Please call my family immediately. 🐾`}
            </p>
          </div>
        )}

        {/* Share This Card */}
        <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100/80 space-y-3 text-center">
          <div className="flex items-center justify-center gap-2 text-slate-800 font-extrabold text-sm">
            <Share2 className="w-4 h-4 text-blue-600" />
            <span>Share This</span>
          </div>
          <p className="text-xs text-slate-500">
            If you found me, please share my details with others.
          </p>

          <div className="flex items-center gap-3 pt-1">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 py-2.5 px-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-300 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors"
            >
              <span>WhatsApp</span>
            </a>
            <button
              onClick={handleShare}
              className="flex-1 py-2.5 px-3 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-300 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Share</span>
            </button>
          </div>
        </div>

        {/* Footer Note */}
        <div className="text-center pt-2 pb-4 text-xs font-semibold text-slate-500 space-y-1">
          <p>Thank you for helping {pet.name} come home.</p>
          <p>🐾 He means the world to our family.</p>
        </div>
      </main>

      {/* Sticky Bottom Actions Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 p-3 flex items-center justify-center max-w-md mx-auto shadow-2xl">
        <a
          href={`tel:${primaryPhone}`}
          className="flex-1 py-3 bg-emerald-600 text-white font-extrabold text-xs rounded-2xl flex items-center justify-center gap-2 shadow-lg hover:bg-emerald-700 active:scale-95 transition-all"
        >
          <PhoneCall className="w-4 h-4 fill-current" />
          <span>CALL OWNER</span>
        </a>
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="ml-2 px-4 py-3 bg-emerald-100 text-emerald-800 font-extrabold text-xs rounded-2xl flex items-center justify-center gap-1.5 border border-emerald-300 hover:bg-emerald-200"
        >
          <span>WHATSAPP</span>
        </a>
      </div>

      <ContactOwnerModal
        isOpen={isContactModalOpen}
        onClose={() => setIsContactModalOpen(false)}
        petId={pet.id}
        petName={pet.name}
      />
    </div>
  );
};
