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
  Lock,
  Eye,
} from 'lucide-react';
import { calculateAge, formatDate } from '@/lib/utils';
import { ContactOwnerModal } from '@/components/finder/ContactOwnerModal';

interface PublicPetViewProps {
  pet: any;
}

export const PublicPetView: React.FC<PublicPetViewProps> = ({ pet }) => {
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const privacy = pet?.privacySetting || {};

  const primaryPhone = pet?.user?.phone || '+91 96526 36993';
  const altPhone = pet?.user?.altPhone || '';
  const ownerEmail = pet?.user?.email || 'tarun.tarun460@gmail.com';
  const address = pet?.user?.address || 'Road No. 5, Banjara Hills, Hyderabad, Telangana, India';

  const ageText = calculateAge(pet?.dob);
  const isMale = pet?.gender === 'Male';

  const whatsappMessage = encodeURIComponent(
    `Hi! I found ${pet?.name || 'your puppy'}. I scanned the Puppy ID QR code on the collar tag.`
  );
  const whatsappUrl = `https://wa.me/${primaryPhone.replace(/[^0-9]/g, '')}?text=${whatsappMessage}`;

  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    pet?.lastSeenLocation || address
  )}`;

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `Help ${pet?.name} find home!`,
        text: `${pet?.name} is a ${pet?.breed}. Scan QR or contact owner if found.`,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Pet profile link copied to clipboard!');
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF7F2] pb-24 text-slate-800">
      {/* Top Banner Notice: Strict Read-Only Public QR Profile */}
      <div className="bg-slate-900 text-white py-2.5 px-4 text-center text-xs font-bold flex items-center justify-center gap-2 shadow-md">
        <Lock className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
        <span>OFFICIAL PUPPY ID TAG • READ-ONLY PUBLIC PROFILE</span>
        <span className="bg-slate-800 text-slate-300 text-[10px] px-2 py-0.5 rounded-full font-mono">
          SCAN VIEW ONLY
        </span>
      </div>

      {/* Main Mobile-First View Container */}
      <main className="max-w-md mx-auto px-4 py-5 space-y-5">
        {/* Header Card */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200/80 text-center relative overflow-hidden">
          <div className="flex items-center justify-between text-brand-coral/30 px-2 mb-1">
            <PawPrint className="w-6 h-6 rotate-[-15deg] fill-current" />
            <PawPrint className="w-6 h-6 rotate-[15deg] fill-current" />
          </div>

          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Hello, I&apos;m</p>
          <h1 className="text-3xl font-extrabold text-slate-900 flex items-center justify-center gap-2 mt-0.5">
            <span>{pet?.name || 'Puppy'}</span>
            <Heart className="w-6 h-6 text-rose-500 fill-rose-500 inline-block" />
          </h1>

          <div className="flex flex-wrap items-center justify-center gap-2 mt-2">
            <span className="text-xs font-bold text-slate-800">{pet?.breed || 'Golden Retriever'}</span>
            <span className="text-slate-300">•</span>
            <span
              className={`text-xs font-extrabold px-3 py-0.5 rounded-full border ${
                isMale
                  ? 'bg-blue-50 text-blue-800 border-blue-200'
                  : 'bg-rose-50 text-rose-800 border-rose-200'
              }`}
            >
              {isMale ? '♂ Male' : '♀ Female'}
            </span>
            <span className="text-slate-300">•</span>
            <span className="text-xs font-bold text-slate-600">{ageText}</span>
          </div>

          {/* Pet Photo */}
          {privacy.showPhoto !== false && (
            <div className="mt-5 relative rounded-2xl overflow-hidden shadow-md border-4 border-white">
              <img
                src={pet?.photo || 'https://images.unsplash.com/photo-1552053831-71594a27632d?w=600&h=600&fit=crop'}
                alt={pet?.name}
                className="w-full h-64 object-cover"
              />
            </div>
          )}

          {/* Emergency Lost Banner */}
          {pet?.isLost && (
            <div className="mt-5 bg-rose-50 border-2 border-rose-200 p-4 rounded-2xl text-center space-y-1.5 animate-pulse">
              <h3 className="text-lg font-black text-rose-700 uppercase tracking-wide">🚨 I AM LOST!</h3>
              <p className="text-xs font-extrabold text-rose-900 leading-snug">
                Please help me get back to my family.<br />
                {pet?.lostNotes || 'I am friendly and wearing my Puppy ID collar tag.'}
              </p>
            </div>
          )}

          {/* Primary Emergency Call Buttons */}
          <div className="mt-5 space-y-2.5">
            <p className="text-xs font-extrabold text-slate-700 tracking-wide uppercase">Contact My Family Immediately</p>

            {privacy.showPhone !== false && (
              <a
                href={`tel:${primaryPhone}`}
                className="w-full py-3.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm rounded-2xl shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2 transition-all active:scale-95"
              >
                <PhoneCall className="w-5 h-5 fill-current" />
                <span>Call Family ({primaryPhone})</span>
              </a>
            )}

            {privacy.showAltPhone !== false && altPhone && (
              <a
                href={`tel:${altPhone}`}
                className="w-full py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-2xl border border-slate-200 flex items-center justify-center gap-2 transition-all"
              >
                <PhoneCall className="w-4 h-4 text-slate-600" />
                <span>Call Secondary Phone ({altPhone})</span>
              </a>
            )}

            {pet?.rewardAmount && (
              <div className="w-full py-2.5 px-4 bg-amber-50 text-amber-900 font-extrabold text-xs rounded-2xl border border-amber-200 flex items-center justify-center gap-2">
                <ShieldCheck className="w-4 h-4 text-amber-600" />
                <span>{pet.rewardAmount}</span>
              </div>
            )}
          </div>
        </div>

        {/* My Home Location */}
        {privacy.showAddress !== false && address && (
          <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-200/80 space-y-3">
            <div className="flex items-center gap-2 text-slate-900 font-extrabold text-sm">
              <MapPin className="w-4.5 h-4.5 text-amber-600" />
              <span>My Home & Location</span>
            </div>
            <p className="text-xs text-slate-600 font-semibold leading-relaxed">{address}</p>

            <a
              href={googleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-2.5 px-4 bg-amber-50 hover:bg-amber-100 text-amber-900 font-extrabold text-xs rounded-xl border border-amber-200 flex items-center justify-center gap-2 transition-colors"
            >
              <MapPin className="w-4 h-4 text-amber-700" />
              <span>Open Location in Google Maps</span>
            </a>
          </div>
        )}

        {/* Contact Owner */}
        <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-200/80 space-y-3">
          <div className="flex items-center gap-2 text-slate-900 font-extrabold text-sm">
            <PhoneCall className="w-4.5 h-4.5 text-emerald-600" />
            <span>Owner Contact Channels</span>
          </div>

          <div className="space-y-2 text-xs">
            {privacy.showPhone !== false && (
              <div className="flex justify-between items-center py-1 border-b border-slate-100">
                <span className="text-slate-500 font-medium">Primary Phone</span>
                <a href={`tel:${primaryPhone}`} className="font-bold text-slate-900 hover:text-emerald-600">
                  {primaryPhone}
                </a>
              </div>
            )}
            {privacy.showEmail !== false && (
              <div className="flex justify-between items-center py-1">
                <span className="text-slate-500 font-medium">Owner Email</span>
                <a href={`mailto:${ownerEmail}`} className="font-bold text-slate-900 hover:text-emerald-600">
                  {ownerEmail}
                </a>
              </div>
            )}
          </div>

          <button
            onClick={() => setIsContactModalOpen(true)}
            className="w-full mt-2 py-3 px-4 bg-brand-coral hover:bg-rose-600 text-white font-extrabold text-xs rounded-2xl shadow-md flex items-center justify-center gap-2 transition-colors"
          >
            <MessageSquare className="w-4 h-4" />
            <span>Send Direct Message to Owner</span>
          </button>
        </div>

        {/* About Me Details */}
        <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-200/80 space-y-3">
          <div className="flex items-center gap-2 text-slate-900 font-extrabold text-sm">
            <PawPrint className="w-4.5 h-4.5 text-brand-coral fill-current" />
            <span>Puppy Details</span>
          </div>

          <div className="grid grid-cols-2 gap-y-2.5 text-xs">
            <div>
              <span className="text-slate-400 font-medium block">Breed</span>
              <span className="font-bold text-slate-800">{pet?.breed || 'Golden Retriever'}</span>
            </div>
            <div>
              <span className="text-slate-400 font-medium block">Gender</span>
              <span className="font-bold text-slate-800">{pet?.gender || 'Male'}</span>
            </div>
            <div>
              <span className="text-slate-400 font-medium block">Age</span>
              <span className="font-bold text-slate-800">{ageText}</span>
            </div>
            <div>
              <span className="text-slate-400 font-medium block">Color</span>
              <span className="font-bold text-slate-800">{pet?.color || 'Golden'}</span>
            </div>
            {privacy.showMicrochip !== false && pet?.microchipId && (
              <div className="col-span-2 pt-1.5 border-t border-slate-100">
                <span className="text-slate-400 font-medium block">Microchip ID</span>
                <span className="font-mono font-bold text-slate-900">{pet.microchipId}</span>
              </div>
            )}
          </div>
        </div>

        {/* Vaccinations */}
        {privacy.showVaccinations !== false && pet?.vaccinations && pet.vaccinations.length > 0 && (
          <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-200/80 space-y-3">
            <div className="flex items-center gap-2 text-slate-900 font-extrabold text-sm">
              <ShieldCheck className="w-4.5 h-4.5 text-purple-600" />
              <span>Verified Vaccinations</span>
            </div>

            <div className="space-y-2 text-xs">
              {pet.vaccinations.map((vac: any) => (
                <div key={vac.id} className="flex items-center justify-between py-1 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span className="font-extrabold text-slate-800">{vac.vaccineName}</span>
                  </div>
                  <span className="text-slate-500 font-bold">{formatDate(vac.dateAdministered)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Important Notes */}
        {privacy.showNotes !== false && (
          <div className="rounded-3xl p-5 border bg-blue-50/60 border-blue-100 space-y-2">
            <div className="flex items-center gap-2 font-extrabold text-sm text-blue-900">
              <Heart className="w-4 h-4 text-blue-600 fill-blue-600" />
              <span>Important Notes</span>
            </div>
            <p className="text-xs font-semibold leading-relaxed text-blue-950">
              {pet?.importantNotes || `${pet?.name || 'This puppy'} is a friendly boy. He loves people and kids. Please call my family immediately. 🐾`}
            </p>
          </div>
        )}

        {/* Share Section */}
        <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-200/80 space-y-3 text-center">
          <div className="flex items-center justify-center gap-2 text-slate-900 font-extrabold text-sm">
            <Share2 className="w-4 h-4 text-blue-600" />
            <span>Share Profile</span>
          </div>
          <p className="text-xs text-slate-500">
            If you found me, please share my details with others to help me get home.
          </p>

          <div className="flex items-center gap-3 pt-1">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 py-2.5 px-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors"
            >
              <span>WhatsApp</span>
            </a>
            <button
              onClick={handleShare}
              className="flex-1 py-2.5 px-3 bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-300 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Share Profile</span>
            </button>
          </div>
        </div>

        {/* Read-Only Notice Footer */}
        <div className="text-center pt-2 pb-4 text-xs font-semibold text-slate-500 space-y-1">
          <p>🔒 Official Read-Only Public QR Profile for {pet?.name || 'Puppy'}.</p>
          <p>Editing and management are restricted to the owner&apos;s private Studio.</p>
        </div>
      </main>

      {/* Sticky Bottom Calling Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 p-3 flex items-center justify-center max-w-md mx-auto shadow-2xl">
        <a
          href={`tel:${primaryPhone}`}
          className="flex-1 py-3 bg-emerald-600 text-white font-extrabold text-xs rounded-2xl flex items-center justify-center gap-2 shadow-lg hover:bg-emerald-700 active:scale-95 transition-all"
        >
          <PhoneCall className="w-4 h-4 fill-current" />
          <span>CALL FAMILY ({primaryPhone})</span>
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
        petId={pet?.id}
        petName={pet?.name}
      />
    </div>
  );
};
