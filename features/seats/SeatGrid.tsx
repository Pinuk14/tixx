"use client";

import { useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSeatStore } from "@/store/useSeatStore";
import Seat from "@/features/seats/Seat";

interface SeatGridProps {
    rows?: string[];
    seatsPerRow?: number;
    basePrice?: number;
    isDynamicPricing?: boolean;
    dynamicPricingStrategy?: string | null;
    trueTotalSeats?: number;
    trueAvailableSeats?: number;
}

const DEFAULT_ROWS = ["A", "B", "C", "D", "E"];
const DEFAULT_SEATS_PER_ROW = 10;
const DEFAULT_BASE_PRICE = 49;

export default function SeatGrid({
    rows = DEFAULT_ROWS,
    seatsPerRow = DEFAULT_SEATS_PER_ROW,
    basePrice = DEFAULT_BASE_PRICE,
    isDynamicPricing = false,
    dynamicPricingStrategy = null,
    trueTotalSeats,
    trueAvailableSeats
}: SeatGridProps) {
    const {
        seats,
        selectedSeats,
        reservedSeats,
        availableCount,
        isSimulating,
        initializeSeats,
        selectSeat,
        deselectSeat,
        startSimulation,
        stopSimulation,
        simulateRandomReservation,
        simulateRandomRelease,
    } = useSeatStore();

    // Calculate optimal grid shape
    const calculatedSeatsPerRow = trueTotalSeats && trueTotalSeats > 100 ? 15 : seatsPerRow;
    const calculatedRowCount = trueTotalSeats ? Math.ceil(trueTotalSeats / calculatedSeatsPerRow) : rows.length;

    const dynamicRows = useMemo(() => {
        if (!trueTotalSeats) return rows; // Fallback to prop or default if no true size provided
        return Array.from({ length: Math.min(calculatedRowCount, 26) }, (_, i) => String.fromCharCode(65 + i));
    }, [trueTotalSeats, calculatedRowCount, rows]);

    // 1. Initialize Seats on mount or when props change
    useEffect(() => {
        initializeSeats(
            dynamicRows,
            calculatedSeatsPerRow,
            basePrice,
            isDynamicPricing,
            dynamicPricingStrategy,
            trueTotalSeats,
            trueAvailableSeats
        );
    }, [dynamicRows, calculatedSeatsPerRow, basePrice, isDynamicPricing, dynamicPricingStrategy, trueTotalSeats, trueAvailableSeats, initializeSeats]);

    // Clean up simulation on unmount
    useEffect(() => {
        return () => stopSimulation();
    }, [stopSimulation]);

    // Derive dynamic grid layout
    const grid = useMemo(() => {
        return dynamicRows.map((row) => {
            return seats
                .filter((s) => s.row === row)
                .sort((a, b) => a.number - b.number);
        });
    }, [seats, dynamicRows]);

    const handleSeatClick = (seatId: string) => {
        if (selectedSeats.includes(seatId)) {
            deselectSeat(seatId);
        } else {
            selectSeat(seatId); // store logic prevents preventing picking reserved seats
        }
    };

    // Live "Only X seats left!" animation threshold logic
    const isLowAvailability = availableCount > 0 && availableCount <= 10;

    if (seats.length === 0) {
        return (
            <div className="w-full h-64 flex items-center justify-center">
                <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="w-full flex justify-center">
            <div className="p-6 md:p-10 glass rounded-[2.5rem] relative overflow-hidden max-w-4xl w-full">
                <AnimatePresence>
                    {isLowAvailability && (
                        <motion.div
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20, filter: "blur(5px)" }}
                            className="absolute top-4 left-0 right-0 z-20 flex justify-center pointer-events-none"
                        >
                            <div className="bg-red-500/20 border border-red-500/50 text-red-200 px-4 py-1.5 rounded-full text-sm font-semibold backdrop-blur-md shadow-[0_0_15px_rgba(239,68,68,0.4)] animate-pulse">
                                Hurry! Only {availableCount} seats left
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Live Seat Counter */}
                <div className="absolute top-6 left-6 z-10 hidden sm:block">
                    <div className="text-white/40 text-xs font-semibold uppercase tracking-widest mb-1">
                        Live Capacity
                    </div>
                    <div className="text-2xl font-bold font-mono text-white/90">
                        {availableCount} <span className="text-sm text-white/40">Available</span>
                    </div>
                </div>

                {/* Stage Graphic */}
                <div className="w-full flex justify-center mb-16 mt-12 sm:mt-0 relative">
                    <div className="w-3/4 max-w-sm h-12 border-b-4 border-t-2 border-t-white/10 border-b-purple-500 rounded-t-[100px] bg-gradient-to-t from-purple-500/20 to-transparent flex items-end justify-center pb-2">
                        <span className="text-white/40 tracking-[0.2em] text-sm uppercase font-semibold">
                            Stage
                        </span>
                    </div>
                    <div className="absolute top-0 w-3/4 max-w-sm h-16 bg-purple-500/20 blur-[50px] -z-10 rounded-full" />
                </div>

                {/* Dynamic Seat Grid */}
                <div className="flex flex-col gap-4 md:gap-6 items-center">
                    {grid.map((rowSeats, rowIndex) => (
                        <div key={dynamicRows[rowIndex]} className="flex gap-2 md:gap-4 items-center">
                            {/* Row Label (Left) */}
                            <div className="w-6 text-center text-white/40 font-bold hidden md:block">
                                {dynamicRows[rowIndex]}
                            </div>

                            {/* Seats */}
                            <div className="flex gap-2 md:gap-3">
                                {rowSeats.map((seat) => {
                                    const isReserved = reservedSeats.includes(seat.id);
                                    const isSelected = selectedSeats.includes(seat.id);

                                    let status: "available" | "selected" | "reserved" = "available";
                                    if (isReserved) status = "reserved";
                                    else if (isSelected) status = "selected";

                                    return (
                                        <Seat
                                            key={seat.id}
                                            id={seat.id}
                                            number={seat.number}
                                            status={status}
                                            onClick={handleSeatClick}
                                        />
                                    );
                                })}
                            </div>

                            {/* Row Label (Right) */}
                            <div className="w-6 text-center text-white/40 font-bold hidden md:block">
                                {dynamicRows[rowIndex]}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Legend */}
                <div className="mt-16 flex justify-center gap-8 border-t border-white/10 pt-8">
                    <div className="flex items-center gap-3">
                        <div className="w-4 h-4 rounded-t-md rounded-b-sm bg-white/10 border border-white/20" />
                        <span className="text-sm text-white/60">Available</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="w-4 h-4 rounded-t-md rounded-b-sm bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.4)]" />
                        <span className="text-sm text-white/60">Selected</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="w-4 h-4 rounded-t-md rounded-b-sm bg-red-500/30 border border-red-500/30 cursor-not-allowed" />
                        <span className="text-sm text-white/60">Reserved</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
