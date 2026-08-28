# 📜 Puppy ID - Release & Changelog History

All notable changes to the **Puppy ID** Pet Identity & Management Platform are documented in this file.

---

## 🚀 Version 2.0.0 (Latest Release) — *August 28, 2026*

### 🎨 Gender Theme Tinting & Visual Design Upgrades
- **Dynamic Light Color Theme Accents**:
  - **Male Dogs (♂)**: Automatically styled with soft Light Blue card backgrounds (`bg-blue-50/80 border-blue-200`) and blue gender badges (`♂ Male`).
  - **Female Dogs (♀)**: Automatically styled with soft Light Pink card backgrounds (`bg-rose-50/80 border-rose-200`) and pink gender badges (`♀ Female`).
- **Comprehensive Indian Dog Breeds Dropdown**:
  - Replaced manual text input with a complete Indian & popular dog breeds select dropdown: *Indian Pariah / Desi Dog, Golden Retriever, Labrador Retriever, German Shepherd, Beagle, Pug, Mudhol Hound, Rajapalayam, Chippiparai, Kanni, Gaddi Kutta, Rampur Greyhound, Combai, Jonangi, Poodle, Siberian Husky, Rottweiler, Doberman, French Bulldog, Cocker Spaniel, Great Dane, Dachshund, Boxer, Chihuahua, Maltese, Lhasa Apso, Tibetan Mastiff, Indie/Mixed Breed*.

### 📷 Camera Capture & Device Gallery Photo Upload
- **Mobile Camera Capture**: 1-tap **`📷 Take Photo`** button triggering native mobile camera (`capture="environment"`).
- **Gallery File Upload**: 1-tap **`📁 Gallery Upload`** button selecting images from device gallery and converting to base64.
- **Photo URL Support**: Preserved custom URL image fallback.

### 📲 Mobile Viewport & React Portal Modal Architecture
- **React `createPortal`**: Isolated `<Modal>` directly onto `document.body` to bypass parent DOM flex containers and stacking contexts.
- **Overlay Z-Index**: Upgraded modal overlay to **`z-[9999]`** to float above all fixed mobile navigation bars (`z-50`).
- **Viewport Centering**: Modal card centered cleanly in the middle of mobile screens with `max-h-[85vh]` and native inertia touch scrolling (`touch-pan-y`).

---

## 🌟 Version 1.5.0 — *August 28, 2026*

### 📍 Finder Location Tracking & Caretaker Handover Feature
- **Location Pin Submission**: Finders scanning the pet collar QR tag can submit their exact address or tap **`Use My Location`** for GPS coordinates.
- **Handover Caretaker Rescue**: If the finder is busy and cannot wait, they can submit **Caretaker Details** (*Caretaker Name, Phone, Pickup Address, Instructions*).
- **Owner & Admin Rescue Cards**: Owner and Admin receive instant rescue alerts with 1-tap **`CALL CARETAKER`** and **`NAVIGATE TO PICKUP SPOT`** buttons.

### 🛡️ Admin Multi-Dog Studio & Security Login Logs
- **Multi-Dog Registry (`/admin/pets`)**: Manage all registered dogs with separate unique QR codes (`/pet/bruno`, `/pet/coco`, `/pet/max`).
- **Profile Login History (`/admin/audit-logs`)**: Real-time security tracking of login timestamps, user names, emails, IP addresses, devices, and geographic location.
- **Clean New Accounts**: Newly registered accounts start clean with 0 stats until their first pet is created.

---

## 🐾 Version 1.0.0 — *August 24, 2026*

### 🏁 Initial Platform Launch
- Digital Pet Identity QR Code System.
- Public QR Profile (`/pet/[id]`), Emergency Lost Mode, Vaccinations, Expenses (Recharts), Reminders, Document Vault, Printable Collar Tags.
- Initial GitHub Repository setup (`https://github.com/Tarun2231/Coco_website.git`).
