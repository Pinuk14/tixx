"use client";

import { motion, AnimatePresence } from "framer-motion";
import GlassCard from "@/components/ui/GlassCard";
import Link from "next/link";
import GlassButton from "@/components/ui/GlassButton";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import QRPass from "@/features/passes/QRPass";

export default function PassesPage() {
    const router = useRouter();
    const [isChecking, setIsChecking] = useState(true);
    const [passes, setPasses] = useState<any[]>([]);

    useEffect(() => {
        const fetchPasses = async (token: string) => {
            try {
                const res = await fetch('/api/passes', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (res.ok) {
                    const data = await res.json();
                    setPasses(data.passes);
                }
            } catch (err) {
                console.error("Failed to fetch passes");
            } finally {
                setIsChecking(false);
            }
        };

        const token = localStorage.getItem("tixx_token");
        if (!token) {
            router.push("/login");
        } else {
            fetchPasses(token);
        }
    }, [router]);

    if (isChecking) {
        return (
            <main className="min-h-[calc(100vh-80px)] flex items-center justify-center p-6">
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} className="w-10 h-10 border-4 border-white/30 border-t-purple-500 rounded-full" />
            </main>
        );
    }

    return (
        <main className="min-h-[calc(100vh-80px)] flex flex-col items-center py-10 px-6 relative">
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="w-full max-w-4xl flex flex-col items-start mb-12"
            >
                <div className="flex items-center gap-3 mb-2">
                    <span className="p-2 glass rounded-lg text-purple-400">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 6v.75m0 3v.75m0 3v.75m0 3V18m-9-5.25h5.25M7.5 15h3M3.375 5.25c-.621 0-1.125.504-1.125 1.125v3.026a2.999 2.999 0 010 5.198v3.026c0 .621.504 1.125 1.125 1.125h17.25c.621 0 1.125-.504 1.125-1.125v-3.026a2.999 2.999 0 010-5.198V6.375c0-.621-.504-1.125-1.125-1.125H3.375z" />
                        </svg>
                    </span>
                    <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-fuchsia-400">
                        Your Passes
                    </h1>
                </div>
                <p className="text-lg text-white/70 ml-12">View, download, and manage your event tickets here.</p>
            </motion.div>

            <div className="w-full max-w-4xl flex flex-col gap-12">
                <AnimatePresence>
                    {passes.length === 0 ? (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full">
                            <GlassCard className="p-10 text-center flex flex-col items-center justify-center min-h-[300px]">
                                <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-6 border border-white/10">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor" className="w-10 h-10 text-white/30">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 6v.75m0 3v.75m0 3v.75m0 3V18m-9-5.25h5.25M7.5 15h3M3.375 5.25c-.621 0-1.125.504-1.125 1.125v3.026a2.999 2.999 0 010 5.198v3.026c0 .621.504 1.125 1.125 1.125h17.25c.621 0 1.125-.504 1.125-1.125v-3.026a2.999 2.999 0 010-5.198V6.375c0-.621-.504-1.125-1.125-1.125H3.375z" />
                                    </svg>
                                </div>
                                <h2 className="text-2xl font-bold text-white mb-2">No passes found</h2>
                                <p className="text-white/60 mb-8 max-w-md">You haven't purchased any tickets yet. Explore upcoming events and secure your spot.</p>
                                <GlassButton className="!py-3 !px-8">
                                    <Link href="/events">Browse Events</Link>
                                </GlassButton>
                            </GlassCard>
                        </motion.div>
                    ) : (
                        passes.map((pass, index) => (
                            <motion.div
                                key={pass.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: index * 0.1 }}
                                className="w-full flex justify-center"
                            >
                                <QRPass
                                    eventTitle={pass.eventTitle}
                                    date={pass.eventDate}
                                    time={pass.eventTime}
                                    location={pass.eventLocation}
                                    seats={pass.seats}
                                    orderId={pass.orderId}
                                />
                            </motion.div>
                        ))
                    )}
                </AnimatePresence>
            </div>
        </main>
    );
}
