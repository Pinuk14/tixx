"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import GlassInput from "@/components/ui/GlassInput";
import GlassButton from "@/components/ui/GlassButton";
import EventCard, { EventData } from "@/features/events/EventCard";

// Mock Event Data
const MOCK_EVENTS: EventData[] = [
    {
        id: "evt-1",
        title: "Neon Nights Tech Mixer",
        date: "Aug 15, 2026 • 7:00 PM",
        location: "San Francisco, CA",
        imageUrl: "", // Deliberately empty to show fallback design
        totalSeats: 250,
        availableSeats: 45,
        category: "Networking",
    },
    {
        id: "evt-2",
        title: "Global AI Summit 2026",
        date: "Sep 22, 2026 • 9:00 AM",
        location: "New York, NY",
        imageUrl: "",
        totalSeats: 1500,
        availableSeats: 0,
        category: "Conference",
    },
    {
        id: "evt-3",
        title: "Indie Game Developer Showcase",
        date: "Oct 05, 2026 • 10:00 AM",
        location: "Austin, TX",
        imageUrl: "",
        totalSeats: 500,
        availableSeats: 120,
        category: "Exhibition",
    },
    {
        id: "evt-4",
        title: "Web3 Creators Meetup",
        date: "Aug 28, 2026 • 6:30 PM",
        location: "San Francisco, CA",
        imageUrl: "",
        totalSeats: 100,
        availableSeats: 10,
        category: "Networking",
    },
    {
        id: "evt-5",
        title: "Future of Design Symposium",
        date: "Nov 12, 2026 • 8:00 AM",
        location: "London, UK",
        imageUrl: "",
        totalSeats: 800,
        availableSeats: 350,
        category: "Conference",
    },
    {
        id: "evt-6",
        title: "Underground Electronic Festival",
        date: "Dec 31, 2026 • 9:00 PM",
        location: "Berlin, DE",
        imageUrl: "",
        totalSeats: 3000,
        availableSeats: 215,
        category: "Music",
    },
] as (EventData & { category: string })[];

const CATEGORIES = ["All", "Conference", "Networking", "Exhibition", "Music"];
const LOCATIONS = ["All Locations", "San Francisco, CA", "New York, NY", "Austin, TX", "London, UK", "Berlin, DE"];

export default function EventsPage() {
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("All");
    const [selectedLocation, setSelectedLocation] = useState("All Locations");

    // Filter Events Logic
    const filteredEvents = useMemo(() => {
        return MOCK_EVENTS.filter((event) => {
            const matchesSearch = event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                event.location.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesCategory = selectedCategory === "All" || event.category === selectedCategory;
            const matchesLocation = selectedLocation === "All Locations" || event.location === selectedLocation;

            return matchesSearch && matchesCategory && matchesLocation;
        });
    }, [searchQuery, selectedCategory, selectedLocation]);

    // Framer Motion Variants
    const containerVariants = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    };

    return (
        <main className="min-h-screen pt-12 pb-24 px-6 max-w-7xl mx-auto">
            {/* Header Section */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="mb-12 text-center md:text-left"
            >
                <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-white via-white/90 to-white/60">
                    Discover Events
                </h1>
                <p className="text-white/70 text-lg max-w-2xl">
                    Find and book tickets for the most exclusive tech, design, and culture events happening worldwide.
                </p>
            </motion.div>

            {/* Filters & Search Section */}
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="glass rounded-3xl p-6 mb-12 flex flex-col md:flex-row gap-4 items-center z-20 relative"
            >
                {/* Search Bar */}
                <div className="w-full md:flex-1 relative">
                    <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-white/50 z-10">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                        </svg>
                    </div>
                    <GlassInput
                        type="text"
                        placeholder="Search events or locations..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="!pl-12 !py-3.5"
                        containerClassName="w-full"
                    />
                </div>

                {/* Location Dropdown */}
                <div className="w-full md:w-64 relative">
                    <select
                        value={selectedLocation}
                        onChange={(e) => setSelectedLocation(e.target.value)}
                        className="w-full appearance-none bg-white/10 border border-white/20 text-white px-4 py-3.5 rounded-xl outline-none backdrop-blur-md focus:bg-white/15 focus:border-white/50 focus:shadow-[0_0_15px_rgba(255,255,255,0.1)] transition-all cursor-pointer"
                    >
                        {LOCATIONS.map(loc => (
                            <option key={loc} value={loc} className="bg-slate-900 text-white">
                                {loc}
                            </option>
                        ))}
                    </select>
                    <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-white/50">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                        </svg>
                    </div>
                </div>
            </motion.div>

            {/* Category Pills */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="flex flex-wrap gap-3 mb-10 overflow-x-auto pb-2 scrollbar-hide"
            >
                {CATEGORIES.map(category => (
                    <button
                        key={category}
                        onClick={() => setSelectedCategory(category)}
                        className={`
              px-5 py-2 rounded-full whitespace-nowrap transition-all duration-300 backdrop-blur-md border border-white/20
              ${selectedCategory === category
                                ? 'bg-white text-black font-medium shadow-[0_0_15px_rgba(255,255,255,0.4)]'
                                : 'glass hover:bg-white/10 text-white/80 hover:text-white'
                            }
            `}
                    >
                        {category}
                    </button>
                ))}
            </motion.div>

            {/* Events Grid */}
            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="show"
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            >
                <AnimatePresence mode="popLayout">
                    {filteredEvents.length > 0 ? (
                        filteredEvents.map(event => (
                            <motion.div
                                key={event.id}
                                layout
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                transition={{ duration: 0.4 }}
                            >
                                <EventCard event={event} className="h-full" />
                            </motion.div>
                        ))
                    ) : (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="col-span-1 md:col-span-2 lg:col-span-3 text-center py-24 glass rounded-3xl"
                        >
                            <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4 border border-white/20">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-white/50">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-bold mb-2">No events found</h3>
                            <p className="text-white/60">Try adjusting your search or filters to find what you're looking for.</p>

                            <GlassButton
                                onClick={() => {
                                    setSearchQuery("");
                                    setSelectedCategory("All");
                                    setSelectedLocation("All Locations");
                                }}
                                className="mt-6 text-sm !py-2 !px-4"
                            >
                                Clear Filters
                            </GlassButton>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
        </main>
    );
}
