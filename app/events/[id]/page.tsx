"use client";

import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
type CheckoutStep = "seats" | "payment" | "success";
import Image from "next/image";
import { useParams } from "next/navigation";
import GlassCard from "@/components/ui/GlassCard";
import GlassButton from "@/components/ui/GlassButton";

// Newly built feature modules
import SeatGrid from "@/features/seats/SeatGrid";
import OrderSummary from "@/features/payment/OrderSummary";
import MockUPIPayment from "@/features/payment/MockUPIPayment";
import QRPass from "@/features/passes/QRPass";
import { useSeatStore } from "@/store/useSeatStore";

export default function EventCheckoutPage() {
    const params = useParams();
    const eventId = params?.id as string;

    // Global Seat selection store
    const { selectedSeats, seats, clearSelection } = useSeatStore();

    const [step, setStep] = useState<CheckoutStep>("seats");
    const [orderId, setOrderId] = useState<string>("");

    // Live Database States
    const [event, setEvent] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [notFound, setNotFound] = useState(false);

    // Fetch live details hook
    useEffect(() => {
        if (!eventId) return;

        const fetchEventDetails = async () => {
            try {
                const res = await fetch(`/api/events/${eventId}`);
                if (!res.ok) {
                    if (res.status === 404 || res.status === 400) {
                        setNotFound(true);
                    }
                    return;
                }
                const data = await res.json();

                // Translate Postgres Snake Case to Frontend CamelCase
                const dbEvent = data.event;
                setEvent({
                    id: dbEvent.id,
                    title: dbEvent.title,
                    date: new Date(dbEvent.event_date).toLocaleDateString('en-US', {
                        month: 'short', day: 'numeric', year: 'numeric'
                    }),
                    time: "8:00 PM - 12:00 AM", // Placeholder since DB doesn't have explicit time yet
                    location: dbEvent.location_name,
                    venue: dbEvent.location_name.split(',')[0],
                    imageUrl: "",
                    totalSeats: dbEvent.total_seats,
                    availableSeats: dbEvent.seats_available,
                    description: "Join us for an exclusive event. Connect with others, learn, and grow. Powered by TiXX DB.",
                    pricePerSeat: dbEvent.price_per_seat ? parseFloat(dbEvent.price_per_seat) : 0
                });

            } catch (err) {
                console.error("Failed to load event details:", err);
                setNotFound(true);
            } finally {
                setIsLoading(false);
            }
        };

        fetchEventDetails();
    }, [eventId]);

    // Derived states
    const selectedSeatDetails = useMemo(() => {
        return seats.filter((s) => selectedSeats.includes(s.id));
    }, [seats, selectedSeats]);

    const subtotalPrice = useMemo(() => {
        return selectedSeatDetails.reduce((sum, seat) => sum + seat.price, 0);
    }, [selectedSeatDetails]);

    const totalAmountDue = subtotalPrice + (selectedSeats.length * 2.50);

    // Handlers
    const handleProceedToPayment = () => {
        if (selectedSeats.length === 0) return;
        setStep("payment");
    };

    const handlePaymentSuccess = () => {
        const generatedOrderId = `TXN-${Math.floor(Math.random() * 10000)}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
        setOrderId(generatedOrderId);
        setStep("success");
    };

    const handleCancelPayment = () => {
        setStep("seats");
    };

    // 404 Guard Clause
    if (notFound) {
        return (
            <main className="min-h-screen pt-32 pb-24 flex flex-col items-center justify-center text-center px-6">
                <div className="glass p-12 rounded-3xl max-w-lg w-full">
                    <h1 className="text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-red-400 to-purple-400 mb-6">404</h1>
                    <h2 className="text-2xl font-bold text-white mb-4">Event Not Found</h2>
                    <p className="text-white/60 mb-8 leading-relaxed">The event you are looking for has either been completed or does not exist on our servers.</p>
                    <GlassButton onClick={() => window.history.back()} className="w-full">Return Home</GlassButton>
                </div>
            </main>
        );
    }

    // Loading State
    if (isLoading || !event) {
        return (
            <main className="min-h-screen pt-32 pb-24 flex flex-col items-center justify-center text-center px-6">
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} className="w-12 h-12 border-4 border-purple-500/20 border-t-purple-500 rounded-full" />
            </main>
        );
    }

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

            <div className="max-w-7xl mx-auto px-6 mt-12 relative z-30 pb-32">
                <AnimatePresence mode="wait">

                    {/* STEP 1: EVENT DETAILS AND SEAT SELECTION */}
                    {step === "seats" && (
                        <motion.div
                            key="seats-step"
                            initial={{ opacity: 0, scale: 0.98 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.4 }}
                            className="grid grid-cols-1 lg:grid-cols-3 gap-8"
                        >
                            {/* Left Column - Event Details & Seat Map */}
                            <div className="lg:col-span-2 space-y-8">
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

                                <div>
                                    <h3 className="text-2xl font-bold mb-4 ml-2">Interactive Seating</h3>
                                    {/* 2D Interactive Seat Grid */}
                                    <SeatGrid />
                                </div>
                            </div>

                            {/* Right Column - Order Summary */}
                            <div>
                                <div className="sticky top-28 h-auto">
                                    <OrderSummary onProceedToPayment={handleProceedToPayment} />
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* STEP 2: PAYMENT */}
                    {step === "payment" && (
                        <motion.div
                            key="payment-step"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ duration: 0.4 }}
                            className="flex justify-center items-center py-10"
                        >
                            <MockUPIPayment
                                amount={totalAmountDue}
                                onSuccess={handlePaymentSuccess}
                                onCancel={handleCancelPayment}
                            />
                        </motion.div>
                    )}

                    {/* STEP 3: SUCCESS TICKET / PASS */}
                    {step === "success" && (
                        <motion.div
                            key="success-step"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.5, type: "spring", bounce: 0.4 }}
                            className="flex flex-col items-center justify-center py-10 overflow-hidden"
                        >
                            <div className="mb-8 text-center">
                                <h2 className="text-3xl font-bold text-green-400 mb-2">You're going to {event.title}!</h2>
                                <p className="text-white/60">Your pass is ready. Show this QR code at the entrance.</p>
                            </div>

                            <QRPass
                                eventTitle={event.title}
                                date={event.date}
                                time={event.time}
                                location={event.venue}
                                seats={selectedSeats}
                                orderId={orderId}
                            />

                            <div className="mt-12">
                                <GlassButton onClick={() => { clearSelection(); setStep("seats"); }} className="!py-3 px-8 text-sm text-white/50 bg-transparent border-white/10 hover:text-white hover:bg-white/10">
                                    Buy more tickets
                                </GlassButton>
                            </div>
                        </motion.div>
                    )}

                </AnimatePresence>
            </div>
        </main>
    );

}