"use client";

import { motion } from "framer-motion";
import GlassCard from "@/components/ui/GlassCard";
import Link from "next/link";
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import GlassButton from "@/components/ui/GlassButton";
import { Html5QrcodeScanner } from "html5-qrcode";

export default function QRScanHub() {
    const router = useRouter();
    const [isChecking, setIsChecking] = useState(true);
    const [scanResult, setScanResult] = useState<{ raw: string, isValid: boolean } | null>(null);
    const scannerRef = useRef<Html5QrcodeScanner | null>(null);

    // Provide the gateway protection to ensure only organizers access this
    useEffect(() => {
        const token = localStorage.getItem("tixx_token");
        if (!token) {
            router.push("/login");
        } else {
            try {
                const payload = JSON.parse(atob(token.split('.')[1]));
                if (payload.role === 'organizer') {
                    setIsChecking(false);
                } else {
                    router.push("/passes");
                }
            } catch (e) {
                router.push("/login");
            }
        }
    }, [router]);

    // Initialize Scanner when UI mounts
    useEffect(() => {
        if (isChecking) return;

        scannerRef.current = new Html5QrcodeScanner(
            "reader",
            { fps: 10, qrbox: { width: 250, height: 250 } },
            /* verbose= */ false
        );

        scannerRef.current.render(
            (decodedText) => {
                // Success Scan Validation
                if (decodedText.startsWith("TIXX-PASS:")) {
                    setScanResult({ raw: decodedText.replace("TIXX-PASS:", ""), isValid: true });
                } else {
                    setScanResult({ raw: decodedText, isValid: false });
                }
            },
            (errorMessage) => {
                // Ignored - runs on every frame where no QR is found
            }
        );

        return () => {
            if (scannerRef.current) {
                scannerRef.current.clear().catch(error => {
                    console.error("Failed to clear html5QrcodeScanner", error);
                });
            }
        };
    }, [isChecking]);

    if (isChecking) {
        return (
            <main className="min-h-[calc(100vh-80px)] flex items-center justify-center p-6">
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} className="w-10 h-10 border-4 border-white/30 border-t-purple-500 rounded-full" />
            </main>
        );
    }

    return (
        <main className="min-h-[calc(100vh-80px)] flex flex-col items-center py-10 px-6 relative max-w-4xl mx-auto">
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="w-full flex md:flex-row flex-col items-center md:items-end justify-between mb-8 gap-6"
            >
                <div>
                    <h1 className="text-4xl md:text-5xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-emerald-400">
                        Door Scanner
                    </h1>
                    <p className="text-lg text-white/70">Scan attendee passes to verify entry at the gates.</p>
                </div>
                <GlassButton className="!py-3 !px-6 !bg-white/10 hover:!bg-white/20">
                    <Link href="/dashboard" className="flex items-center gap-2">
                        &larr; Back to Dashboard
                    </Link>
                </GlassButton>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full flex flex-col lg:flex-row gap-8"
            >
                {/* Camera Viewport */}
                <GlassCard className="flex-1 p-6 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-emerald-500/10 pointer-events-none" />

                    <h3 className="text-xl font-bold mb-4 text-white/90">Camera View</h3>

                    <div className="w-full rounded-2xl overflow-hidden bg-black/50 border border-white/10">
                        <div id="reader" className="w-full h-full [&>div]:!border-none [&>div>button]:!bg-emerald-500 [&>div>button]:!text-white [&>div>button]:!rounded-lg [&>div>button]:!px-4 [&>div>button]:!py-2 [&>div>a]:!text-emerald-400 [&_select]:!bg-white/10 [&_select]:!text-white [&_select]:!rounded-md [&_select]:!border-white/20" />
                    </div>

                    <p className="text-sm text-white/50 text-center mt-4">
                        Position the QR code within the frame above. The scanner will automatically detect and verify the pass.
                    </p>
                </GlassCard>

                {/* Scan Results Panel */}
                <div className="w-full lg:w-80 flex flex-col gap-4">
                    <GlassCard className={`p-6 border-t-4 transition-colors duration-300 ${!scanResult ? 'border-t-white/10' : scanResult.isValid ? 'border-t-emerald-500 bg-emerald-500/10' : 'border-t-red-500 bg-red-500/10'}`}>
                        <h3 className="text-lg font-bold mb-4">Verification Result</h3>

                        {scanResult ? (
                            <div className="flex flex-col items-center text-center">
                                {scanResult.isValid ? (
                                    <>
                                        <div className="w-16 h-16 rounded-full bg-emerald-500/20 border-2 border-emerald-500 flex items-center justify-center mb-4">
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-8 h-8 text-emerald-400">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                                            </svg>
                                        </div>
                                        <h4 className="text-2xl font-black text-emerald-400 mb-1">Pass Valid</h4>
                                        <p className="text-emerald-200/80 font-mono text-sm mb-1 uppercase text-xs tracking-wider">Order ID</p>
                                    </>
                                ) : (
                                    <>
                                        <div className="w-16 h-16 rounded-full bg-red-500/20 border-2 border-red-500 flex items-center justify-center mb-4 animate-bounce">
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-8 h-8 text-red-400">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                        </div>
                                        <h4 className="text-2xl font-black text-red-400 mb-1">Invalid Pass</h4>
                                        <p className="text-red-200/80 font-mono text-sm mb-1 uppercase text-xs tracking-wider">Unrecognized Payload</p>
                                    </>
                                )}

                                <p className="text-white/80 font-mono text-sm mb-6 break-all bg-black/40 p-2 rounded w-full">
                                    {scanResult.raw}
                                </p>

                                <GlassButton
                                    onClick={() => setScanResult(null)}
                                    className={`w-full !py-3 ${scanResult.isValid ? '!bg-emerald-500/20 hover:!bg-emerald-500/40' : '!bg-red-500/20 hover:!bg-red-500/40'}`}
                                >
                                    Scan Next Pass
                                </GlassButton>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center text-center py-8 text-white/40">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor" className="w-16 h-16 mb-4">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 013.75 9.375v-4.5zM3.75 14.625c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5a1.125 1.125 0 01-1.125-1.125v-4.5zM13.5 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0113.5 9.375v-4.5z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 6.75h.75v.75h-.75v-.75zM6.75 16.5h.75v.75h-.75v-.75zM16.5 6.75h.75v.75h-.75v-.75zM13.5 13.5h.75v.75h-.75v-.75zM13.5 19.5h.75v.75h-.75v-.75zM19.5 13.5h.75v.75h-.75v-.75zM19.5 19.5h.75v.75h-.75v-.75zM16.5 16.5h.75v.75h-.75v-.75z" />
                                </svg>
                                <p>Awaiting scan...</p>
                            </div>
                        )}
                    </GlassCard>
                </div>
            </motion.div>
        </main>
    );
}
