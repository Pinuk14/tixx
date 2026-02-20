"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { useParams } from "next/navigation";
import GlassCard from "@/components/ui/GlassCard";
import GlassButton from "@/components/ui/GlassButton";

// Fallback Mock Data System for individual lookup
const MOCK_EVENT_DETAIL = {
    id: "evt-1",
    title: "Neon Nights Tech Mixer",
    date: "Aug 15, 2026",
    time: "7:00 PM - 11:00 PM",
    location: "San Francisco, CA",
    venue: "The Glasshouse Atrium",
    imageUrl: "",
    totalSeats: 250,
    availableSeats: 45,
    description: "Join us for an exclusive evening of networking, futuristic tech demos, and electronic music. Connect with founders, engineers, and creators building the next generation of web and AI.",
};

const TICKET_TIERS = [
    { id: "general", name: "General Admission", price: 49, desc: "Access to main floor and networking." },
    { id: "vip", name: "VIP Pass", price: 149, desc: "Includes fast-track entry, open bar, and exclusive lounge." },
    { id: "founder", name: "Founder's Circle", price: 299, desc: "VIP access plus intimate dinner with speakers." },
];

export default function EventDetailsPage() {
    const params = useParams();
    const [selectedTier, setSelectedTier] = useState<string>("general");
    const [quantity, setQuantity] = useState(1);
    const [isProcessing, setIsProcessing] = useState(false);

    // In a real app we'd fetch via params.id. We use MOCK_EVENT_DETAIL here.
    const event = MOCK_EVENT_DETAIL;

    const currentTier = TICKET_TIERS.find((t) => t.id === selectedTier) || TICKET_TIERS[0];
    const totalPrice = currentTier.price * quantity;

    const handleCheckout = () => {
        setIsProcessing(true);
        setTimeout(() => {
            setIsProcessing(false);
            alert(`Checkout started for ${quantity}x ${currentTier.name}!`);
        }, 1500);
    };

    return (
        <main className="min-h-screen pb-24">
            {/* Hero Banner Section */}
            <div className="relative h-[40vh] md:h-[50vh] w-full">
                {/* Fallback gradient background */}
                <div className="absolute inset-0 bg-gradient-to-tr from-purple-900 via-indigo-900 to-black z-0 opacity-80" />

                {event.imageUrl ? (
                    <Image
                        src={event.imageUrl}
                        alt={event.title}
                        fill
                        className="object-cover opacity-60 z-10 mix-blend-overlay"
                        priority
                    />
                ) : (
                    <div className="absolute inset-0 flex items-center justify-center bg-white/5 opacity-20 z-10 pointer-events-none mix-blend-overlay">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={0.5} stroke="currentColor" className="w-64 h-64 text-white">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                        </svg>
                    </div>
                )}

                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/40 to-[#0a0a0a] z-20" />

                {/* Hero Content */}
                <div className="absolute bottom-0 left-0 right-0 z-30 max-w-7xl mx-auto px-6 pb-12">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <div className="inline-block px-3 py-1 bg-white/20 backdrop-blur-md border border-white/30 rounded-full text-xs font-semibold uppercase tracking-wider text-white mb-4">
                            Technology • Networking
                        </div>
                        <h1 className="text-4xl md:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-white/70 mb-4 max-w-4xl">
                            {event.title}
                        </h1>
                        <p className="text-xl text-white/80">{event.date} • {event.location}</p>
                    </motion.div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 mt-12 grid grid-cols-1 lg:grid-cols-3 gap-8 relative z-30">

                {/* Left Column - Event Details */}
                <motion.div
                    className="lg:col-span-2 space-y-8"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                >
                    <GlassCard className="!p-8">
                        <h2 className="text-2xl font-bold mb-6">About the Event</h2>
                        <p className="text-white/80 leading-relaxed text-lg mb-8">
                            {event.description}
                        </p>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="flex items-start gap-4 p-4 rounded-2xl bg-white/5 border border-white/10">
                                <div className="bg-purple-500/20 p-3 rounded-xl">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-purple-400">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <div>
                                    <h4 className="font-semibold text-white/90">Date & Time</h4>
                                    <p className="text-sm text-white/60 mt-1">{event.date}<br />{event.time}</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4 p-4 rounded-2xl bg-white/5 border border-white/10">
                                <div className="bg-blue-500/20 p-3 rounded-xl">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-blue-400">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                                    </svg>
                                </div>
                                <div>
                                    <h4 className="font-semibold text-white/90">Location</h4>
                                    <p className="text-sm text-white/60 mt-1">{event.venue}<br />{event.location}</p>
                                </div>
                            </div>
                        </div>
                    </GlassCard>
                </motion.div>

                {/* Right Column - Booking Section */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, delay: 0.3 }}
                >
                    <div className="sticky top-28">
                        <GlassCard className="!p-8 border-t-purple-500/30">

                            {/* Seat Availability Bar */}
                            <div className="mb-6">
                                <div className="flex justify-between items-end mb-2">
                                    <h3 className="text-xl font-bold">Select Tickets</h3>
                                    <span className="text-sm font-medium text-green-400 flex items-center gap-1.5">
                                        <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse block"></span>
                                        {event.availableSeats} / {event.totalSeats} left
                                    </span>
                                </div>
                                <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${(1 - (event.availableSeats / event.totalSeats)) * 100}%` }}
                                        transition={{ duration: 1, ease: "easeOut" }}
                                        className="h-full bg-gradient-to-r from-purple-500 to-blue-500"
                                    />
                                </div>
                            </div>

                            {/* Tiers List */}
                            <div className="space-y-3 mb-8">
                                {TICKET_TIERS.map((tier) => (
                                    <label
                                        key={tier.id}
                                        className={`
                      relative block cursor-pointer rounded-2xl p-4 transition-all duration-300 border
                      ${selectedTier === tier.id
                                                ? 'bg-white/10 border-purple-400/50 shadow-[0_4px_20px_rgba(168,85,247,0.15)]'
                                                : 'bg-white/5 border-white/10 hover:border-white/20 hover:bg-white/10'}
                    `}
                                    >
                                        <input
                                            type="radio"
                                            name="ticketTier"
                                            value={tier.id}
                                            className="peer sr-only"
                                            onChange={() => setSelectedTier(tier.id)}
                                            checked={selectedTier === tier.id}
                                        />
                                        <div className="flex justify-between items-start mb-1">
                                            <span className="font-bold text-white tracking-wide">{tier.name}</span>
                                            <span className="font-bold text-purple-300">${tier.price}</span>
                                        </div>
                                        <p className="text-sm text-white/50 pr-6">{tier.desc}</p>

                                        <AnimatePresence>
                                            {selectedTier === tier.id && (
                                                <motion.div
                                                    initial={{ scale: 0 }}
                                                    animate={{ scale: 1 }}
                                                    exit={{ scale: 0 }}
                                                    className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 bg-purple-500 rounded-full flex items-center justify-center shadow-[0_0_10px_rgba(168,85,247,0.5)]"
                                                >
                                                    <div className="w-2 h-2 bg-white rounded-full"></div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </label>
                                ))}
                            </div>

                            {/* Quantity Selector & Total */}
                            <div className="flex items-center justify-between mb-8 p-4 bg-black/20 rounded-2xl border border-white/5">
                                <div className="flex items-center gap-4">
                                    <span className="text-white/70">Quantity</span>
                                    <div className="flex items-center gap-3 bg-white/10 rounded-full p-1 border border-white/10">
                                        <button
                                            onClick={() => setQuantity(q => Math.max(1, q - 1))}
                                            className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-white/20 transition-colors"
                                            aria-label="Decrease quantity"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 12h-15" /></svg>
                                        </button>
                                        <span className="w-4 text-center font-bold text-lg">{quantity}</span>
                                        <button
                                            onClick={() => setQuantity(q => Math.min(event.availableSeats, q + 1))}
                                            className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-white/20 transition-colors"
                                            aria-label="Increase quantity"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
                                        </button>
                                    </div>
                                </div>

                                <div className="text-right">
                                    <span className="block text-xs text-white/50 uppercase tracking-wider mb-1">Total Due</span>
                                    {/* Animated Total Price */}
                                    <motion.div
                                        key={totalPrice}
                                        initial={{ y: -10, opacity: 0 }}
                                        animate={{ y: 0, opacity: 1 }}
                                        className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-blue-400"
                                    >
                                        ${totalPrice}
                                    </motion.div>
                                </div>
                            </div>

                            <GlassButton
                                onClick={handleCheckout}
                                disabled={isProcessing}
                                className="w-full !py-4 text-lg font-bold bg-white/20 hover:bg-white/30"
                            >
                                {isProcessing ? (
                                    <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} className="w-6 h-6 mx-auto border-4 border-white/30 border-t-white rounded-full" />
                                ) : (
                                    "Proceed to Checkout"
                                )}
                            </GlassButton>
                            <p className="text-center text-xs text-white/40 mt-4 flex items-center justify-center gap-1.5">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" /></svg>
                                Secure 256-bit encryption
                            </p>
                        </GlassCard>
                    </div>
                </motion.div>
            </div>
        </main>
    );
}
