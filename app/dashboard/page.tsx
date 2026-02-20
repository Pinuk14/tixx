"use client";

import { motion } from "framer-motion";
import GlassCard from "@/components/ui/GlassCard";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function DashboardHub() {
    const router = useRouter();
    const [isChecking, setIsChecking] = useState(true);

    // Secure gateway protection
    useEffect(() => {
        const token = localStorage.getItem("tixx_token");
        if (!token) {
            // Kick invaders back to login
            router.push("/login");
        } else {
            setIsChecking(false);
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
        <main className="min-h-[calc(100vh-80px)] flex flex-col items-center justify-center p-6 relative">
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="text-center mb-12"
            >
                <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-fuchsia-400">
                    Welcome to Your Dashboard
                </h1>
                <p className="text-lg text-white/70">What would you like to achieve today?</p>
            </motion.div>

            <div className="grid md:grid-cols-2 gap-8 max-w-4xl w-full">
                {/* Organize / Register Event Action */}
                <motion.div
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                >
                    <Link href="/events/create" className="block h-full outline-none">
                        <GlassCard className="h-full flex flex-col items-center justify-center p-10 text-center hover:bg-white/10 hover:border-purple-500/50 hover:shadow-[0_0_40px_rgba(168,85,247,0.2)] transition-all duration-300 cursor-pointer group">
                            <div className="w-20 h-20 bg-purple-500/20 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-10 h-10 text-purple-400">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                                </svg>
                            </div>
                            <h2 className="text-2xl font-bold mb-3 group-hover:text-purple-300 transition-colors">Register an Event</h2>
                            <p className="text-white/60">I am an Organizer. I want to create a new live event and sell tickets.</p>
                        </GlassCard>
                    </Link>
                </motion.div>

                {/* Attend / Find Event Action */}
                <motion.div
                    initial={{ opacity: 0, x: 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.4 }}
                >
                    <Link href="/events" className="block h-full outline-none">
                        <GlassCard className="h-full flex flex-col items-center justify-center p-10 text-center hover:bg-white/10 hover:border-blue-500/50 hover:shadow-[0_0_40px_rgba(59,130,246,0.2)] transition-all duration-300 cursor-pointer group">
                            <div className="w-20 h-20 bg-blue-500/20 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-10 h-10 text-blue-400">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                                </svg>
                            </div>
                            <h2 className="text-2xl font-bold mb-3 group-hover:text-blue-300 transition-colors">Find New Events</h2>
                            <p className="text-white/60">I am an Attendee. I want to search and book tickets for upcoming events.</p>
                        </GlassCard>
                    </Link>
                </motion.div>
            </div>
        </main>
    );
}
