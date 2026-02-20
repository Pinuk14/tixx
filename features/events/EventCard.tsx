"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import GlassButton from "@/components/ui/GlassButton";

export interface EventData {
    id: string;
    title: string;
    date: string;
    location: string;
    imageUrl: string;
    totalSeats: number;
    availableSeats: number;
}

interface EventCardProps {
    event: EventData;
    className?: string;
}

export default function EventCard({ event, className = "" }: EventCardProps) {
    const percentAvailable = (event.availableSeats / event.totalSeats) * 100;

    // Determine color based on availability
    let availabilityColor = "bg-green-400";
    if (percentAvailable < 10) availabilityColor = "bg-red-400";
    else if (percentAvailable < 30) availabilityColor = "bg-orange-400";

    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            whileHover={{ y: -8, scale: 1.02 }}
            className={`glass rounded-3xl overflow-hidden flex flex-col transition-all duration-300 group ${className}`}
        >
            {/* Image Banner */}
            <div className="relative h-48 w-full overflow-hidden">
                {/* Fallback pattern if Image fails or doesn't exist, styled beautifully */}
                <div className="absolute inset-0 bg-gradient-to-br from-purple-800/40 to-blue-900/40" />
                {event.imageUrl ? (
                    <Image
                        src={event.imageUrl}
                        alt={event.title}
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-110 opacity-80"
                    />
                ) : (
                    <div className="absolute inset-0 flex items-center justify-center bg-white/5">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor" className="w-16 h-16 text-white/20">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                        </svg>
                    </div>
                )}

                {/* Availability Badge */}
                <div className="absolute top-4 right-4 glass px-3 py-1.5 rounded-full backdrop-blur-md flex items-center gap-2 border-white/20">
                    <div className={`w-2 h-2 rounded-full ${availabilityColor} shadow-[0_0_10px_currentColor] animate-pulse`} />
                    <span className="text-xs font-semibold text-white/90">
                        {event.availableSeats === 0 ? "Sold Out" : `${event.availableSeats} Seats Left`}
                    </span>
                </div>
            </div>

            {/* Content */}
            <div className="p-6 flex-1 flex flex-col justify-between">
                <div>
                    <h3 className="text-xl font-bold text-white mb-2 line-clamp-1">{event.title}</h3>

                    <div className="space-y-2 mb-6">
                        <div className="flex items-center text-white/70 text-sm">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 mr-2 text-purple-400">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                            </svg>
                            <span>{event.date}</span>
                        </div>

                        <div className="flex items-center text-white/70 text-sm">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 mr-2 text-blue-400">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                            </svg>
                            <span className="line-clamp-1">{event.location}</span>
                        </div>
                    </div>
                </div>

                <GlassButton
                    className="w-full !py-2.5 text-sm"
                    disabled={event.availableSeats === 0}
                >
                    {event.availableSeats === 0 ? "Waitlist" : "Get Tickets"}
                </GlassButton>
            </div>
        </motion.div>
    );
}
