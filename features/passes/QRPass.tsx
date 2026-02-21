"use client";

import { motion } from "framer-motion";
import GlassCard from "@/components/ui/GlassCard";
import GlassButton from "@/components/ui/GlassButton";
import { useRef, useState } from "react";
import QRCode from "react-qr-code";
import { toPng } from "html-to-image";
import jsPDF from "jspdf";
import Logo from "@/components/ui/Logo";

interface QRPassProps {
    eventTitle?: string;
    date?: string;
    time?: string;
    location?: string;
    seats?: string[];
    orderId?: string;
}

export default function QRPass({
    eventTitle = "Neon Nights Festival",
    date = "Oct 24, 2024",
    time = "9PM - 4AM",
    location = "The Warehouse, NY",
    seats = ["A1", "A2"],
    orderId = "TXN-8945-812C",
}: QRPassProps) {
    const passRef = useRef<HTMLDivElement>(null);
    const [isDownloading, setIsDownloading] = useState(false);

    const handleDownload = async () => {
        if (!passRef.current) return;
        setIsDownloading(true);

        try {
            // Wait a tick for UI to settle
            await new Promise(res => setTimeout(res, 100));

            const dataUrl = await toPng(passRef.current, {
                pixelRatio: 2, // High resolution
                backgroundColor: "#0a0f1c", // Match dark theme
            });

            const img = new Image();
            img.src = dataUrl;
            await new Promise((resolve) => { img.onload = resolve; });

            // Calculate dimensions to fit A4 neatly (optional, but good for tickets)
            const pdf = new jsPDF({
                orientation: "portrait",
                unit: "mm",
                format: "a4"
            });

            // A4 dimensions are 210x297mm
            const pdfWidth = 210;
            const pdfHeight = (img.naturalHeight * pdfWidth) / img.naturalWidth;

            // Add image horizontally centered, slightly down
            pdf.addImage(dataUrl, 'PNG', 0, 20, pdfWidth, pdfHeight);
            pdf.save(`${eventTitle.replace(/\s+/g, '_')}_Pass.pdf`);

        } catch (error) {
            console.error("Failed to generate PDF:", error);
            alert("Could not generate PDF. Please try again.");
        } finally {
            setIsDownloading(false);
        }
    };

    const handleAddToCalendar = () => {
        // Mock add to calendar action
        alert("Adding event to your calendar...");
    };

    return (
        <div className="flex justify-center w-full max-w-sm mx-auto perspective-1000">
            <motion.div
                initial={{ opacity: 0, y: 50, rotateX: 10 }}
                animate={{ opacity: 1, y: 0, rotateX: 0 }}
                transition={{ duration: 0.7, type: "spring", bounce: 0.4 }}
                className="w-full relative group"
                whileHover={{ scale: 1.02 }}
            >
                {/* Glow behind the card */}
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/40 to-blue-500/40 blur-[50px] -z-10 rounded-3xl group-hover:blur-[60px] transition-all duration-500" />

                <div ref={passRef}>
                    <GlassCard className="!p-0 overflow-hidden relative border-t-2 border-t-white/30 border-l-2 border-l-white/10 flex flex-col items-center">

                        {/* Header section */}
                        <div className="w-full bg-black/40 p-6 flex flex-col items-center border-b border-white/10 relative pt-8">
                            <Logo className="h-6 text-white mb-4 drop-shadow-[0_0_8px_rgba(168,85,247,0.5)]" />
                            <h2 className="text-2xl font-black text-center bg-clip-text text-transparent bg-gradient-to-r from-purple-200 to-white uppercase tracking-wider mb-1">
                                {eventTitle}
                            </h2>
                            <div className="text-white/60 text-sm tracking-widest uppercase">General Admission</div>

                            {/* Cutouts on the sides at the header/body boundary */}
                            <div className="absolute -bottom-3 -left-3 w-6 h-6 rounded-full bg-[#0a0f1c] border-t border-r border-white/10 shadow-[inset_-2px_2px_5px_rgba(255,255,255,0.05)] z-10" />
                            <div className="absolute -bottom-3 -right-3 w-6 h-6 rounded-full bg-[#0a0f1c] border-t border-l border-white/10 shadow-[inset_2px_2px_5px_rgba(255,255,255,0.05)] z-10" />
                        </div>

                        {/* Dotted line separation */}
                        <div className="w-[85%] border-b-2 border-dashed border-white/20 my-1 relative z-0" />

                        {/* QR Code Section */}
                        <div className="p-8 pb-4 flex flex-col items-center relative w-full">

                            {/* Authentic QR Container */}
                            <div className="relative w-48 h-48 bg-white rounded-xl shadow-[0_0_30px_rgba(255,255,255,0.2)] p-4 mb-6 mx-auto overflow-hidden group/qr flex justify-center items-center">

                                <QRCode
                                    value={`TIXX-PASS:${orderId}`}
                                    size={160}
                                    style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                                    viewBox={`0 0 160 160`}
                                />

                                {/* Animated Scan Shimmer Effect */}
                                <motion.div
                                    animate={{ top: ["-10%", "110%", "-10%"] }}
                                    transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                                    className="absolute left-0 right-0 h-[3px] bg-blue-400 shadow-[0_0_15px_#60a5fa,0_0_5px_#60a5fa] z-10 opacity-70 group-hover/qr:opacity-100 group-hover/qr:shadow-[0_0_20px_#60a5fa,0_0_10px_#60a5fa]"
                                />

                                {/* Internal glow overlay */}
                                <div className="absolute inset-0 bg-blue-400/5 mix-blend-overlay pointer-events-none" />
                            </div>

                            <div className="text-center mb-6 w-full">
                                <div className="text-white/40 text-xs tracking-[0.2em] mb-1">Seats</div>
                                <div className="text-xl font-bold font-mono tracking-widest">{seats.join(", ")}</div>
                            </div>

                            {/* Event Details Grid */}
                            <div className="w-full bg-white/5 rounded-xl p-4 border border-white/10 mb-6 drop-shadow-md">
                                <div className="grid grid-cols-2 gap-y-4 gap-x-2">
                                    <div>
                                        <div className="text-white/40 text-xs mb-1">Date</div>
                                        <div className="font-semibold text-sm truncate">{date}</div>
                                    </div>
                                    <div>
                                        <div className="text-white/40 text-xs mb-1">Time</div>
                                        <div className="font-semibold text-sm truncate">{time}</div>
                                    </div>
                                    <div className="col-span-2">
                                        <div className="text-white/40 text-xs mb-1">Location</div>
                                        <div className="font-semibold text-sm truncate">{location}</div>
                                    </div>
                                </div>
                            </div>

                            <div className="text-white/30 text-[10px] tracking-wider mb-2 font-mono">
                                Order: {orderId}
                            </div>
                        </div>

                    </GlassCard>
                </div>

                {/* Action Buttons underneath */}
                <div className="flex gap-3 mt-6">
                    <GlassButton
                        onClick={handleDownload}
                        disabled={isDownloading}
                        className="flex-1 !py-3 !rounded-xl !text-sm flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 disabled:opacity-50"
                    >
                        {isDownloading ? (
                            <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full" />
                        ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                            </svg>
                        )}
                        {isDownloading ? 'Saving...' : 'Save Pass'}
                    </GlassButton>
                    <GlassButton onClick={handleAddToCalendar} className="flex-1 !py-3 !rounded-xl !text-sm flex items-center justify-center gap-2 bg-purple-500/30 hover:bg-purple-500/50 border-purple-500/50">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 text-purple-200">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5m-9-6h.008v.008H12v-.008zM12 15h.008v.008H12V15zm0 2.25h.008v.008H12v-.008zM9.75 15h.008v.008H9.75V15zm0 2.25h.008v.008H9.75v-.008zM7.5 15h.008v.008H7.5V15zm0 2.25h.008v.008H7.5v-.008zm6.75-4.5h.008v.008h-.008v-.008zm0 2.25h.008v.008h-.008V15zm0 2.25h.008v.008h-.008v-.008zm2.25-4.5h.008v.008H16.5v-.008zm0 2.25h.008v.008H16.5V15z" />
                        </svg>
                        Calendar
                    </GlassButton>
                </div>

            </motion.div>
        </div>
    );
}
