"use client";

import { motion } from "framer-motion";
import GlassCard from "@/components/ui/GlassCard";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import GlassButton from "@/components/ui/GlassButton";

export default function DashboardHub() {
    const router = useRouter();
    const [isChecking, setIsChecking] = useState(true);
    const [analytics, setAnalytics] = useState<any>(null);
    const [events, setEvents] = useState<any[]>([]);
    const [userRole, setUserRole] = useState("user");

    // Secure gateway protection & Fetch Data
    useEffect(() => {
        const fetchDashboardData = async (token: string) => {
            try {
                const res = await fetch('/api/dashboard/organizer', {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                if (res.ok) {
                    const data = await res.json();
                    setAnalytics(data.analytics);
                    setEvents(data.events);
                }
            } catch (err) {
                console.error("Failed to load dashboard data");
            } finally {
                setIsChecking(false);
            }
        };

        const token = localStorage.getItem("tixx_token");
        if (!token) {
            // Kick invaders back to login
            router.push("/login");
        } else {
            try {
                const payload = JSON.parse(atob(token.split('.')[1]));
                if (payload.role === 'organizer') {
                    setUserRole('organizer');
                    fetchDashboardData(token);
                } else {
                    router.push("/passes");
                }
            } catch (e) {
                router.push("/login");
            }
        }
    }, [router]);

    if (isChecking) {
        return (
            <main className="min-h-[calc(100vh-80px)] flex items-center justify-center p-6">
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} className="w-10 h-10 border-4 border-white/30 border-t-purple-500 rounded-full" />
            </main>
        );
    }

    if (userRole !== 'organizer') return null; // Fallback, router intercepts above

    return (
        <main className="min-h-[calc(100vh-80px)] flex flex-col items-center py-10 px-6 relative max-w-6xl mx-auto">
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="w-full flex md:flex-row flex-col items-center md:items-end justify-between mb-12 gap-6"
            >
                <div>
                    <h1 className="text-4xl md:text-5xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-fuchsia-400">
                        Organizer Dashboard
                    </h1>
                    <p className="text-lg text-white/70">Analyze your ticket sales and manage your active events.</p>
                </div>
                <div className="flex gap-4">
                    <GlassButton className="!py-3 !px-6 !bg-blue-500/20 hover:!bg-blue-500/40 border-blue-500/50">
                        <Link href="/dashboard/scan" className="flex items-center gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 013.75 9.375v-4.5zM3.75 14.625c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5a1.125 1.125 0 01-1.125-1.125v-4.5zM13.5 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0113.5 9.375v-4.5z" />
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 6.75h.75v.75h-.75v-.75zM6.75 16.5h.75v.75h-.75v-.75zM16.5 6.75h.75v.75h-.75v-.75zM13.5 13.5h.75v.75h-.75v-.75zM13.5 19.5h.75v.75h-.75v-.75zM19.5 13.5h.75v.75h-.75v-.75zM19.5 19.5h.75v.75h-.75v-.75zM16.5 16.5h.75v.75h-.75v-.75z" />
                            </svg>
                            Scan Passes
                        </Link>
                    </GlassButton>

                    <GlassButton className="!py-3 !px-6 !bg-purple-500/20 hover:!bg-purple-500/40 border-purple-500/50">
                        <Link href="/events/create" className="flex items-center gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                            </svg>
                            Create New Event
                        </Link>
                    </GlassButton>
                </div>
            </motion.div>

            {/* Analytics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full mb-12">
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4, delay: 0.1 }}>
                    <GlassCard className="p-6 h-full flex flex-col justify-center border-t-4 border-t-purple-500">
                        <p className="text-sm text-white/50 font-medium uppercase tracking-wider mb-2">Total Revenue</p>
                        <h2 className="text-3xl font-bold text-white">
                            {analytics?.primaryCurrency === 'USD' ? '$' : analytics?.primaryCurrency === 'EUR' ? '€' : '₹'}
                            {analytics?.totalRevenue?.toLocaleString() || '0'}
                        </h2>
                    </GlassCard>
                </motion.div>

                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4, delay: 0.2 }}>
                    <GlassCard className="p-6 h-full flex flex-col justify-center border-t-4 border-t-blue-500">
                        <p className="text-sm text-white/50 font-medium uppercase tracking-wider mb-2">Tickets Sold</p>
                        <h2 className="text-3xl font-bold text-white">{analytics?.totalTicketsSold || '0'}</h2>
                    </GlassCard>
                </motion.div>

                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4, delay: 0.3 }}>
                    <GlassCard className="p-6 h-full flex flex-col justify-center border-t-4 border-t-green-500">
                        <p className="text-sm text-white/50 font-medium uppercase tracking-wider mb-2">Active Events</p>
                        <h2 className="text-3xl font-bold text-white">{analytics?.activeEventsCount || '0'}</h2>
                        <p className="text-xs text-green-400 mt-2">{3 - (analytics?.activeEventsCount || 0)} event slots remaining</p>
                    </GlassCard>
                </motion.div>
            </div>

            {/* Events List */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="w-full"
            >
                <h3 className="text-2xl font-bold mb-6">Your Events</h3>

                {events.length === 0 ? (
                    <GlassCard className="p-10 text-center flex flex-col items-center justify-center min-h-[250px] border border-white/5 bg-white/5">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12 text-white/20 mb-4">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                        </svg>
                        <h4 className="text-xl font-semibold mb-2 text-white/80">No events yet</h4>
                        <p className="text-white/50 mb-6">Create your first event to start selling tickets!</p>
                        <Link href="/events/create" className="text-purple-400 hover:text-purple-300 font-medium">Get Started &rarr;</Link>
                    </GlassCard>
                ) : (
                    <div className="flex flex-col gap-4">
                        {events.map((event, idx) => (
                            <motion.div
                                key={event.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.3, delay: 0.5 + (idx * 0.1) }}
                            >
                                <GlassCard className="p-5 flex flex-col md:flex-row items-start md:items-center justify-between hover:bg-white/10 transition-colors border-l-4 border-l-purple-500 group">
                                    <div className="flex-1 mb-4 md:mb-0">
                                        <div className="flex items-center gap-3 mb-2">
                                            <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide bg-purple-500/20 text-purple-300">
                                                {event.category}
                                            </span>
                                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide ${event.status === 'Active' ? 'bg-green-500/20 text-green-300' : 'bg-yellow-500/20 text-yellow-300'}`}>
                                                {event.status}
                                            </span>
                                        </div>
                                        <h4 className="text-xl font-bold mb-1 text-white group-hover:text-purple-300 transition-colors">{event.title}</h4>
                                        <p className="text-sm text-white/50">{new Date(event.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                                    </div>

                                    <div className="flex bg-black/40 rounded-xl p-3 gap-6 md:mr-6 w-full md:w-auto overflow-x-auto justify-around border border-white/5">
                                        <div className="text-center">
                                            <p className="text-xs text-white/40 uppercase tracking-widest mb-1">Seats Sold</p>
                                            <p className="font-mono font-bold text-white">{event.ticketsSold} <span className="text-white/30 text-xs">/ {event.totalSeats}</span></p>
                                        </div>
                                        <div className="w-[1px] bg-white/10" />
                                        <div className="text-center">
                                            <p className="text-xs text-white/40 uppercase tracking-widest mb-1">Revenue</p>
                                            <p className="font-mono font-bold text-white">
                                                {event.currency === 'USD' ? '$' : event.currency === 'EUR' ? '€' : '₹'}
                                                {event.revenue?.toLocaleString() || '0'}
                                            </p>
                                        </div>
                                    </div>

                                    <Link href={`/events/${event.id}`} className="mt-4 md:mt-0 px-4 py-2 bg-white/5 hover:bg-purple-500/20 border border-white/10 hover:border-purple-500/50 rounded-lg text-sm font-medium transition-all w-full md:w-auto text-center shrink-0">
                                        Manage
                                    </Link>
                                </GlassCard>
                            </motion.div>
                        ))}
                    </div>
                )}
            </motion.div>
        </main>
    );
}
