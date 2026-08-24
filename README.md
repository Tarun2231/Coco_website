# 🐾 Puppy ID - Pet ID & Pet Management Platform

Puppy ID is a complete, modern, production-ready Pet ID & Pet Management Web Application. Each pet receives a unique digital identity powered by a public QR code tag. When someone finds a lost pet and scans the QR code, they immediately access the pet's mobile-optimized public profile with one-tap contact buttons (Call Primary/Alternate Owner, WhatsApp, Google Maps, Finder Messaging) **without requiring any app installation, account creation, or login**.

---

## 🌟 Key Features

### 1. 📱 Public Mobile-First QR Pet Profile (`/pet/[id]`)
- **No Login / No App Required**: Scanners immediately view pet photo, name, breed, age, and allowed details.
- **Emergency Lost Banner**: Prominent lost pet notice with reward information, last seen date/time, and last seen location.
- **One-Tap Actions**: Instant `Call Primary Owner`, `Call Alternate Phone`, `WhatsApp Owner`, `Open in Google Maps`, and `Share` buttons.
- **Finder Contact Form**: Finder can submit name, phone, current location, and message directly to the owner's dashboard inbox.

### 2. 🏠 Multi-Pet Owner Dashboard (`/dashboard`)
- **Multi-Pet Management**: Switch seamlessly between pets (Bruno, Coco, Max) or add a new pet via multi-step wizard.
- **Dashboard Stats**: Real-time KPI cards for total vaccinations, total expenses spent (₹), upcoming reminders, and monthly profile views.
- **QR Code Studio & Printable Collar Tags**: Generate digital QR codes, download PNGs, and print custom collar ID cards.
- **Vaccination Management**: Track DHPP, Rabies, Kennel Cough, due dates, and vet clinics.
- **Expense Tracker & Charts**: Record pet expenses by category (Food, Vet, Medicine, Grooming) with interactive spending pie & bar charts.
- **Reminder Schedule**: Custom repeat intervals (Once, Weekly, Monthly, 3 Months, Yearly) for deworming, flea care, and vet visits.
- **Pet Document Vault**: Store vaccination certificates, municipal licenses, and insurance policies.
- **Granular Privacy Controls**: Toggle public visibility of phone numbers, address, microchip ID, email, vaccinations, and notes.

### 3. 🚨 Public Lost Pets Search Directory (`/lost-pets`)
- Search active lost pet reports by location, species, and breed.

### 4. 🛡️ Platform Admin Panel (`/admin`)
- Platform admin dashboard with total users, pets, active lost pets, and QR scan metrics.
- User management & account oversight.
- Lost pet emergency tracking & security audit logs.

---

## 🛠️ Technology Stack

- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS & Lucide Icons
- **Database**: SQLite (Local instant execution) / PostgreSQL (Vercel Production) with Prisma ORM
- **Authentication**: JWT Cookie-based Auth with bcryptjs password hashing
- **Charts & QR**: Recharts & `qrcode.react` & `html2canvas`

---

## 🚀 Local Development Setup

### 1. Clone & Install Dependencies
```bash
cd puppy-id
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env`:
```env
DATABASE_URL="file:./dev.db"
JWT_SECRET="puppy-id-super-secret-jwt-key-2026"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### 3. Database Initialization & Seeding
```bash
npx prisma db push
npx tsx prisma/seed.ts
```

### 4. Start Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🔑 Demo Login Credentials

- **Demo Owner Account**:
  - Email: `owner@puppyid.com`
  - Password: `password123`
  - Demo Pet: Bruno (Golden Retriever, 1 Year, Microchip #988 000 123 456 789)
  - Demo Public QR Profile: `http://localhost:3000/pet/bruno`

- **Demo System Admin Account**:
  - Email: `admin@puppyid.com`
  - Password: `adminpassword123`
  - Admin Portal: `http://localhost:3000/admin`

---

## 🌐 GitHub & Vercel Production Deployment Guide

### GitHub Repository Setup
```bash
git init
git add .
git commit -m "Initial production release of Puppy ID platform"
git remote add origin https://github.com/YOUR_USERNAME/puppy-id.git
git push -u origin main
```

### Vercel Deployment Setup
1. Import repository on [Vercel](https://vercel.com).
2. Set Environment Variables:
   - `DATABASE_URL`: Production PostgreSQL URL (e.g. Supabase / Neon / Vercel Postgres)
   - `JWT_SECRET`: Random secure string
   - `NEXT_PUBLIC_APP_URL`: `https://puppy-id.vercel.app`
3. Click **Deploy**. Vercel will automatically run `prisma generate` and build the production bundle.
