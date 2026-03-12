"use client";

import { motion } from "framer-motion";
import GlassCard from "@/components/ui/GlassCard";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import GlassButton from "@/components/ui/GlassButton";

interface Attendee {
    orderId: string;
    passId: string;
    buyerEmail: string;
    registeredAt: string;
    seatNumber: string;
    attendeeName: string;
    attendeeEmail: string;
    [key: string]: string | undefined; // any other custom form fields
}

export default function EventDashboardPage() {
    const router = useRouter();
    const params = useParams();
    const eventId = params?.id as string;

    const [isChecking, setIsChecking] = useState(true);
    const [eventDetails, setEventDetails] = useState<any>(null);
    const [analytics, setAnalytics] = useState<any>(null);
    const [attendees, setAttendees] = useState<Attendee[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        if (!eventId) return;

        const fetchAttendees = async (token: string) => {
            try {
                const res = await fetch(`/api/events/${eventId}/attendees`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                if (res.ok) {
                    const data = await res.json();
                    setEventDetails(data.event);
                    setAnalytics(data.analytics);
                    setAttendees(data.attendees || []);
                } else if (res.status === 403) {
                    router.push("/dashboard");
                }
            } catch (err) {
                console.error("Failed to load attendees");
            } finally {
                setIsChecking(false);
            }
        };

        const token = localStorage.getItem("tixx_token");
        if (!token) {
            router.push("/login");
        } else {
            try {
                const payload = JSON.parse(atob(token.split('.')[1]));
                if (payload.role === 'organizer') {
                    fetchAttendees(token);
                } else {
                    router.push("/passes");
                }
            } catch (e) {
                router.push("/login");
            }
        }
    }, [eventId, router]);

    const filteredAttendees = attendees.filter(a => 
        a.attendeeName.toLowerCase().includes(searchQuery.toLowerCase()) || 
        a.attendeeEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.orderId.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleDeleteEvent = async () => {
        if (!confirm("Are you sure you want to delete this event? This action cannot be undone.")) return;
        setIsDeleting(true);
        try {
            const token = localStorage.getItem('tixx_token');
            const res = await fetch(`/api/events/${eventId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (res.ok) {
                router.push('/dashboard');
            } else {
                alert("Failed to delete event.");
            }
        } catch (error) {
            alert("Network error.");
        } finally {
            setIsDeleting(false);
        }
    };

    if (isChecking) {
        return (
            <main className="min-h-[calc(100vh-80px)] flex items-center justify-center p-6">
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} className="w-10 h-10 border-4 border-white/30 border-t-purple-500 rounded-full" />
            </main>
        );
    }

    if (!eventDetails) return null;

    return (
        <main className="min-h-[calc(100vh-80px)] flex flex-col items-center py-10 px-6 relative max-w-6xl mx-auto">
            
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="w-full mb-12"
            >
                <div className="flex items-center gap-4 mb-6">
                    <Link href="/dashboard" className="text-white/50 hover:text-white transition-colors flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                        </svg>
                        Back to Dashboard
                    </Link>
                </div>
                
                <div className="flex md:flex-row flex-col items-center md:items-end justify-between gap-6">
                    <div>
                        <div className="flex items-center gap-4 mb-2">
                            <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-fuchsia-400">
                                {eventDetails.title}
                            </h1>
                            <GlassButton
                                onClick={handleDeleteEvent}
                                disabled={isDeleting}
                                className="!py-2 !px-4 !bg-red-500/20 hover:!bg-red-500/40 border-red-500/50 text-red-200 transition-all text-xs"
                            >
                                {isDeleting ? "Deleting..." : "Delete Event"}
                            </GlassButton>
                        </div>
                        <p className="text-lg text-white/70">
                            {new Date(eventDetails.event_date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                        </p>
                    </div>
                    
                    <div className="flex bg-white/5 rounded-xl p-4 gap-8 border border-white/10 items-center overflow-x-auto w-full md:w-auto">
                        <div className="text-center min-w-[100px]">
                            <p className="text-xs text-white/40 uppercase tracking-widest mb-1">Total Views</p>
                            <p className="font-mono font-bold text-2xl text-blue-400">{analytics?.totalViews || 0}</p>
                        </div>
                        <div className="w-[1px] h-8 bg-white/10" />
                        <div className="text-center min-w-[100px]">
                            <p className="text-xs text-white/40 uppercase tracking-widest mb-1">Conversion</p>
                            <p className="font-mono font-bold text-2xl text-green-400">{analytics?.conversionRate || 0}%</p>
                        </div>
                        <div className="w-[1px] h-8 bg-white/10" />
                        <div className="text-center min-w-[100px]">
                            <p className="text-xs text-white/40 uppercase tracking-widest mb-1">Peak Time</p>
                            <p className="font-mono font-bold text-xl text-yellow-500 mt-1">{analytics?.peakBookingTime || 'N/A'}</p>
                        </div>
                        <div className="w-[1px] h-8 bg-white/10" />
                        <div className="text-center min-w-[100px]">
                            <p className="text-xs text-white/40 uppercase tracking-widest mb-1">Registrations</p>
                            <p className="font-mono font-bold text-2xl text-purple-400">{attendees.length}</p>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Attendees Table */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="w-full"
            >
                <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                    <h3 className="text-2xl font-bold">Attendee List</h3>
                    
                    <div className="relative w-full md:w-80">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-white/40">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                            </svg>
                        </div>
                        <input
                            type="text"
                            placeholder="Search by name, email, or order ID..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 bg-black/40 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-purple-500 transition-colors"
                        />
                    </div>
                </div>

                <GlassCard className="!p-0 overflow-hidden border border-white/10">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-white/5 border-b border-white/10">
                                    <th className="p-4 text-xs tracking-wider text-white/50 uppercase font-semibold">Attendee</th>
                                    {eventDetails.form_fields?.map((field: string) => (
                                        field !== 'name' && field !== 'email' ? (
                                            <th key={field} className="p-4 text-xs tracking-wider text-white/50 uppercase font-semibold">{field}</th>
                                        ) : null
                                    ))}
                                    <th className="p-4 text-xs tracking-wider text-white/50 uppercase font-semibold">Seat</th>
                                    <th className="p-4 text-xs tracking-wider text-white/50 uppercase font-semibold">Order ID</th>
                                    <th className="p-4 text-xs tracking-wider text-white/50 uppercase font-semibold">Registered</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredAttendees.length === 0 ? (
                                    <tr>
                                        <td colSpan={10} className="p-8 text-center text-white/50">
                                            No attendees found.
                                        </td>
                                    </tr>
                                ) : (
                                    filteredAttendees.map((attendee, idx) => (
                                        <tr key={`${attendee.orderId}-${attendee.seatNumber}-${idx}`} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                                            <td className="p-4">
                                                <div className="font-semibold text-white/90">{attendee.attendeeName}</div>
                                                <div className="text-sm text-white/50">{attendee.attendeeEmail}</div>
                                            </td>
                                            {eventDetails.form_fields?.map((field: string) => (
                                                field !== 'name' && field !== 'email' ? (
                                                    <td key={field} className="p-4 text-sm text-white/80">
                                                        {attendee[field] || '-'}
                                                    </td>
                                                ) : null
                                            ))}
                                            <td className="p-4">
                                                <span className="px-3 py-1 bg-purple-500/20 text-purple-300 font-mono text-sm rounded-lg border border-purple-500/30">
                                                    {attendee.seatNumber}
                                                </span>
                                            </td>
                                            <td className="p-4 font-mono text-sm text-white/70">
                                                {attendee.orderId}
                                            </td>
                                            <td className="p-4 text-sm text-white/60">
                                                {new Date(attendee.registeredAt).toLocaleDateString()}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </GlassCard>
            </motion.div>
        </main>
    );
}
