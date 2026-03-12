"use client";

import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSeatStore } from "@/store/useSeatStore";
import Seat from "@/features/seats/Seat";

interface TicketTier {
    id: string;
    name: string;
    price: number;
    capacity: number;
    color: string;
}

interface SeatGridProps {
    rows?: string[];
    seatsPerRow?: number;
    basePrice?: number;
    isDynamicPricing?: boolean;
    dynamicPricingStrategy?: string | null;
    trueTotalSeats?: number;
    trueAvailableSeats?: number;
    // New seating system props
    seatingType?: "general" | "matrix";
    ticketTiers?: TicketTier[];
    seatingConfig?: any;
    currency?: string;
}

const DEFAULT_ROWS = ["A", "B", "C", "D", "E"];
const DEFAULT_SEATS_PER_ROW = 10;
const DEFAULT_BASE_PRICE = 49;

// ─────────────────── GENERAL ADMISSION (Sections) ───────────────────
function GeneralAdmissionSelector({
    tiers,
    currency = "INR",
    seatsAvailable,
    totalSeats,
}: {
    tiers: TicketTier[];
    currency?: string;
    seatsAvailable?: number;
    totalSeats?: number;
}) {
    const { selectedSeats, selectSeat, deselectSeat } = useSeatStore();

    const [quantities, setQuantities] = useState<Record<string, number>>({});

    const currencySymbol = currency === "USD" ? "$" : currency === "EUR" ? "€" : "₹";

    const handleAdd = (tierId: string) => {
        const newQty = (quantities[tierId] || 0) + 1;
        setQuantities({ ...quantities, [tierId]: newQty });
        selectSeat(`${tierId}__${newQty}`);
    };

    const handleRemove = (tierId: string) => {
        const qty = quantities[tierId] || 0;
        if (qty === 0) return;
        deselectSeat(`${tierId}__${qty}`);
        setQuantities({ ...quantities, [tierId]: qty - 1 });
    };

    const totalSelected = Object.values(quantities).reduce((a, b) => a + b, 0);

    return (
        <div className="w-full flex justify-center">
            <div className="p-6 md:p-10 glass rounded-[2.5rem] w-full max-w-3xl space-y-4">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h3 className="text-lg font-bold text-white">Select Ticket Type</h3>
                        <p className="text-white/50 text-sm mt-1">Choose from the available sections below</p>
                    </div>
                    {totalSelected > 0 && (
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="w-10 h-10 rounded-full bg-purple-500 flex items-center justify-center font-bold text-white text-lg shadow-[0_0_20px_rgba(168,85,247,0.5)]"
                        >
                            {totalSelected}
                        </motion.div>
                    )}
                </div>

                {/* Tier Cards */}
                <div className="space-y-3">
                    {tiers.map((tier, idx) => {
                        const qty = quantities[tier.id] || 0;
                        const isSelected = qty > 0;

                        return (
                            <motion.div
                                key={tier.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.07 }}
                                className={`relative flex items-center gap-4 p-5 rounded-2xl border transition-all overflow-hidden ${
                                    isSelected
                                        ? "border-white/30 bg-white/10"
                                        : "border-white/10 bg-white/5 hover:bg-white/8 hover:border-white/20"
                                }`}
                            >
                                {/* Color indicator bar */}
                                <div
                                    className="absolute left-0 top-0 bottom-0 w-1.5"
                                    style={{ backgroundColor: tier.color }}
                                />
                                <div
                                    className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ml-2"
                                    style={{ backgroundColor: tier.color + "33" }}
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke={tier.color} className="w-6 h-6">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 6v.75m0 3v.75m0 3v.75m0 3V18m-9-5.25h5.25M7.5 15h3M3.375 5.25c-.621 0-1.125.504-1.125 1.125v3.026a2.999 2.999 0 010 5.198v3.026c0 .621.504 1.125 1.125 1.125h17.25c.621 0 1.125-.504 1.125-1.125v-3.026a3 3 0 010-5.198V6.375c0-.621-.504-1.125-1.125-1.125H3.375z" />
                                    </svg>
                                </div>

                                <div className="flex-1 min-w-0">
                                    <h4 className="font-semibold text-white">{tier.name}</h4>
                                    <p className="text-sm text-white/50 mt-0.5">
                                        {tier.capacity} seats available
                                    </p>
                                </div>

                                <div className="text-right flex-shrink-0 mr-2">
                                    <p className="text-xl font-bold text-white">
                                        {currencySymbol}{tier.price.toLocaleString()}
                                    </p>
                                    <p className="text-xs text-white/40">per seat</p>
                                </div>

                                {/* Quantity Control */}
                                <div className="flex items-center gap-3 flex-shrink-0">
                                    <button
                                        type="button"
                                        onClick={() => handleRemove(tier.id)}
                                        disabled={qty === 0}
                                        className="w-9 h-9 rounded-full bg-white/10 border border-white/20 flex items-center justify-center font-bold text-white disabled:opacity-30 hover:bg-white/20 transition-all"
                                    >
                                        −
                                    </button>
                                    <span className="w-6 text-center font-bold text-white text-lg tabular-nums">
                                        {qty}
                                    </span>
                                    <button
                                        type="button"
                                        onClick={() => handleAdd(tier.id)}
                                        className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-white transition-all"
                                        style={{
                                            backgroundColor: tier.color + "55",
                                            border: `1.5px solid ${tier.color}88`
                                        }}
                                    >
                                        +
                                    </button>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>

                {/* Availability badge */}
                {seatsAvailable !== undefined && totalSeats !== undefined && (
                    <div className="pt-4 border-t border-white/10 flex items-center justify-between text-sm">
                        <span className="text-white/40">Total event capacity</span>
                        <span className="text-white/70 font-mono font-semibold">
                            {seatsAvailable} / {totalSeats} available
                        </span>
                    </div>
                )}
            </div>
        </div>
    );
}

// ─────────────────── MATRIX SEAT GRID ───────────────────
export default function SeatGrid({
    rows = DEFAULT_ROWS,
    seatsPerRow = DEFAULT_SEATS_PER_ROW,
    basePrice = DEFAULT_BASE_PRICE,
    isDynamicPricing = false,
    dynamicPricingStrategy = null,
    trueTotalSeats,
    trueAvailableSeats,
    seatingType = "matrix",
    ticketTiers,
    seatingConfig,
    currency = "INR",
}: SeatGridProps) {
    const {
        seats,
        selectedSeats,
        reservedSeats,
        availableCount,
        initializeSeats,
        selectSeat,
        deselectSeat,
        stopSimulation,
    } = useSeatStore();

    // Calculate optimal grid shape for default/matrix
    const calculatedSeatsPerRow = seatingConfig?.seatsPerRow || (trueTotalSeats && trueTotalSeats > 100 ? 15 : seatsPerRow);
    const calculatedRowCount = seatingConfig?.rows || (trueTotalSeats ? Math.ceil(trueTotalSeats / calculatedSeatsPerRow) : rows.length);

    const dynamicRows = useMemo(() => {
        if (seatingConfig?.rows) return Array.from({ length: seatingConfig.rows }, (_, i) => String.fromCharCode(65 + i));
        if (!trueTotalSeats) return rows;
        return Array.from({ length: Math.min(calculatedRowCount, 26) }, (_, i) => String.fromCharCode(65 + i));
    }, [trueTotalSeats, calculatedRowCount, rows, seatingConfig]);

    // Initialize seats based on mode
    useEffect(() => {
        initializeSeats(
            dynamicRows,
            calculatedSeatsPerRow,
            basePrice,
            isDynamicPricing,
            dynamicPricingStrategy,
            trueTotalSeats,
            trueAvailableSeats,
            seatingType,
            ticketTiers,
            seatingConfig
        );
    }, [seatingType, JSON.stringify(ticketTiers), JSON.stringify(seatingConfig), trueTotalSeats, trueAvailableSeats]);

    useEffect(() => {
        return () => stopSimulation();
    }, [stopSimulation]);

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
            selectSeat(seatId);
        }
    };

    // Detect if this is a General Admission event
    if (seatingType === "general" && ticketTiers && ticketTiers.length > 0) {
        return (
            <GeneralAdmissionSelector
                tiers={ticketTiers}
                currency={currency}
                seatsAvailable={trueAvailableSeats}
                totalSeats={trueTotalSeats}
            />
        );
    }

    const isLowAvailability = availableCount > 0 && availableCount <= 10;

    if (seats.length === 0) {
        return (
            <div className="w-full h-64 flex items-center justify-center">
                <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    // Build per-row tier color mapping from seatingConfig
    const rowColorMap: Record<string, string> = {};
    if (seatingConfig?.rowTiers && ticketTiers) {
        Object.entries(seatingConfig.rowTiers).forEach(([rowLabel, tierId]) => {
            const tier = ticketTiers.find(t => t.id === tierId);
            if (tier) rowColorMap[rowLabel] = tier.color;
        });
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

                {/* Stage */}
                <div className="w-full flex justify-center mb-16 mt-12 sm:mt-0 relative">
                    <div className="w-3/4 max-w-sm h-12 border-b-4 border-t-2 border-t-white/10 border-b-purple-500 rounded-t-[100px] bg-gradient-to-t from-purple-500/20 to-transparent flex items-end justify-center pb-2">
                        <span className="text-white/40 tracking-[0.2em] text-sm uppercase font-semibold">Stage</span>
                    </div>
                    <div className="absolute top-0 w-3/4 max-w-sm h-16 bg-purple-500/20 blur-[50px] -z-10 rounded-full" />
                </div>

                {/* Tier legend (for matrix with tiers) */}
                {ticketTiers && ticketTiers.length > 0 && (
                    <div className="flex flex-wrap justify-center gap-3 mb-6">
                        {ticketTiers.map(tier => (
                            <div key={tier.id} className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-white/70">
                                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: tier.color }} />
                                {tier.name} — {currency === "USD" ? "$" : currency === "EUR" ? "€" : "₹"}{tier.price}
                            </div>
                        ))}
                    </div>
                )}

                {/* Dynamic Seat Grid */}
                <div className="flex flex-col gap-3 md:gap-4 items-center overflow-x-auto">
                    {grid.map((rowSeats, rowIndex) => {
                        const rowLabel = dynamicRows[rowIndex];
                        const tierColor = rowColorMap[rowLabel];

                        return (
                            <div key={rowLabel} className="flex gap-2 md:gap-3 items-center">
                                {/* Row Label Left */}
                                <div
                                    className="w-6 text-center text-white/40 font-bold text-xs hidden md:block"
                                    style={tierColor ? { color: tierColor } : {}}
                                >
                                    {rowLabel}
                                </div>

                                {/* Seats */}
                                <div className="flex gap-1.5 md:gap-2">
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
                                                color={status === "available" ? tierColor : undefined}
                                            />
                                        );
                                    })}
                                </div>

                                {/* Row Label Right */}
                                <div
                                    className="w-6 text-center text-white/40 font-bold text-xs hidden md:block"
                                    style={tierColor ? { color: tierColor } : {}}
                                >
                                    {rowLabel}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Legend */}
                <div className="mt-14 flex justify-center gap-8 border-t border-white/10 pt-6">
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
