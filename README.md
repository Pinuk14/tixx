<div align="center">
  <h1>🎟️ TiXX</h1>
  <p><strong>The Future of Cloud Ticketing is Here. Next-Generation Event Management Infrastructure.</strong></p>
  
  <p>
    <a href="https://nextjs.org/"><img src="https://img.shields.io/badge/Built_with-Next.js-black?logo=next.js" alt="Next.js" /></a>
    <a href="https://www.postgresql.org/"><img src="https://img.shields.io/badge/Powered_by-PostgreSQL-336791?logo=postgresql" alt="PostgreSQL" /></a>
    <a href="https://tailwindcss.com/"><img src="https://img.shields.io/badge/Styled_with-Tailwind_CSS-38B2AC?logo=tailwind-css" alt="Tailwind CSS" /></a>
    <a href="https://www.framer.com/motion/"><img src="https://img.shields.io/badge/Animated_by-Framer_Motion-0055FF?logo=framer" alt="Framer Motion" /></a>
  </p>
</div>

<br/>

## 🌟 Overview
TiXX is an enterprise-grade event management platform engineered to eliminate ticket forgery, prevent database overselling, and deliver a visually stunning attendee experience. 

Built with a sleek, liquid-glass aesthetic, TiXX features real-time cryptographic QR pass generation, native PostgreSQL row-level seat locking, and live gateway door scanning directly through the browser.

---

## 🚀 Key Features

### 🛡️ Cryptographic QR Passes
Every booking generates an immutable, unique payload securely embedded into a dynamic QR code. These passes can be instantly downloaded as high-res PDFs and are validated physically at the gates.

### 🔒 Zero Overselling (ACID Compliance)
We utilize native PostgreSQL transactions. This guarantees mathematically perfect seat synchronization and prevents duplicate ticket sales even during massive concurrent traffic spikes across multiple clients.

### 🎥 Live Door Scanner
Organizers have access to a built-in Gateway Door Scanner that natively hooks into device cameras to securely read, parse, and validate cryptographic passes in real-time. Green for verified, red for forged payload rejection.

### 💎 Glass UI
A bleeding-edge, immersive web experience built with Framer Motion and Tailwind CSS. Featuring a custom SVG overlapping perforation logo, complex animated gradient blurs, and hyper-responsive dynamic components.

### 📈 Organizer Analytics Dashboard
Real-time tracking of ticket revenue, total capacity utilization, and active event performance natively rendered securely for host accounts authenticated via JWT.

---

## 🛠️ Tech Stack

- **Frontend Core:** [Next.js (App Router)](https://nextjs.org/) & [React](https://reactjs.org/)
- **Visuals & Motion:** [Tailwind CSS](https://tailwindcss.com/), [Framer Motion](https://www.framer.com/motion/)
- **Database Architecture:** [PostgreSQL](https://www.postgresql.org/) (Native `pg` pooling)
- **Authentication:** Custom JWT Authorization
- **QR & Export Engines:** `react-qr-code`, `html5-qrcode`, `html-to-image`, `jspdf`

---

## 🚦 Getting Started

Follow these steps to spin up the TiXX engine locally:

### 1. Prerequisites
- Node.js (v18+)
- Active PostgreSQL Database instance

### 2. Clone & Install
Navigate to your preferred directory, clone the project, and install NPM dependencies:
```bash
git clone https://github.com/Pinuk14/tixx.git
cd tixx
npm install
```

### 3. Configure Environment Variables
Create a `.env.local` file in the root directory and add your secure variables:
```env
# PostgreSQL DB Connection URL
DATABASE_URL="postgres://user:password@host:port/database?sslmode=require"

# Super secret key for generating Auth Tokens
JWT_SECRET="your-ultra-secure-random-256-bit-string-here"
```

### 4. Initialize Database Schema
Run the built-in migration script to provision all required SQL tables `(users, events, passes)`:
```bash
npx ts-node scripts/migrate.ts
```

### 5. Ignite the Server
```bash
npm run dev
```
Navigate to `http://localhost:3000` to witness the platform in action.

---

## 🧪 Architecture & Routing

The platform dynamically routes entirely based on robust JWT signature parsing:
- **Consumers (`role: user`)**: Land on the interactive dashboard. Gain access to the global Discover feed and the protected `Show Passes` vault to view all acquired cryptotickets in high fidelity.
- **Hosts (`role: organizer`)**: Automatically redirected to the exclusive `Dashboard` possessing powerful live financial analytics, massive Event Creation hubs, and the live Camera Gateway Scanner pipeline.

---

<div align="center">
  <p>Built with ⚡️ for seamless event scalability.</p>
</div>
