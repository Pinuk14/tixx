"use client";

import { motion } from "framer-motion";
import GlassCard from "@/components/ui/GlassCard";
import GlassButton from "@/components/ui/GlassButton";
import Link from "next/link";
import Image from "next/link"; // Not actually rendering next/image right now due to mock, just link wrappers

export default function Home() {

  return (
    <main className="min-h-screen flex flex-col items-center pt-32 pb-24 px-6 overflow-x-hidden">

      {/* Massive Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="text-center max-w-4xl mx-auto z-10"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="inline-block mb-6 px-4 py-1.5 rounded-full border border-purple-500/30 bg-purple-500/10 backdrop-blur-md text-purple-300 text-sm font-medium tracking-wide"
        >
          The Future of Cloud Ticketing is Here
        </motion.div>

        <h1 className="text-5xl md:text-7xl font-extrabold mb-6 leading-tight tracking-tight bg-clip-text text-transparent bg-gradient-to-br from-white via-white/90 to-purple-400">
          Next-Gen Event Management
        </h1>

        <p className="text-xl md:text-2xl text-white/60 mb-10 max-w-2xl mx-auto leading-relaxed">
          Seamlessly organize, scale, and secure your live events with cryptographic QR passes and real-time global seat analytics.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link href="/register">
            <GlassButton className="!px-8 !py-4 text-lg bg-white text-black hover:bg-gray-200 border-transparent shadow-[0_0_30px_rgba(255,255,255,0.3)] !rounded-full transition-transform hover:scale-105 active:scale-95">
              Start Organizing Free
            </GlassButton>
          </Link>
          <Link href="/events">
            <GlassButton className="!px-8 !py-4 text-lg !bg-white/5 hover:!bg-white/10 !rounded-full transition-transform hover:scale-105 active:scale-95">
              Discover Live Events
            </GlassButton>
          </Link>
        </div>
      </motion.div>

      {/* Floating Abstract Element to break up the page visually */}
      <motion.div
        animate={{
          y: [0, -15, 0],
          rotate: [0, 2, 0]
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="mt-20 w-full max-w-5xl h-[300px] md:h-[500px] rounded-3xl border border-white/10 bg-gradient-to-tr from-white/5 to-transparent backdrop-blur-sm relative overflow-hidden flex items-center justify-center shadow-2xl z-0"
      >
        <div className="absolute inset-0 bg-noise opacity-20 pointer-events-none"></div>
        {/* Mock Dashboard Representation */}
        <div className="w-[80%] h-[80%] rounded-2xl border border-white/10 bg-black/40 shadow-[0_0_50px_rgba(0,0,0,0.5)] p-6 flex flex-col gap-4">
          <div className="flex justify-between items-center border-b border-white/10 pb-4">
            <div className="w-32 h-6 bg-white/10 rounded-md animate-pulse"></div>
            <div className="flex gap-2">
              <div className="w-8 h-8 rounded-full bg-indigo-500/50"></div>
              <div className="w-8 h-8 rounded-full bg-purple-500/50"></div>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4 h-24">
            <div className="bg-white/5 rounded-xl border border-white/5 flex items-center justify-center"><div className="w-16 h-8 bg-green-400/20 rounded"></div></div>
            <div className="bg-white/5 rounded-xl border border-white/5 flex items-center justify-center"><div className="w-24 h-8 bg-blue-400/20 rounded"></div></div>
            <div className="bg-white/5 rounded-xl border border-white/5 flex items-center justify-center"><div className="w-20 h-8 bg-purple-400/20 rounded"></div></div>
          </div>
          <div className="flex-1 bg-white/5 rounded-xl border border-white/5 p-4 flex gap-4">
            <div className="w-1/3 h-full bg-white/5 rounded-lg"></div>
            <div className="w-2/3 h-full bg-white/5 rounded-lg flex flex-col justify-between">
              <div className="w-full h-8 bg-white/10 rounded"></div>
              <div className="w-full h-8 bg-white/10 rounded"></div>
              <div className="w-full h-8 bg-white/10 rounded"></div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Core Value Proposition Cards */}
      <div className="w-full max-w-7xl mx-auto mt-32 z-10">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60 mb-4">Enterprise Architecture. Startup Speed.</h2>
          <p className="text-white/60 text-lg max-w-2xl mx-auto">Engineered from the ground up to prevent ticket forgery and handle massive concurrent traffic spikes during drops.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Feature 1 */}
          <motion.div
            whileHover={{ y: -10 }}
            transition={{ duration: 0.3 }}
          >
            <GlassCard className="h-full p-8 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-6 opacity-20 group-hover:opacity-100 transition-opacity duration-500 blur-2xl flex items-start justify-end pointer-events-none">
                <div className="w-32 h-32 bg-fuchsia-500 rounded-full"></div>
              </div>
              <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center mb-6 border border-white/10">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-7 h-7 text-fuchsia-400">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-3">Cryptographic QR Passes</h3>
              <p className="text-white/60 leading-relaxed">
                Every single booking generates an immutable, digitally signed JWT QR Code that is validated physically at the door by the Organizer API.
              </p>
            </GlassCard>
          </motion.div>

          {/* Feature 2 */}
          <motion.div
            whileHover={{ y: -10 }}
            transition={{ duration: 0.3 }}
          >
            <GlassCard className="h-full p-8 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-6 opacity-20 group-hover:opacity-100 transition-opacity duration-500 blur-2xl flex items-start justify-end pointer-events-none">
                <div className="w-32 h-32 bg-blue-500 rounded-full"></div>
              </div>
              <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center mb-6 border border-white/10">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-7 h-7 text-blue-400">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5M9 11.25v1.5M12 9v3.75m3-6v6" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-3">PostgreSQL Seat Locks</h3>
              <p className="text-white/60 leading-relaxed">
                Zero overselling. Native Postgres ROW FOR UPDATE transactions guarantee mathematically perfect seat synchronization regardless of ticket volume.
              </p>
            </GlassCard>
          </motion.div>

          {/* Feature 3 */}
          <motion.div
            whileHover={{ y: -10 }}
            transition={{ duration: 0.3 }}
          >
            <GlassCard className="h-full p-8 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-6 opacity-20 group-hover:opacity-100 transition-opacity duration-500 blur-2xl flex items-start justify-end pointer-events-none">
                <div className="w-32 h-32 bg-amber-500 rounded-full"></div>
              </div>
              <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center mb-6 border border-white/10">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-7 h-7 text-amber-400">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.042 21.672L13.684 16.6m0 0l-2.51 2.225.569-9.47 5.227 7.917-3.286-.672zm-7.518-.267A8.25 8.25 0 1120.25 10.5M8.288 14.212A5.25 5.25 0 1117.25 10.5" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-3">Live Geofencing</h3>
              <p className="text-white/60 leading-relaxed">
                Native SQL Haversine calculations allow attendees to aggressively filter the live database against strict coordinate radii parameters globally.
              </p>
            </GlassCard>
          </motion.div>
        </div>
      </div>

    </main>
  );
}