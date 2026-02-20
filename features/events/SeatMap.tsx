"use client";

import { useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSeatStore } from "@/store/useSeatStore";
import Seat from "@/features/seats/Seat";

const ROWS = ["A", "B", "C", "D", "E"];
const SEATS_PER_ROW = 10;
const BASE_PRICE = 49;

export default function SeatMap() {
    const {
        seats,
        selectedSeats,
        reservedSeats,
        isSimulating,
        initializeSeats,
        selectSeat,
        deselectSeat,
        startSimulation,
        stopSimulation,
        simulateRandomReservation,
        simulateRandomRelease
    } = useSeatStore();

    // 1. Initialize Seats on mount
    useEffect(() => {
        if (seats.length === 0) {
            initializeSeats(ROWS, SEATS_PER_ROW, BASE_PRICE);
        }
    }, [seats.length, initializeSeats]);

    // 2. Start Simulation Loop
    useEffect(() => {
        // Only start if not already "started" (though we can safely call startSimulation repeatedly if we wanted)
        if (!isSimulating && seats.length > 0) {
            startSimulation();
        }

        // A simple simulation loop: every 2.5 - 5 seconds, somebody might buy a seat or release a seat
        let intervalId: NodeJS.Timeout;

        if (isSimulating) {
            intervalId = setInterval(() => {
                // 70% chance to reserve a seat, 30% chance someone drops cart
                if (Math.random() < 0.7) {
                    simulateRandomReservation();
                } else {
                    simulateRandomRelease();
                }
            }, 3000); // Trigger an event every 3 seconds roughly
        }

        return () => {
            if (intervalId) clearInterval(intervalId);
        };
    }, [isSimulating, seats.length, startSimulation, simulateRandomReservation, simulateRandomRelease]);

    // Optionally stop when leaving component
    useEffect(() => {
        return () => stopSimulation();
    }, [stopSimulation]);


    // Derive grid for rendering
    const grid = useMemo(() => {
        return ROWS.map((row) => {
            return seats.filter((s) => s.row === row).sort((a, b) => a.number - b.number);
        });
    }, [seats]);

    const handleSeatClick = (seatId: string) => {
        if (selectedSeats.includes(seatId)) {
            deselectSeat(seatId);
        } else {
            selectSeat(seatId);
        }
    };

    if (seats.length === 0) return (
        <div className="w-full h-64 flex items-center justify-center">
            <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
        </div>
    );

    return (
        <div className="w-full flex justify-center">
            <div className="p-6 md:p-10 glass rounded-[2.5rem] relative overflow-hidden max-w-4xl w-full">

                {/* Stage Graphic */}
                <div className="w-full flex justify-center mb-16 relative">
                    <div className="w-3/4 max-w-sm h-12 border-b-4 border-t-2 border-t-white/10 border-b-purple-500 rounded-t-[100px] bg-gradient-to-t from-purple-500/20 to-transparent flex items-end justify-center pb-2">
                        <span className="text-white/40 tracking-[0.2em] text-sm uppercase font-semibold">Stage</span>
                    </div>
                    {/* Subtle Stage glow */}
                    <div className="absolute top-0 w-3/4 max-w-sm h-16 bg-purple-500/20 blur-[50px] -z-10 rounded-full" />
                </div>

                {/* Seat Grid */}
                <div className="flex flex-col gap-4 md:gap-6 items-center">
                    {grid.map((rowSeats, rowIndex) => (
                        <div key={ROWS[rowIndex]} className="flex gap-2 md:gap-4 items-center">

                            {/* Row Label (Left) */}
                            <div className="w-6 text-center text-white/40 font-bold hidden md:block">
                                {ROWS[rowIndex]}
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
                                {ROWS[rowIndex]}
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
                        <div className="w-4 h-4 rounded-t-md rounded-b-sm bg-red-500/30 border border-red-500/30" />
                        <span className="text-sm text-white/60">Reserved</span>
                    </div>
                </div>

            </div>
        </div>
    );
}
