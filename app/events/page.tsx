"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import GlassInput from "@/components/ui/GlassInput";
import GlassButton from "@/components/ui/GlassButton";
import EventCard, { EventData } from "@/features/events/EventCard";
import dynamic from "next/dynamic";
import type { NearbyEvent } from "@/features/events/NearbyEventsMap";

const NearbyEventsMap = dynamic(() => import("@/features/events/NearbyEventsMap"), {
    ssr: false,
    loading: () => (
        <div className="h-[400px] w-full rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white/50 animate-pulse">
            Loading Map...
        </div>
    ),
});

const CATEGORIES = ["All", "Conference", "Networking", "Exhibition", "Hackathon", "Showcase", "Music"];
const RADIUS_OPTIONS = [
    { label: "10 km", value: 10 },
    { label: "25 km", value: 25 },
    { label: "50 km", value: 50 },
    { label: "100 km", value: 100 },
    { label: "250 km", value: 250 },
];

export default function EventsPage() {
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("All");

    // Live Database State
    const [liveEvents, setLiveEvents] = useState<EventData[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Geolocation State
    const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
    const [geoStatus, setGeoStatus] = useState<"pending" | "granted" | "denied" | "unavailable">("pending");
    const [selectedRadius, setSelectedRadius] = useState(50);

    // Nearby Events State (from geo query)
    const [nearbyEvents, setNearbyEvents] = useState<(EventData & NearbyEvent)[]>([]);
    const [isLoadingNearby, setIsLoadingNearby] = useState(false);

    // Request Geolocation on Mount
    useEffect(() => {
        if (!navigator.geolocation) {
            setGeoStatus("unavailable");
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                setUserLocation({
                    lat: position.coords.latitude,
                    lng: position.coords.longitude,
                });
                setGeoStatus("granted");
            },
            () => {
                setGeoStatus("denied");
            },
            { enableHighAccuracy: false, timeout: 10000, maximumAge: 600000 }
        );
    }, []);

    // Fetch Nearby Events when location or radius changes
    const fetchNearbyEvents = useCallback(async () => {
        if (!userLocation) return;
        setIsLoadingNearby(true);
        try {
            const params = new URLSearchParams({
                lat: userLocation.lat.toString(),
                lng: userLocation.lng.toString(),
                radius: selectedRadius.toString(),
            });
            const res = await fetch(`/api/events/search?${params.toString()}`);
            if (res.ok) {
                const data = await res.json();
                const mapped = data.events.map((dbEvent: any) => ({
                    id: dbEvent.id,
                    title: dbEvent.title,
                    date: new Date(dbEvent.event_date).toLocaleDateString("en-US", {
                        month: "short", day: "numeric", year: "numeric",
                    }),
                    location: dbEvent.location_name,
                    imageUrl: dbEvent.image_url || "",
                    totalSeats: dbEvent.total_seats || 9999,
                    availableSeats: dbEvent.seats_available !== null ? dbEvent.seats_available : 9999,
                    category: dbEvent.category || "Conference",
                    latitude: parseFloat(dbEvent.latitude),
                    longitude: parseFloat(dbEvent.longitude),
                }));
                setNearbyEvents(mapped);
            }
        } catch (err) {
            console.error("Failed to fetch nearby events:", err);
        } finally {
            setIsLoadingNearby(false);
        }
    }, [userLocation, selectedRadius]);

    useEffect(() => {
        if (geoStatus === "granted" && userLocation) {
            fetchNearbyEvents();
        }
    }, [geoStatus, userLocation, selectedRadius, fetchNearbyEvents]);

    // Fetch ALL Live Events on Mount (for the main grid)
    useEffect(() => {
        const fetchEvents = async () => {
            try {
                const queryParams = new URLSearchParams();
                if (searchQuery) queryParams.append("keyword", searchQuery);

                const res = await fetch(`/api/events/search?${queryParams.toString()}`);
                if (res.ok) {
                    const data = await res.json();
                    const mappedData = data.events.map((dbEvent: any) => ({
                        id: dbEvent.id,
                        title: dbEvent.title,
                        date: new Date(dbEvent.event_date).toLocaleDateString("en-US", {
                            month: "short", day: "numeric", year: "numeric",
                        }),
                        location: dbEvent.location_name,
                        imageUrl: dbEvent.image_url || "",
                        totalSeats: dbEvent.total_seats || 9999,
                        availableSeats: dbEvent.seats_available !== null ? dbEvent.seats_available : 9999,
                        category: dbEvent.category || "Conference",
                    }));
                    setLiveEvents(mappedData);
                }
            } catch (err) {
                console.error("Failed to load events from Live Database:", err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchEvents();
    }, []);

    // Filter for the main "All Events" grid
    const filteredEvents = useMemo(() => {
        return liveEvents.filter((event) => {
            const matchesSearch = event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                event.location.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesCategory = selectedCategory === "All" || event.category === selectedCategory;
            return matchesSearch && matchesCategory;
        });
    }, [liveEvents, searchQuery, selectedCategory]);

    const containerVariants = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: { staggerChildren: 0.1 },
        },
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

            {/* ============ EVENTS NEAR YOU SECTION ============ */}
            <AnimatePresence>
                {geoStatus === "granted" && userLocation && (
                    <motion.section
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.6 }}
                        className="mb-16"
                    >
                        {/* Section Header */}
                        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
                            <div>
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="relative">
                                        <div className="w-3 h-3 bg-indigo-400 rounded-full" />
                                        <div className="absolute inset-0 w-3 h-3 bg-indigo-400 rounded-full animate-ping opacity-50" />
                                    </div>
                                    <h2 className="text-2xl md:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-300 to-purple-400">
                                        Events Near You
                                    </h2>
                                </div>
                                <p className="text-white/50 text-sm ml-6">
                                    Showing events within {selectedRadius} km of your location
                                </p>
                            </div>

                            {/* Radius Selector Pills */}
                            <div className="flex gap-2 flex-wrap">
                                {RADIUS_OPTIONS.map((opt) => (
                                    <button
                                        key={opt.value}
                                        onClick={() => setSelectedRadius(opt.value)}
                                        className={`
                                            px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-300 border
                                            ${selectedRadius === opt.value
                                                ? "bg-indigo-500/30 border-indigo-400/50 text-indigo-200 shadow-[0_0_12px_rgba(129,140,248,0.3)]"
                                                : "bg-white/5 border-white/10 text-white/50 hover:bg-white/10 hover:text-white/80"
                                            }
                                        `}
                                    >
                                        {opt.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Map */}
                        <NearbyEventsMap
                            events={nearbyEvents.filter(e => e.latitude && e.longitude)}
                            center={userLocation}
                            radiusKm={selectedRadius}
                        />

                        {/* Nearby Events Horizontal Scroll */}
                        {isLoadingNearby ? (
                            <div className="flex justify-center py-12">
                                <motion.div
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                    className="w-8 h-8 border-3 border-indigo-400/20 border-t-indigo-400 rounded-full"
                                />
                            </div>
                        ) : nearbyEvents.length > 0 ? (
                            <div className="mt-6">
                                <div className="flex gap-6 overflow-x-auto pb-4 scrollbar-hide snap-x snap-mandatory">
                                    {nearbyEvents.map((event) => (
                                        <motion.div
                                            key={`nearby-${event.id}`}
                                            initial={{ opacity: 0, scale: 0.9 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            transition={{ duration: 0.4 }}
                                            className="min-w-[320px] max-w-[360px] flex-shrink-0 snap-start"
                                        >
                                            <EventCard event={event} className="h-full" />
                                        </motion.div>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="mt-6 text-center py-10 glass rounded-2xl"
                            >
                                <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-3 border border-white/10">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-white/40">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                                    </svg>
                                </div>
                                <h3 className="text-lg font-semibold text-white/70 mb-1">No events nearby</h3>
                                <p className="text-white/40 text-sm">Try expanding the radius to discover more events</p>
                            </motion.div>
                        )}

                        {/* Divider */}
                        <div className="mt-12 border-t border-white/10" />
                    </motion.section>
                )}
            </AnimatePresence>

            {/* Geolocation Loading/Prompt Banner */}
            <AnimatePresence>
                {geoStatus === "pending" && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mb-8 overflow-hidden"
                    >
                        <div className="glass rounded-2xl p-4 flex items-center gap-4 border border-indigo-500/20 bg-indigo-500/5">
                            <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                                className="w-6 h-6 border-2 border-indigo-400/30 border-t-indigo-400 rounded-full flex-shrink-0"
                            />
                            <p className="text-sm text-indigo-200/80">
                                Requesting your location to show nearby events...
                            </p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ============ ALL EVENTS SECTION ============ */}
            <div>
                <motion.h2
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="text-2xl md:text-3xl font-bold mb-6 text-white/90"
                >
                    {geoStatus === "granted" ? "All Events" : "Discover Events"}
                </motion.h2>

                {/* Filters & Search Section */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                    className="glass rounded-3xl p-6 mb-8 flex flex-col md:flex-row gap-4 items-center z-20 relative"
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
                        {isLoading ? (
                            <motion.div className="col-span-1 md:col-span-2 lg:col-span-3 flex justify-center py-24">
                                <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} className="w-12 h-12 border-4 border-white/20 border-t-white rounded-full" />
                            </motion.div>
                        ) : filteredEvents.length > 0 ? (
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
                                    }}
                                    className="mt-6 text-sm !py-2 !px-4"
                                >
                                    Clear Filters
                                </GlassButton>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>
            </div>
        </main>
    );
}
