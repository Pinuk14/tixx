"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import GlassCard from "@/components/ui/GlassCard";
import GlassInput from "@/components/ui/GlassInput";
import GlassButton from "@/components/ui/GlassButton";
import ErrorText from "@/components/ui/ErrorText";
import dynamic from 'next/dynamic';
import DatePicker from "react-datepicker";
import TimeKeeper from "react-timekeeper";
import "react-datepicker/dist/react-datepicker.css";
// Custom overrides for date picker glassmorphism
import "@/features/events/datepicker-custom.css";

const MapComponent = dynamic(() => import('@/features/events/MapComponent'), {
    ssr: false,
    loading: () => <div className="h-[300px] w-full rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white/50">Loading Map...</div>
});

export default function CreateEventPage() {
    const router = useRouter();

    const [formData, setFormData] = useState({
        title: "",
        category: "Conference",
        description: "",
        location_name: "",
        total_seats: "",
        upi_id: "",
        event_date: null as Date | null,
        end_date: null as Date | null,
        price_per_seat: "",
        currency: "INR"
    });

    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);

    const [locationConfig, setLocationConfig] = useState<{ lat: number | null, lng: number | null }>({ lat: null, lng: null });

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);

    // Timekeeper State
    const [showStartTimePicker, setShowStartTimePicker] = useState(false);
    const [showEndTimePicker, setShowEndTimePicker] = useState(false);
    const [startTime, setStartTime] = useState('10:00 am');
    const [endTime, setEndTime] = useState('02:00 pm');

    // Dynamic Pricing State
    const [isDynamicPricing, setIsDynamicPricing] = useState(false);
    const [dynamicStrategy, setDynamicStrategy] = useState("front_rows_extra");
    
    // Custom Form Fields State
    const [formFields, setFormFields] = useState({
        name: true,
        email: true,
        phone: false,
        college: false,
        age: false
    });

    // --- Seating Options State ---
    const [seatingType, setSeatingType] = useState<"general" | "matrix">("general");
    
    // Tiers mapping for both modes
    const [ticketTiers, setTicketTiers] = useState([
        { id: "tier_1", name: "General Admission", price: 50, capacity: 100, color: "#a855f7" }
    ]);
    
    // Matrix config (rows and tier mapping)
    const [matrixRows, setMatrixRows] = useState(10);
    const [matrixSeatsPerRow, setMatrixSeatsPerRow] = useState(10);
    const [rowTiers, setRowTiers] = useState<Record<string, string>>({}); // e.g: { "A": "tier_1", "B": "tier_2" }

    // Helper to generate typical A, B, C... AI, AJ row names
    const getRowLabel = (index: number) => {
        let label = "";
        let num = index;
        while (num >= 0) {
            label = String.fromCharCode(65 + (num % 26)) + label;
            num = Math.floor(num / 26) - 1;
        }
        return label;
    };

    // Initialize row tiers when matrix sizes change
    useState(() => {
        if (seatingType === "matrix") {
            const initialRowMap: Record<string, string> = {};
            for(let i=0; i<matrixRows; i++) {
                initialRowMap[getRowLabel(i)] = ticketTiers[0].id;
            }
            setRowTiers(initialRowMap);
        }
    });

    const addTier = () => {
        const newId = `tier_${Math.random().toString(36).substr(2, 9)}`;
        const colors = ["#ec4899", "#3b82f6", "#22c55e", "#eab308", "#ef4444", "#8b5cf6"];
        setTicketTiers([
            ...ticketTiers, 
            { 
                id: newId, 
                name: `Tier ${ticketTiers.length + 1}`, 
                price: 0, 
                capacity: 50, 
                color: colors[ticketTiers.length % colors.length] 
            }
        ]);
    };

    const removeTier = (id: string) => {
        if (ticketTiers.length <= 1) return;
        setTicketTiers(ticketTiers.filter(t => t.id !== id));
        // Clean up any row tiers pointing to removed tier
        const updatedRowTiers = { ...rowTiers };
        let changed = false;
        Object.keys(updatedRowTiers).forEach(rowLabel => {
            if (updatedRowTiers[rowLabel] === id) {
                updatedRowTiers[rowLabel] = ticketTiers[0].id;
                changed = true;
            }
        });
        if (changed) setRowTiers(updatedRowTiers);
    };

    const updateTier = (id: string, field: string, value: string | number) => {
        setTicketTiers(ticketTiers.map(t => 
            t.id === id ? { ...t, [field]: value } : t
        ));
    };

    const handleRowTierChange = (rowLabel: string, tierId: string) => {
        setRowTiers(prev => ({ ...prev, [rowLabel]: tierId }));
    };


    const combineDateAndTime = (date: Date | null, timeString: string) => {
        if (!date) return null;
        const match = timeString.match(/(\d+):(\d+)\s*(am|pm)/i);
        if (!match) return date;
        let [_, h, m, meridiem] = match;
        let hours = parseInt(h);
        let minutes = parseInt(m);
        if (meridiem.toLowerCase() === 'pm' && hours < 12) hours += 12;
        if (meridiem.toLowerCase() === 'am' && hours === 12) hours = 0;
        const newDate = new Date(date);
        newDate.setHours(hours, minutes, 0, 0);
        return newDate;
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { id, value } = e.target;
        setFormData(prev => ({ ...prev, [id]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");

        try {
            const token = localStorage.getItem("tixx_token");
            if (!token) {
                setError("You must be logged in to create an event.");
                setIsLoading(false);
                return;
            }

            if (!formData.event_date) {
                setError("Start Date & Time is required.");
                setIsLoading(false);
                return;
            }

            let uploadedImageUrl = null;
            if (imageFile) {
                const uploadData = new FormData();
                uploadData.append('file', imageFile);

                const uploadRes = await fetch('/api/upload', {
                    method: 'POST',
                    headers: { 'Authorization': `Bearer ${token}` },
                    body: uploadData
                });

                if (uploadRes.ok) {
                    const uploadResult = await uploadRes.json();
                    uploadedImageUrl = uploadResult.imageUrl;
                } else {
                    setError("Failed to upload image.");
                    setIsLoading(false);
                    return;
                }
            }

            const res = await fetch('/api/events/create', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    title: formData.title,
                    category: formData.category,
                    description: formData.description,
                    location_name: formData.location_name,
                    latitude: locationConfig.lat,
                    longitude: locationConfig.lng,
                    upi_id: formData.upi_id,
                    currency: formData.currency,
                    event_date: combineDateAndTime(formData.event_date, startTime)?.toISOString(),
                    end_date: formData.end_date ? combineDateAndTime(formData.end_date, endTime)?.toISOString() : undefined,
                    image_url: uploadedImageUrl,
                    form_fields: Object.keys(formFields).filter(k => formFields[k as keyof typeof formFields]),
                    // Seating Mode Configs
                    seating_type: seatingType,
                    ticket_tiers: ticketTiers,
                    seating_config: seatingType === "matrix" ? {
                        rows: matrixRows,
                        seatsPerRow: matrixSeatsPerRow,
                        rowTiers: rowTiers
                    } : null
                })
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.error || 'Failed to create event. Please try again.');
            } else {
                setSuccess(true);
                setTimeout(() => {
                    router.push('/dashboard');
                }, 2000);
            }
        } catch (err: any) {
            setError('A network error occurred connecting to the backend.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <main className="min-h-[calc(100vh-80px)] flex flex-col items-center p-6 mt-10 mb-20">
            <AnimatePresence mode="wait">
                {!success ? (
                    <motion.div
                        key="create-form"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 1.05, filter: "blur(10px)" }}
                        transition={{ duration: 0.5 }}
                        className="w-full max-w-2xl"
                    >
                        <GlassCard className="!p-8 md:!p-10">
                            <div className="text-center mb-8">
                                <h1 className="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-fuchsia-400 mb-2">Register an Event</h1>
                                <p className="text-white/60">Fill out the details below to create a new live event and sell tickets.</p>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                {/* Image Upload Zone */}
                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-white/80 ml-1">Event Banner Image (Optional)</label>
                                    <div className="w-full flex justify-center items-center h-48 rounded-2xl border-2 border-dashed border-white/20 hover:border-purple-500/50 hover:bg-white/5 transition-all text-center relative overflow-hidden group cursor-pointer">
                                        <input
                                            type="file"
                                            accept="image/*"
                                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                            onChange={(e) => {
                                                const file = e.target.files?.[0];
                                                if (file) {
                                                    setImageFile(file);
                                                    setImagePreview(URL.createObjectURL(file));
                                                }
                                            }}
                                        />
                                        {imagePreview ? (
                                            <img src={imagePreview} alt="Preview" className="object-cover w-full h-full opacity-80 group-hover:opacity-100 transition-opacity" />
                                        ) : (
                                            <div className="flex flex-col items-center justify-center p-6 text-white/50 group-hover:text-purple-300 transition-colors">
                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 mb-2">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                                                </svg>
                                                <span className="text-sm font-medium">Click or Drag to Upload Header Image</span>
                                                <span className="text-xs opacity-70 mt-1">PNG, JPG, default fallback if skipped</span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <GlassInput
                                        id="title"
                                        type="text"
                                        label="Event Title"
                                        placeholder="Neon Nights Festival"
                                        value={formData.title}
                                        onChange={handleChange}
                                        required
                                    />

                                    <div className="space-y-2">
                                        <label htmlFor="category" className="block text-sm font-medium text-white/80 ml-1">
                                            Event Category
                                        </label>
                                        <div className="relative">
                                            <select
                                                id="category"
                                                value={formData.category}
                                                // @ts-ignore
                                                onChange={handleChange}
                                                className="w-full bg-white/5 border border-white/10 text-white px-4 py-[14px] rounded-2xl outline-none backdrop-blur-md focus:bg-white/10 focus:border-purple-500/50 focus:shadow-[0_0_15px_rgba(168,85,247,0.15)] transition-all cursor-pointer appearance-none"
                                            >
                                                <option value="Conference" className="bg-slate-900 text-white">Conference</option>
                                                <option value="Networking" className="bg-slate-900 text-white">Networking</option>
                                                <option value="Exhibition" className="bg-slate-900 text-white">Exhibition</option>
                                                <option value="Hackathon" className="bg-slate-900 text-white">Hackathon</option>
                                                <option value="Showcase" className="bg-slate-900 text-white">Showcase</option>
                                                <option value="Music" className="bg-slate-900 text-white">Music</option>
                                            </select>
                                            <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-white/50">
                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                                                </svg>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-50">
                                    <div className="space-y-2 flex flex-col relative">
                                        <label className="text-sm font-medium text-white/80 ml-1">Start Date & Time</label>
                                        <div className="flex gap-2">
                                            <DatePicker
                                                selected={formData.event_date}
                                                onChange={(date: Date | null) => setFormData(prev => ({ ...prev, event_date: date }))}
                                                dateFormat="MMMM d, yyyy"
                                                placeholderText="Select start date"
                                                className="flex-1 w-full bg-white/5 border border-white/10 text-white px-4 py-3.5 rounded-2xl outline-none backdrop-blur-md focus:bg-white/10 focus:border-purple-500/50 transition-all cursor-pointer placeholder:text-white/30"
                                                required
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowStartTimePicker(!showStartTimePicker)}
                                                className="bg-white/5 border border-white/10 text-white px-4 py-3.5 rounded-2xl hover:bg-white/10 transition-all font-mono min-w-[120px]"
                                            >
                                                {startTime}
                                            </button>
                                        </div>
                                        {/* Start Time Picker Modal */}
                                        <AnimatePresence>
                                            {showStartTimePicker && (
                                                <motion.div
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    exit={{ opacity: 0, y: 10 }}
                                                    className="absolute top-full mt-2 right-0 z-[100] shadow-[0_10px_40px_rgba(0,0,0,0.8)] rounded-xl overflow-hidden"
                                                >
                                                    <div className="bg-[#1e1e2f] border border-white/10 p-2 relative">
                                                        <TimeKeeper
                                                            time={startTime}
                                                            onChange={(newTime) => setStartTime(newTime.formatted12)}
                                                            onDoneClick={() => setShowStartTimePicker(false)}
                                                            switchToMinuteOnHourSelect
                                                        />
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                    <div className="space-y-2 flex flex-col relative">
                                        <label className="text-sm font-medium text-white/80 ml-1">End Date & Time (Optional)</label>
                                        <div className="flex gap-2">
                                            <DatePicker
                                                selected={formData.end_date}
                                                onChange={(date: Date | null) => setFormData(prev => ({ ...prev, end_date: date }))}
                                                dateFormat="MMMM d, yyyy"
                                                placeholderText="Select end date"
                                                className="flex-1 w-full bg-white/5 border border-white/10 text-white px-4 py-3.5 rounded-2xl outline-none backdrop-blur-md focus:bg-white/10 focus:border-purple-500/50 transition-all cursor-pointer placeholder:text-white/30"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowEndTimePicker(!showEndTimePicker)}
                                                className="bg-white/5 border border-white/10 text-white px-4 py-3.5 rounded-2xl hover:bg-white/10 transition-all font-mono min-w-[120px]"
                                            >
                                                {endTime}
                                            </button>
                                        </div>
                                        {/* End Time Picker Modal */}
                                        <AnimatePresence>
                                            {showEndTimePicker && (
                                                <motion.div
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    exit={{ opacity: 0, y: 10 }}
                                                    className="absolute top-full mt-2 right-0 z-[100] shadow-[0_10px_40px_rgba(0,0,0,0.8)] rounded-xl overflow-hidden"
                                                >
                                                    <div className="bg-[#1e1e2f] border border-white/10 p-2 relative">
                                                        <TimeKeeper
                                                            time={endTime}
                                                            onChange={(newTime) => setEndTime(newTime.formatted12)}
                                                            onDoneClick={() => setShowEndTimePicker(false)}
                                                            switchToMinuteOnHourSelect
                                                        />
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label htmlFor="description" className="block text-sm font-medium text-white/80 ml-1">
                                        Description (Optional)
                                    </label>
                                    <textarea
                                        id="description"
                                        value={formData.description}
                                        onChange={handleChange}
                                        placeholder="Tell people what your event is about..."
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:border-purple-500/50 focus:bg-white/10 transition-all resize-none h-32"
                                    />
                                </div>

                                <GlassInput
                                    id="location_name"
                                    type="text"
                                    label="Location Name"
                                    placeholder="The Warehouse, San Francisco, CA"
                                    value={formData.location_name}
                                    onChange={handleChange}
                                    required
                                />

                                <div className="space-y-2 relative z-0">
                                    <label className="block text-sm font-medium text-white/80 ml-1">Pin Exact Location on Map</label>
                                    <p className="text-xs text-white/50 ml-1 mb-2">Click on the map to drop a pin for precise coordinates</p>
                                    <MapComponent
                                        searchAddress={formData.location_name}
                                        onLocationSelect={(lat, lng, address) => {
                                            setLocationConfig({ lat, lng });
                                            if (address) {
                                                setFormData(prev => ({ ...prev, location_name: address }));
                                            }
                                        }}
                                    />
                                    {locationConfig.lat && (
                                        <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full border border-white/10 text-xs text-green-400 font-mono">
                                            {locationConfig.lat.toFixed(4)}, {locationConfig.lng?.toFixed(4)}
                                        </div>
                                    )}
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="block text-sm font-medium text-white/80 ml-1">Currency</label>
                                        <select
                                            id="currency"
                                            value={formData.currency}
                                            // @ts-ignore
                                            onChange={handleChange}
                                            className="w-full bg-white/5 border border-white/10 text-white px-4 py-[14px] rounded-2xl outline-none backdrop-blur-md focus:bg-white/10 focus:border-purple-500/50 hover:bg-white/10 transition-all cursor-pointer appearance-none"
                                        >
                                            <option value="INR" className="bg-slate-900">INR (₹)</option>
                                            <option value="USD" className="bg-slate-900">USD ($)</option>
                                            <option value="EUR" className="bg-slate-900">EUR (€)</option>
                                        </select>
                                    </div>
                                    <GlassInput
                                        id="upi_id"
                                        type="text"
                                        label="Organizer UPI ID (For Payments)"
                                        placeholder="organizer@bank"
                                        value={formData.upi_id}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>

                                {/* --- Seating System Configuration --- */}
                                <div className="p-6 border border-white/10 bg-black/20 rounded-3xl space-y-6">
                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-6">
                                        <div>
                                            <h3 className="text-xl font-bold text-white mb-1">Seating Configuration</h3>
                                            <p className="text-sm text-white/50">Choose how tickets and sections are mapped out for your attendees.</p>
                                        </div>
                                        <div className="flex bg-white/5 p-1 rounded-xl border border-white/10 w-fit">
                                            <button
                                                type="button"
                                                onClick={() => setSeatingType("general")}
                                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${seatingType === "general" ? "bg-purple-500 text-white shadow-lg" : "text-white/50 hover:text-white"}`}
                                            >
                                                Abstract Sections
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setSeatingType("matrix");
                                                    // Sync matrix rows if turning on
                                                    const initialRowMap: Record<string, string> = {};
                                                    for(let i=0; i<matrixRows; i++) {
                                                        initialRowMap[getRowLabel(i)] = rowTiers[getRowLabel(i)] || ticketTiers[0].id;
                                                    }
                                                    setRowTiers(initialRowMap);
                                                }}
                                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${seatingType === "matrix" ? "bg-blue-500 text-white shadow-lg" : "text-white/50 hover:text-white"}`}
                                            >
                                                2D Matrix Grid
                                            </button>
                                        </div>
                                    </div>

                                    {/* Abstract / General Admission Mode */}
                                    {seatingType === "general" && (
                                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                                            <div className="flex items-center justify-between mb-2">
                                                <h4 className="text-white/80 font-medium text-sm ml-1">Ticket Sections / Tiers</h4>
                                                <button type="button" onClick={addTier} className="text-xs text-purple-400 hover:text-purple-300 font-medium">
                                                    + Add Section
                                                </button>
                                            </div>
                                            
                                            <div className="space-y-3">
                                                {ticketTiers.map((tier, idx) => (
                                                    <div key={tier.id} className="flex flex-col sm:flex-row gap-3 p-3 bg-white/5 border border-white/10 rounded-2xl items-center relative group">
                                                        <div className="w-4 h-4 rounded-full flex-shrink-0" style={{ backgroundColor: tier.color }} />
                                                        <input 
                                                            type="text" 
                                                            value={tier.name}
                                                            onChange={(e) => updateTier(tier.id, "name", e.target.value)}
                                                            placeholder="Section Name (e.g., VIP, General)" 
                                                            className="flex-1 bg-transparent border-none text-white focus:ring-0 text-sm outline-none px-2"
                                                        />
                                                        <div className="hidden sm:block w-[1px] h-6 bg-white/10" />
                                                        <div className="flex gap-2 w-full sm:w-auto">
                                                            <div className="relative">
                                                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/50 text-xs">Capacity</span>
                                                                <input 
                                                                    type="number" 
                                                                    min="1"
                                                                    value={tier.capacity}
                                                                    onChange={(e) => updateTier(tier.id, "capacity", parseInt(e.target.value) || 0)}
                                                                    className="w-full sm:w-28 bg-white/5 border border-white/10 rounded-xl py-2 pl-16 pr-3 text-white text-sm outline-none focus:border-purple-500"
                                                                />
                                                            </div>
                                                            <div className="relative">
                                                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/50 text-xs font-mono">{formData.currency}</span>
                                                                <input 
                                                                    type="number" 
                                                                    min="0"
                                                                    step="0.01"
                                                                    value={tier.price}
                                                                    onChange={(e) => updateTier(tier.id, "price", parseFloat(e.target.value) || 0)}
                                                                    className="w-full sm:w-28 bg-white/5 border border-white/10 rounded-xl py-2 pl-12 pr-3 text-white text-sm outline-none focus:border-purple-500"
                                                                />
                                                            </div>
                                                        </div>
                                                        {ticketTiers.length > 1 && (
                                                            <button 
                                                                type="button" 
                                                                onClick={() => removeTier(tier.id)}
                                                                className="text-red-400/50 hover:text-red-400 transition-colors absolute sm:static -top-2 -right-2 sm:translate-none p-1 bg-black/50 sm:bg-transparent rounded-full"
                                                            >
                                                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5"><path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" /></svg>
                                                            </button>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                            <p className="text-xs text-white/40 italic ml-1 mt-2">
                                                Total abstract capacity: {ticketTiers.reduce((acc, curr) => acc + (curr.capacity || 0), 0)}
                                            </p>
                                        </motion.div>
                                    )}

                                    {/* Assigned Seating Matrix Mode */}
                                    {seatingType === "matrix" && (
                                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                                            <div className="grid grid-cols-2 gap-4 bg-blue-500/5 p-4 rounded-2xl border border-blue-500/20">
                                                <div>
                                                    <label className="block text-xs text-blue-300/80 mb-1 ml-1">Grid Rows</label>
                                                    <input 
                                                        type="number" 
                                                        min="1" max="100"
                                                        value={matrixRows}
                                                        onChange={(e) => {
                                                            const val = parseInt(e.target.value) || 1;
                                                            setMatrixRows(val);
                                                            // Sync row map
                                                            const newMap = { ...rowTiers };
                                                            for(let i=0; i<val; i++) {
                                                                const label = getRowLabel(i);
                                                                if (!newMap[label]) newMap[label] = ticketTiers[0].id;
                                                            }
                                                            setRowTiers(newMap);
                                                        }}
                                                        className="w-full bg-black/40 border border-blue-500/30 rounded-xl py-2 px-3 text-white text-sm outline-none focus:border-blue-400"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-xs text-blue-300/80 mb-1 ml-1">Seats Per Row</label>
                                                    <input 
                                                        type="number" 
                                                        min="1" max="100"
                                                        value={matrixSeatsPerRow}
                                                        onChange={(e) => setMatrixSeatsPerRow(parseInt(e.target.value) || 1)}
                                                        className="w-full bg-black/40 border border-blue-500/30 rounded-xl py-2 px-3 text-white text-sm outline-none focus:border-blue-400"
                                                    />
                                                </div>
                                                <p className="text-xs text-blue-200/50 col-span-2 italic">
                                                    Matrix generates {matrixRows * matrixSeatsPerRow} total precise seats.
                                                </p>
                                            </div>

                                            <div className="space-y-4">
                                                <div className="flex items-center justify-between mb-2">
                                                    <div>
                                                        <h4 className="text-white/80 font-medium text-sm ml-1">Pricing Tiers</h4>
                                                        <p className="text-xs text-white/40 ml-1">Create tiers to map to specific rows.</p>
                                                    </div>
                                                    <button type="button" onClick={addTier} className="text-xs text-blue-400 hover:text-blue-300 font-medium">
                                                        + Add Tier
                                                    </button>
                                                </div>
                                                
                                                <div className="space-y-2">
                                                    {ticketTiers.map((tier) => (
                                                        <div key={tier.id} className="flex items-center gap-3 p-2 bg-white/5 border border-white/10 rounded-xl">
                                                            <div className="w-3 h-3 rounded-full ml-2 flex-shrink-0" style={{ backgroundColor: tier.color }} />
                                                            <input 
                                                                type="text" 
                                                                value={tier.name}
                                                                onChange={(e) => updateTier(tier.id, "name", e.target.value)}
                                                                placeholder="Tier Name" 
                                                                className="flex-1 min-w-[100px] bg-transparent border-none text-white focus:ring-0 text-sm outline-none font-medium"
                                                            />
                                                            <div className="flex bg-black/40 border border-white/10 rounded-lg overflow-hidden shrink-0">
                                                                <span className="px-2 py-1.5 text-white/40 text-xs border-r border-white/10 bg-white/5">{formData.currency}</span>
                                                                <input 
                                                                    type="number" 
                                                                    min="0" step="0.01"
                                                                    value={tier.price}
                                                                    onChange={(e) => updateTier(tier.id, "price", parseFloat(e.target.value) || 0)}
                                                                    className="w-20 px-2 py-1 bg-transparent border-none text-white focus:ring-0 text-sm outline-none"
                                                                />
                                                            </div>
                                                            {ticketTiers.length > 1 && (
                                                                <button type="button" onClick={() => removeTier(tier.id)} className="pr-2 text-white/20 hover:text-red-400">
                                                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4"><path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" /></svg>
                                                                </button>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            <div className="pt-4 border-t border-white/10">
                                                <h4 className="text-white/80 font-medium text-sm ml-1 mb-3">Map Rows to Tiers</h4>
                                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                                                    {Array.from({ length: matrixRows }).map((_, i) => {
                                                        const rowLabel = getRowLabel(i);
                                                        const currentTierId = rowTiers[rowLabel] || ticketTiers[0].id;
                                                        const activeTier = ticketTiers.find(t => t.id === currentTierId);
                                                        
                                                        return (
                                                            <div key={rowLabel} className="bg-white/5 border border-white/10 rounded-lg flex items-stretch overflow-hidden group">
                                                                <div 
                                                                    className="w-1.5 shrink-0" 
                                                                    style={{ backgroundColor: activeTier?.color || '#fff' }} 
                                                                />
                                                                <div className="flex-1 flex items-center justify-between px-2 py-1.5">
                                                                    <span className="text-xs font-bold text-white/80 w-6">Row {rowLabel}</span>
                                                                    <select 
                                                                        value={currentTierId}
                                                                        onChange={(e) => handleRowTierChange(rowLabel, e.target.value)}
                                                                        className="w-full bg-transparent text-xs text-white/60 focus:text-white outline-none appearance-none cursor-pointer pl-2"
                                                                        style={{ direction: 'rtl' }}
                                                                    >
                                                                        {ticketTiers.map(t => (
                                                                            <option key={t.id} value={t.id} className="bg-slate-900 text-left">{t.name}</option>
                                                                        ))}
                                                                    </select>
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}
                                </div>

                                {/* Custom Form Fields Sector */}
                                <div className="p-5 border border-blue-500/30 bg-blue-500/10 rounded-2xl space-y-4">
                                    <div>
                                        <h3 className="font-bold text-white mb-1">Required Attendee Info</h3>
                                        <p className="text-sm text-white/60">Select what details attendees must provide when booking seats.</p>
                                    </div>
                                    <div className="flex flex-wrap gap-4 mt-2">
                                        <label className="flex items-center gap-2 cursor-not-allowed opacity-70">
                                            <input type="checkbox" checked={true} disabled className="rounded bg-black/40 border-white/20 text-blue-500 focus:ring-blue-500 focus:ring-offset-gray-900" />
                                            <span className="text-sm text-white">Name</span>
                                        </label>
                                        <label className="flex items-center gap-2 cursor-not-allowed opacity-70">
                                            <input type="checkbox" checked={true} disabled className="rounded bg-black/40 border-white/20 text-blue-500 focus:ring-blue-500 focus:ring-offset-gray-900" />
                                            <span className="text-sm text-white">Email</span>
                                        </label>
                                        <label className="flex items-center gap-2 cursor-pointer group">
                                            <input type="checkbox" checked={formFields.phone} onChange={(e) => setFormFields(f => ({ ...f, phone: e.target.checked }))} className="rounded bg-black/40 border-white/20 text-blue-500 focus:ring-blue-500 focus:ring-offset-gray-900" />
                                            <span className="text-sm text-white/80 group-hover:text-white transition-colors">Phone Number</span>
                                        </label>
                                        <label className="flex items-center gap-2 cursor-pointer group">
                                            <input type="checkbox" checked={formFields.college} onChange={(e) => setFormFields(f => ({ ...f, college: e.target.checked }))} className="rounded bg-black/40 border-white/20 text-blue-500 focus:ring-blue-500 focus:ring-offset-gray-900" />
                                            <span className="text-sm text-white/80 group-hover:text-white transition-colors">College / Company</span>
                                        </label>
                                        <label className="flex items-center gap-2 cursor-pointer group">
                                            <input type="checkbox" checked={formFields.age} onChange={(e) => setFormFields(f => ({ ...f, age: e.target.checked }))} className="rounded bg-black/40 border-white/20 text-blue-500 focus:ring-blue-500 focus:ring-offset-gray-900" />
                                            <span className="text-sm text-white/80 group-hover:text-white transition-colors">Age</span>
                                        </label>
                                    </div>
                                </div>

                                {/* Animated Error Banner */}
                                <AnimatePresence>
                                    {error && (
                                        <motion.div
                                            initial={{ opacity: 0, y: -10, height: 0 }}
                                            animate={{ opacity: 1, y: 0, height: "auto" }}
                                            exit={{ opacity: 0, y: -10, height: 0 }}
                                            className="overflow-hidden"
                                        >
                                            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl mt-2 backdrop-blur-md">
                                                <ErrorText error={error} className="!mt-0" />
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                <GlassButton
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full flex justify-center mt-8 !bg-purple-500/30 hover:!bg-purple-500/50 border-purple-500/40 disabled:opacity-50 disabled:cursor-not-allowed !py-4"
                                >
                                    {isLoading ? (
                                        <motion.div
                                            animate={{ rotate: 360 }}
                                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                            className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full"
                                        />
                                    ) : (
                                        "Launch Event"
                                    )}
                                </GlassButton>
                            </form>
                        </GlassCard>
                    </motion.div>
                ) : (
                    <motion.div
                        key="success-state"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ type: "spring", bounce: 0.5 }}
                        className="text-center mt-20"
                    >
                        <div className="w-24 h-24 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6 border border-green-500/30 backdrop-blur-xl shadow-[0_0_30px_rgba(34,197,94,0.3)]">
                            <motion.svg
                                initial={{ pathLength: 0 }}
                                animate={{ pathLength: 1 }}
                                transition={{ duration: 0.5, delay: 0.2 }}
                                className="w-12 h-12 text-green-400"
                                fill="none"
                                viewBox="0 0 24 24"
                                strokeWidth={3}
                                stroke="currentColor"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </motion.svg>
                        </div>
                        <h2 className="text-3xl font-bold mb-2 text-white">Event Created Successfully!</h2>
                        <p className="text-white/70">Redirecting you back to your dashboard...</p>
                    </motion.div>
                )}
            </AnimatePresence>
        </main>
    );
}
