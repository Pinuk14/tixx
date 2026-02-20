"use client";

import { useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSeatStore } from "@/store/useSeatStore";
import GlassCard from "@/components/ui/GlassCard";
import GlassButton from "@/components/ui/GlassButton";

interface OrderSummaryProps {
    onProceedToPayment: () => void;
    className?: string;
}

export default function OrderSummary({ onProceedToPayment, className = "" }: OrderSummaryProps) {
    const { seats, selectedSeats } = useSeatStore();

    const selectedSeatDetails = useMemo(() => {
        return seats.filter(s => selectedSeats.includes(s.id));
    }, [seats, selectedSeats]);

    const totalPrice = useMemo(() => {
        return selectedSeatDetails.reduce((sum, seat) => sum + seat.price, 0);
    }, [selectedSeatDetails]);

    // Framer motion variants
    const listVariants = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, x: -20 },
        show: { opacity: 1, x: 0 },
        exit: { opacity: 0, x: 20, transition: { duration: 0.2 } }
    };

    if (selectedSeats.length === 0) {
        return (
            <GlassCard className={`!p-6 flex flex-col items-center justify-center text-center min-h-[300px] ${className}`}>
                <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-white/40">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 6v.75m0 3v.75m0 3v.75m0 3V18m-9-5.25h5.25M7.5 15h3M3.375 5.25c-.621 0-1.125.504-1.125 1.125v3.026a2.999 2.999 0 010 5.198v3.026c0 .621.504 1.125 1.125 1.125h17.25c.621 0 1.125-.504 1.125-1.125v-3.026a2.999 2.999 0 010-5.198V6.375c0-.621-.504-1.125-1.125-1.125H3.375z" />
                    </svg>
                </div>
                <h3 className="text-xl font-bold mb-2">No Seats Selected</h3>
                <p className="text-white/50 text-sm">Select seats from the interactive map to start your order.</p>
            </GlassCard>
        );
    }

    return (
        <GlassCard className={`!p-6 flex flex-col h-full ${className}`}>
            <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6 text-purple-400">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
                </svg>
                Order Summary
            </h3>

            <div className="flex-1 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent mb-6 max-h-[300px]">
                <motion.ul
                    variants={listVariants}
                    initial="hidden"
                    animate="show"
                    className="space-y-3"
                >
                    <AnimatePresence>
                        {selectedSeatDetails.map((seat) => (
                            <motion.li
                                key={seat.id}
                                variants={itemVariants}
                                layout
                                className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-green-500/20 text-green-400 font-bold border border-green-500/30">
                                        {seat.id}
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-white/90">Row {seat.row}</p>
                                        <p className="text-xs text-white/50">Seat {seat.number}</p>
                                    </div>
                                </div>
                                <div className="font-semibold">${seat.price}</div>
                            </motion.li>
                        ))}
                    </AnimatePresence>
                </motion.ul>
            </div>

            <div className="pt-6 border-t border-white/10 mt-auto">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-white/60">Subtotal ({selectedSeats.length} seats)</span>
                    <span className="font-medium">${totalPrice}</span>
                </div>
                <div className="flex items-center justify-between mb-4 text-sm">
                    <span className="text-white/60">Processing Fee</span>
                    <span className="font-medium">${(selectedSeats.length * 2.50).toFixed(2)}</span>
                </div>

                <div className="flex items-center justify-between mb-8 p-4 bg-black/20 rounded-2xl border border-white/5">
                    <span className="font-bold text-lg">Total</span>
                    {/* Animated Total Price */}
                    <motion.div
                        key={totalPrice}
                        initial={{ y: -10, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-blue-400"
                    >
                        ${(totalPrice + (selectedSeats.length * 2.50)).toFixed(2)}
                    </motion.div>
                </div>

                <GlassButton
                    onClick={onProceedToPayment}
                    className="w-full !py-4 text-lg font-bold bg-green-500/20 hover:bg-green-500/30 border-green-500/40 text-green-100"
                >
                    Checkout
                </GlassButton>
            </div>
        </GlassCard>
    );
}
