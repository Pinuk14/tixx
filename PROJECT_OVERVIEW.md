# TiXX: Features & Architecture Overview

## 🌟 Core Features

### 1. Cryptographic QR Passes
- **Dynamic Generation**: Every booking generates an immutable, unique payload securely embedded into a dynamic QR code (`qr_token` generated for each booking).
- **Exportable Validation**: Passes can be instantly downloaded as high-resolution PDFs and validated via a physical gateway door scanner.

### 2. Zero Overselling (ACID Compliance)
- **Transactional Integrity**: Uses native PostgreSQL transactions to prevent duplicate ticket sales even during high concurrency or massive traffic spikes.
- **Automated Validation**: Seat counts are decremented and synced perfectly using robust verification.

### 3. Live Gateway Door Scanner
- **Real-time Recognition**: Allows organizers to hook into device cameras natively to read, parse, and validate cryptographic passes securely in real-time.
- **Fraud Prevention**: Instantly displays green for verified or red indicating forged payload rejection.

### 4. Role-based Authentication and Dynamic Routing
- **Consumers (`user`)**: Can browse events, securely book passes, and access a protected "Show Passes" vault containing cryptotickets in high fidelity.
- **Hosts (`organizer`)**: Redirected to an exclusive dashboard offering live financial analytics, event creation tools, and the gateway scanner pipeline.
- **Robust JWT Handling**: Custom JWT Authorization governs intelligent dynamic routing across the whole platform (`lib/auth.ts`).

### 5. Immersive Glass UI & Experience
- **Sleek Aesthetic**: Features Framer Motion for complex animated gradient blurs and a highly responsive liquid-glass layout.
- **State Management**: Scalable global store management (`store/useSeatStore.ts`). 

---

## 🏗️ Architecture & Tech Stack

### Frontend Architecture
- **Framework**: **Next.js (App Router)** & **React**.
- **Visuals & Motion**: **Tailwind CSS** for comprehensive utility-first styling and **Framer Motion** for animations.
- **Component Organization**: Follows a modular, feature-based directory approach structure.
  - `/app`: Root Next.js file-system routing. Includes directories mapped directly to Next.js layouts (`dashboard`, `events`, `login`, `passes`, `register`). Also houses Next.js API endpoints (`/app/api`).
  - `/components`: Dedicated directory for reusable Layout and generic UI components (e.g., `layout/Navbar.tsx`).
  - `/features`: Scalable logic domains separated securely by concern (e.g., `events`, `passes`, `payment`, `seats`).
  - `/store`: Reactive global state management for frontend synchronization (`useSeatStore.ts`).

### Backend Core
- **Database Architecture**: **PostgreSQL** configured natively via `pg` connection pooling (`lib/db.ts`) for uncompromised throughput.
- **Schema Overview** (`schema.sql`):
  - `users`: Core table differentiating access levels via strict `role` (`'user'` vs `'organizer'`).
  - `events`: Stores organizer events bounded by `total_seats` metrics, `event_date`, and locational coordinates.
  - `bookings`: Linking table handling secure bookings, storing `event_id`, `user_id`, multiple `seats_booked`, verification and emitting unique secure `qr_token`s.
- **API Intermediary Tier**: Client requests securely hit structured serverless Next.js API routes (`/app/api`) handling authentication, querying, and mutation logic.

### Integration Engines
- **QR & Export Engine**: Client side makes use of libraries including `react-qr-code`, `html5-qrcode`, `html-to-image`, and `jspdf` to seamlessly generate interaction and exportable passes.
- **Environment**: Configuration boundaries cleanly managed through `.env.local` passing system credentials such as the active `DATABASE_URL` and `JWT_SECRET`.
