import React from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/layout/Navbar';
import { Button } from '@/components/ui/Button';
import {
  PawPrint,
  QrCode,
  AlertTriangle,
  Syringe,
  DollarSign,
  Bell,
  MessageSquare,
  ShieldCheck,
  PhoneCall,
  MapPin,
  Share2,
  CheckCircle,
} from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-cream-100">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden py-16 md:py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-coral/10 text-brand-coral text-xs font-bold tracking-wide uppercase">
              <PawPrint className="w-4 h-4 fill-current" />
              <span>Next-Gen Pet Identity & Protection</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-none">
              Give Your Pet a <span className="text-brand-coral">Digital Identity</span>
            </h1>

            <p className="text-lg text-slate-600 max-w-xl mx-auto lg:mx-0 font-medium">
              &quot;One QR code can help your pet find its way home.&quot; Attach a Puppy ID QR tag to your pet collar. If lost, finders scan to call you instantly without downloading any app.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
              <Link href="/register">
                <Button size="lg" variant="primary" className="w-full sm:w-auto shadow-xl shadow-brand-coral/20">
                  Create Pet ID Free
                </Button>
              </Link>
              <Link href="#how-it-works">
                <Button size="lg" variant="outline" className="w-full sm:w-auto">
                  See How It Works
                </Button>
              </Link>
            </div>

            <div className="flex items-center justify-center lg:justify-start gap-6 pt-4 text-xs font-semibold text-slate-500">
              <span className="flex items-center gap-1.5"><CheckCircle className="w-4 h-4 text-emerald-500" /> No App Needed for Finder</span>
              <span className="flex items-center gap-1.5"><CheckCircle className="w-4 h-4 text-emerald-500" /> One-Tap Call & WhatsApp</span>
              <span className="flex items-center gap-1.5"><CheckCircle className="w-4 h-4 text-emerald-500" /> Instant Lost Alerts</span>
            </div>
          </div>

          {/* Hero Image Mockup Preview */}
          <div className="relative mx-auto max-w-md lg:max-w-none">
            <div className="bg-white rounded-3xl p-6 shadow-2xl border border-slate-200/80 relative z-10 transform hover:rotate-1 transition-transform">
              <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-lg">
                    🐶
                  </div>
                  <div>
                    <h3 className="font-extrabold text-slate-900 text-base">Bruno</h3>
                    <p className="text-xs text-slate-500">Golden Retriever • 1 Year</p>
                  </div>
                </div>
                <span className="px-3 py-1 bg-rose-50 text-rose-600 font-extrabold text-xs rounded-full border border-rose-200 animate-pulse">
                  🚨 LOST MODE ACTIVE
                </span>
              </div>

              <div className="relative rounded-2xl overflow-hidden mb-4 border border-slate-100">
                <img
                  src="https://images.unsplash.com/photo-1552053831-71594a27632d?w=600&h=400&fit=crop"
                  alt="Golden Retriever Bruno"
                  className="w-full h-56 object-cover"
                />
              </div>

              <div className="bg-rose-50 p-4 rounded-2xl border border-rose-200 mb-4 text-center">
                <h4 className="text-sm font-extrabold text-rose-800">I&apos;m Lost... Please Help Me Come Home!</h4>
                <p className="text-xs text-rose-700 mt-1">I am friendly and I miss my family.</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <a
                  href="tel:+919876543210"
                  className="w-full py-3 bg-emerald-600 text-white rounded-xl text-xs font-extrabold flex items-center justify-center gap-2 shadow-md hover:bg-emerald-700"
                >
                  <PhoneCall className="w-4 h-4" /> Call +91 98765 43210
                </a>
                <a
                  href="https://maps.google.com"
                  target="_blank"
                  rel="noreferrer"
                  className="w-full py-3 bg-slate-800 text-white rounded-xl text-xs font-extrabold flex items-center justify-center gap-2 shadow-md hover:bg-slate-900"
                >
                  <MapPin className="w-4 h-4" /> Open Google Maps
                </a>
              </div>
            </div>

            {/* Decorative background glow */}
            <div className="absolute -inset-4 bg-gradient-to-r from-brand-coral to-amber-400 rounded-3xl blur-2xl opacity-25 -z-10" />
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 bg-white border-y border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900">How Puppy ID Works</h2>
            <p className="mt-4 text-slate-600 font-medium">
              Protecting your pet takes less than 2 minutes. Simple, smart, and life-saving.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              {
                step: '01',
                title: 'Create Profile',
                desc: 'Add pet details, photos, medical notes, emergency contacts, and privacy preferences.',
                icon: PawPrint,
              },
              {
                step: '02',
                title: 'Get QR Code',
                desc: 'Instantly receive a unique QR code. Print custom tag cards or save to your phone.',
                icon: QrCode,
              },
              {
                step: '03',
                title: 'Attach To Collar',
                desc: 'Place the QR tag on your pet’s collar, harness, keychain, or printed ID card.',
                icon: ShieldCheck,
              },
              {
                step: '04',
                title: 'Reunite Fast',
                desc: 'When scanned by a finder, they see your contact info immediately and can call or message you.',
                icon: Share2,
              },
            ].map((st) => {
              const Icon = st.icon;
              return (
                <div key={st.step} className="bg-cream-50 p-6 rounded-3xl border border-cream-200 text-center relative group hover:shadow-lg transition-all">
                  <div className="w-12 h-12 rounded-2xl bg-brand-coral text-white flex items-center justify-center mx-auto mb-4 font-bold text-lg shadow-md">
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className="text-xs font-black text-brand-coral uppercase tracking-widest">Step {st.step}</span>
                  <h3 className="text-lg font-bold text-slate-900 mt-1 mb-2">{st.title}</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">{st.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Feature Grid */}
      <section id="features" className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900">Complete Pet Identity & Management</h2>
          <p className="mt-4 text-slate-600 font-medium">
            Everything you need for your pet&apos;s safety, medical records, expenses, and reminders in one place.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { title: 'Digital Pet ID', desc: 'Secure digital identity profile accessible 24/7.', icon: PawPrint, color: 'text-brand-coral' },
            { title: 'Lost Pet Mode', desc: 'Activate emergency lost banners with reward info & last seen map pin.', icon: AlertTriangle, color: 'text-rose-600' },
            { title: 'Vaccination Records', desc: 'Track DHPP, Rabies, Kennel Cough dates and upload certificates.', icon: Syringe, color: 'text-emerald-600' },
            { title: 'Expense Tracker', desc: 'Monitor food, vet visits, grooming, and accessories with spending charts.', icon: DollarSign, color: 'text-blue-600' },
            { title: 'Smart Reminders', desc: 'Never miss deworming, flea treatments, or vet appointments.', icon: Bell, color: 'text-amber-600' },
            { title: 'Finder Messaging', desc: 'Receive instant messages and GPS locations from good samaritans.', icon: MessageSquare, color: 'text-purple-600' },
          ].map((f, i) => {
            const Icon = f.icon;
            return (
              <div key={i} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-all">
                <div className={`w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center mb-4 ${f.color}`}>
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">{f.title}</h3>
                <p className="text-sm text-slate-600 leading-relaxed">{f.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto bg-slate-950 text-slate-400 py-12 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-brand-coral text-white flex items-center justify-center font-bold">
              <PawPrint className="w-5 h-5 fill-current" />
            </div>
            <span className="font-bold text-lg text-white">Puppy ID</span>
          </div>

          <p className="text-xs text-slate-500">
            &copy; {new Date().getFullYear()} Puppy ID Inc. All rights reserved. Give Every Pet a Voice.
          </p>

          <div className="flex items-center gap-6 text-xs text-slate-400 font-medium">
            <Link href="/privacy" className="hover:text-white">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-white">Terms of Service</Link>
            <Link href="/lost-pets" className="hover:text-white text-rose-400">Lost Pets</Link>
            <Link href="/admin" className="hover:text-white">Admin Portal</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
