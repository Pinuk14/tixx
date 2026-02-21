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
                    total_seats: formData.total_seats ? parseInt(formData.total_seats) : undefined,
                    upi_id: formData.upi_id,
                    price_per_seat: formData.price_per_seat ? parseFloat(formData.price_per_seat) : undefined,
                    currency: formData.currency,
                    event_date: combineDateAndTime(formData.event_date, startTime)?.toISOString(),
                    end_date: formData.end_date ? combineDateAndTime(formData.end_date, endTime)?.toISOString() : undefined,
                    image_url: uploadedImageUrl,
                    is_dynamic_pricing: isDynamicPricing,
                    dynamic_pricing_strategy: isDynamicPricing ? dynamicStrategy : null
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

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <GlassInput
                                        id="total_seats"
                                        type="number"
                                        label="Total Seats (Optional)"
                                        placeholder="100"
                                        value={formData.total_seats}
                                        onChange={handleChange}
                                        min="1"
                                    />
                                    <div className="space-y-2">
                                        <label className="block text-sm font-medium text-white/80 ml-1">Entry Fee</label>
                                        <div className="flex gap-2">
                                            <select
                                                id="currency"
                                                value={formData.currency}
                                                // @ts-ignore
                                                onChange={handleChange}
                                                className="bg-white/5 border border-white/10 text-white px-3 py-[14px] rounded-2xl outline-none backdrop-blur-md focus:bg-white/10 focus:border-purple-500/50 transition-all cursor-pointer appearance-none w-24 text-center"
                                            >
                                                <option value="INR" className="bg-slate-900">INR (₹)</option>
                                                <option value="USD" className="bg-slate-900">USD ($)</option>
                                                <option value="EUR" className="bg-slate-900">EUR (€)</option>
                                            </select>
                                            <input
                                                id="price_per_seat"
                                                type="number"
                                                placeholder="0.00 (Free)"
                                                value={formData.price_per_seat}
                                                onChange={handleChange}
                                                min="0"
                                                step="0.01"
                                                className="flex-1 w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-[14px] text-white placeholder:text-white/30 focus:outline-none focus:border-purple-500/50 focus:bg-white/10 transition-all"
                                            />
                                        </div>
                                    </div>
                                    <GlassInput
                                        id="upi_id"
                                        type="text"
                                        label="Organizer UPI ID"
                                        placeholder="organizer@bank"
                                        value={formData.upi_id}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>

                                {/* Dynamic Pricing Sector */}
                                <div className="p-5 border border-purple-500/30 bg-purple-500/10 rounded-2xl space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h3 className="font-bold text-white mb-1">Enable Dynamic Seat Pricing</h3>
                                            <p className="text-sm text-white/60">Allow the system to automatically adjust individual seat prices based on their position.</p>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input type="checkbox" className="sr-only peer" checked={isDynamicPricing} onChange={() => setIsDynamicPricing(!isDynamicPricing)} />
                                            <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-500 shadow-[inset_0_2px_4px_rgba(0,0,0,0.4)]"></div>
                                        </label>
                                    </div>

                                    <AnimatePresence>
                                        {isDynamicPricing && (
                                            <motion.div
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: "auto", opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                className="overflow-hidden"
                                            >
                                                <div className="pt-4 border-t border-purple-500/20">
                                                    <label className="block text-sm font-medium text-white/80 ml-1 mb-2">Pricing Strategy Focus</label>
                                                    <div className="relative">
                                                        <select
                                                            value={dynamicStrategy}
                                                            onChange={(e) => setDynamicStrategy(e.target.value)}
                                                            className="w-full bg-black/40 border border-purple-500/30 text-white px-4 py-[14px] rounded-2xl outline-none backdrop-blur-md focus:bg-white/10 focus:border-purple-500 transition-all cursor-pointer appearance-none"
                                                        >
                                                            <option value="front_rows_extra" className="bg-slate-900">Front Rows Cost Extra (VIP Experience)</option>
                                                            <option value="center_rows_extra" className="bg-slate-900">Center Rows Cost Extra (Best Acoustics/View)</option>
                                                            <option value="back_rows_extra" className="bg-slate-900">Back Rows Cost Extra (Private/Balcony)</option>
                                                        </select>
                                                        <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-white/50">
                                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                                                                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                                                            </svg>
                                                        </div>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
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
