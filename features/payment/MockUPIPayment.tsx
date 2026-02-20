"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import GlassCard from "@/components/ui/GlassCard";
import GlassButton from "@/components/ui/GlassButton";

interface MockUPIPaymentProps {
    amount: number;
    onSuccess: () => void;
    onCancel: () => void;
}

type PaymentState = "scanning" | "processing" | "success" | "failed";

export default function MockUPIPayment({ amount, onSuccess, onCancel }: MockUPIPaymentProps) {
    const [paymentState, setPaymentState] = useState<PaymentState>("scanning");

    useEffect(() => {
        let timer: NodeJS.Timeout;

        if (paymentState === "processing") {
            timer = setTimeout(() => {
                // 80% chance of success for mock purposes
                if (Math.random() < 0.8) {
                    setPaymentState("success");
                    setTimeout(onSuccess, 2000); // Trigger callback after showing success UI for 2s
                } else {
                    setPaymentState("failed");
                }
            }, 3000); // 3 seconds processing simulation
        }

        return () => {
            if (timer) clearTimeout(timer);
        };
    }, [paymentState, onSuccess]);

    const handleSimulateScan = () => {
        setPaymentState("processing");
    };

    const handleRetry = () => {
        setPaymentState("scanning");
    };

    return (
        <GlassCard className="!p-8 max-w-sm w-full mx-auto flex flex-col items-center justify-center min-h-[450px] relative overflow-hidden">

            {/* Background glow effects */}
            <div className={`absolute -top-24 -right-24 w-48 h-48 rounded-full blur-[80px] -z-10 transition-colors duration-1000 ${paymentState === 'success' ? 'bg-green-500/40' :
                    paymentState === 'failed' ? 'bg-red-500/40' :
                        'bg-purple-500/30'
                }`} />

            <AnimatePresence mode="wait">

                {/* State 1: Scanning QR Code */}
                {paymentState === "scanning" && (
                    <motion.div
                        key="scanning"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="flex flex-col items-center w-full"
                    >
                        <h3 className="text-xl font-bold mb-2 text-center">Scan to Pay</h3>
                        <p className="text-white/60 text-sm text-center mb-8">
                            Open your UPI App and scan the QR code to seamlessly check out
                        </p>

                        <div className="relative p-4 bg-white rounded-2xl mb-8 shadow-[0_0_30px_rgba(255,255,255,0.2)] group cursor-pointer" onClick={handleSimulateScan}>
                            {/* Mock QR Code Pattern built with pure CSS/SVG */}
                            <div className="w-48 h-48 bg-black rounded-lg p-2 grid grid-cols-6 grid-rows-6 gap-1 relative overflow-hidden">
                                {/* Scanner Grid Mock */}
                                {Array.from({ length: 36 }).map((_, i) => (
                                    <div key={i} className={`rounded-sm ${Math.random() > 0.3 ? 'bg-white' : 'bg-black'}`} />
                                ))}

                                {/* 3 Corner squares */}
                                <div className="absolute top-2 left-2 w-10 h-10 bg-white border-4 border-black p-1"><div className="w-full h-full bg-black"></div></div>
                                <div className="absolute top-2 right-2 w-10 h-10 bg-white border-4 border-black p-1"><div className="w-full h-full bg-black"></div></div>
                                <div className="absolute bottom-2 left-2 w-10 h-10 bg-white border-4 border-black p-1"><div className="w-full h-full bg-black"></div></div>

                                {/* Scanner overlay line animation */}
                                <motion.div
                                    className="absolute left-0 right-0 h-1 bg-green-400 shadow-[0_0_10px_#4ade80]"
                                    animate={{ top: ["0%", "100%", "0%"] }}
                                    transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                                />
                            </div>

                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/60 rounded-2xl backdrop-blur-sm pointer-events-none">
                                <span className="font-bold text-white text-sm bg-black/50 px-3 py-1.5 rounded-full border border-white/20">Click to mock scan</span>
                            </div>
                        </div>

                        <div className="flex items-center justify-between w-full p-4 bg-white/5 border border-white/10 rounded-xl mb-6">
                            <span className="text-white/70">Amount Due</span>
                            <span className="font-bold text-xl">${amount.toFixed(2)}</span>
                        </div>

                        <div className="w-full flex gap-3">
                            <GlassButton onClick={onCancel} className="flex-1 !py-3 !bg-white/5 text-white/70 border-white/10 hover:!bg-white/10">
                                Cancel
                            </GlassButton>
                            <GlassButton onClick={handleSimulateScan} className="flex-1 !py-3 bg-purple-500/20 border-purple-500/40 hover:bg-purple-500/40">
                                Simulate
                            </GlassButton>
                        </div>
                    </motion.div>
                )}

                {/* State 2: Processing Payment */}
                {paymentState === "processing" && (
                    <motion.div
                        key="processing"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 1.1 }}
                        className="flex flex-col items-center justify-center flex-1 w-full"
                    >
                        <div className="relative mb-8">
                            <div className="w-24 h-24 rounded-full border-4 border-white/10 flex items-center justify-center">
                                <motion.div
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                                    className="absolute inset-0 rounded-full border-4 border-transparent border-t-purple-400 border-r-purple-400"
                                />
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-10 h-10 text-purple-400">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.332A48.36 48.36 0 0012 9.75c-2.551 0-5.056.2-7.5.582V21M3 21h18M12 6.75h.008v.008H12V6.75z" />
                                </svg>
                            </div>
                            <motion.div
                                animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
                                transition={{ duration: 2, repeat: Infinity }}
                                className="absolute inset-0 bg-purple-500/20 rounded-full blur-xl -z-10"
                            />
                        </div>
                        <h3 className="text-2xl font-bold mb-2 text-center animate-pulse">Processing...</h3>
                        <p className="text-white/60 text-center">Please do not close this window</p>
                    </motion.div>
                )}

                {/* State 3: Payment Success! */}
                {paymentState === "success" && (
                    <motion.div
                        key="success"
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ type: "spring", bounce: 0.5 }}
                        className="flex flex-col items-center justify-center flex-1 w-full"
                    >
                        <div className="w-24 h-24 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6 border border-green-500/40 shadow-[0_0_40px_rgba(34,197,94,0.4)] relative">
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: [0, 1.2, 1] }}
                                transition={{ duration: 0.5, delay: 0.2 }}
                                className="absolute inset-0 rounded-full border-2 border-green-400"
                            />
                            <motion.svg
                                initial={{ pathLength: 0 }}
                                animate={{ pathLength: 1 }}
                                transition={{ duration: 0.5, delay: 0.3 }}
                                className="w-12 h-12 text-green-400"
                                fill="none"
                                viewBox="0 0 24 24"
                                strokeWidth={3}
                                stroke="currentColor"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </motion.svg>
                        </div>
                        <h3 className="text-3xl font-bold mb-2 text-center text-green-400 drop-shadow-[0_0_10px_rgba(34,197,94,0.3)]">Payment Successful!</h3>
                        <p className="text-white/80 text-center text-lg mb-1">Receipt sent to email</p>
                        <p className="text-white/50 text-center text-sm">Redirecting to tickets...</p>
                    </motion.div>
                )}

                {/* State 4: Payment Failed */}
                {paymentState === "failed" && (
                    <motion.div
                        key="failed"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex flex-col items-center justify-center flex-1 w-full"
                    >
                        <div className="w-24 h-24 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6 border border-red-500/40 shadow-[0_0_40px_rgba(239,68,68,0.4)]">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-12 h-12 text-red-500">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </div>
                        <h3 className="text-2xl font-bold mb-2 text-center text-red-400">Payment Failed</h3>
                        <p className="text-white/60 text-center mb-8">Bank server issue or insufficient funds.</p>

                        <GlassButton onClick={handleRetry} className="w-full !py-4 mb-3 !bg-white/10 border-white/20">
                            Try Again
                        </GlassButton>
                        <button onClick={onCancel} className="text-sm text-white/50 hover:text-white transition-colors py-2">
                            Cancel Order
                        </button>
                    </motion.div>
                )}

            </AnimatePresence>
        </GlassCard>
    );
}
