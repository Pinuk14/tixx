import { create } from "zustand";

export interface Seat {
    id: string;
    row: string;
    number: number;
    status: "available" | "reserved" | "selected";
    price: number;
}

interface SeatStore {
    seats: Seat[];
    selectedSeats: string[];
    reservedSeats: string[];
    totalSeats: number;
    availableCount: number;
    isSimulating: boolean;

    // Actions
    initializeSeats: (rows: string[], seatsPerRow: number, basePrice: number, isDynamicPricing?: boolean, strategy?: string | null, trueTotalSeats?: number, trueAvailableSeats?: number) => void;
    selectSeat: (seatId: string) => void;
    deselectSeat: (seatId: string) => void;
    clearSelection: () => void;

    // Simulation Actions
    startSimulation: () => void;
    stopSimulation: () => void;
    simulateRandomReservation: () => void;
    simulateRandomRelease: () => void;
}

export const useSeatStore = create<SeatStore>((set, get) => ({
    seats: [],
    selectedSeats: [],
    reservedSeats: [],
    totalSeats: 0,
    availableCount: 0,
    isSimulating: false,

    initializeSeats: (rows, seatsPerRow, basePrice, isDynamicPricing, strategy, trueTotalSeats, trueAvailableSeats) => {
        const newSeats: Seat[] = [];

        // Determine how many seats are already sold in the real database
        let exactSeatsSold = 0;
        if (trueTotalSeats !== undefined && trueAvailableSeats !== undefined) {
            exactSeatsSold = trueTotalSeats - trueAvailableSeats;
        } else {
            // Fallback for visual display if no data
            exactSeatsSold = 0;
        }

        let currentSeatIndex = 0;

        // Generate a grid of seats
        let generatedSeatsCount = 0;
        const targetTotalSeats = trueTotalSeats || (rows.length * seatsPerRow);

        rows.forEach((row, rowIndex) => {
            let rowPrice = basePrice;

            if (isDynamicPricing && strategy) {
                if (strategy === "front_rows_extra") {
                    // Front rows cost more
                    const rowMultiplier = 1 + ((rows.length - rowIndex) * 0.15);
                    rowPrice = Math.round(basePrice * rowMultiplier);
                } else if (strategy === "back_rows_extra") {
                    // Back rows cost more
                    const rowMultiplier = 1 + (rowIndex * 0.15);
                    rowPrice = Math.round(basePrice * rowMultiplier);
                } else if (strategy === "center_rows_extra") {
                    // Center rows cost more
                    const middleIndex = Math.floor(rows.length / 2);
                    const distanceToCenter = Math.abs(rowIndex - middleIndex);
                    const rowMultiplier = 1 + ((rows.length - distanceToCenter) * 0.1);
                    rowPrice = Math.round(basePrice * rowMultiplier);
                }
            } else {
                // Keep base price flat if dynamic pricing is disabled
                rowPrice = basePrice;
            }

            for (let i = 1; i <= seatsPerRow; i++) {
                if (generatedSeatsCount >= targetTotalSeats) {
                    continue; // Skip generating seats beyond true capacity
                }

                const id = `${row}${i}`;

                // Reserve exactly the amount sold, filling from the front rows first (simulating early buyers)
                const isPreReserved = currentSeatIndex < exactSeatsSold;

                newSeats.push({
                    id,
                    row,
                    number: i,
                    status: isPreReserved ? "reserved" : "available",
                    price: rowPrice,
                });

                currentSeatIndex++;
                generatedSeatsCount++;
            }
        });

        const preReservedIds = newSeats
            .filter(s => s.status === "reserved")
            .map(s => s.id);

        set({
            seats: newSeats,
            totalSeats: newSeats.length,
            reservedSeats: preReservedIds,
            availableCount: newSeats.length - preReservedIds.length,
            selectedSeats: [],
        });
    },

    selectSeat: (seatId) => {
        const { seats, reservedSeats, selectedSeats } = get();

        // Validate if seat exists and isn't reserved
        if (reservedSeats.includes(seatId) || selectedSeats.includes(seatId)) return;

        const seatExists = seats.some((s) => s.id === seatId);
        if (!seatExists) return;

        set((state) => ({
            selectedSeats: [...state.selectedSeats, seatId],
            availableCount: state.availableCount - 1,
        }));
    },

    deselectSeat: (seatId) => {
        const { selectedSeats } = get();
        if (!selectedSeats.includes(seatId)) return;

        set((state) => ({
            selectedSeats: state.selectedSeats.filter((id) => id !== seatId),
            availableCount: state.availableCount + 1,
        }));
    },

    clearSelection: () => {
        set((state) => ({
            availableCount: state.availableCount + state.selectedSeats.length,
            selectedSeats: [],
        }));
    },

    // --- Real-time Simulation Logic ---
    startSimulation: () => {
        const state = get();
        if (state.isSimulating || state.seats.length === 0) return;

        set({ isSimulating: true });

        // Keep simulation running reference so we can clear it elsewhere if needed
        // but in Zustand, we often manage interval outside or in useEffect
        // For simplicity, we'll expose a flag, and let a component handle the `setInterval` using these actions.
    },

    stopSimulation: () => {
        set({ isSimulating: false });
    },

    simulateRandomReservation: () => {
        const { seats, reservedSeats, selectedSeats } = get();

        // Find all truly available seats
        const availableSeats = seats.filter(
            (s) => !reservedSeats.includes(s.id) && !selectedSeats.includes(s.id)
        );

        if (availableSeats.length === 0) return;

        // Pick a random seat to reserve
        const randomIndex = Math.floor(Math.random() * availableSeats.length);
        const targetSeat = availableSeats[randomIndex];

        set((state) => ({
            reservedSeats: [...state.reservedSeats, targetSeat.id],
            availableCount: state.availableCount - 1,
        }));
    },

    simulateRandomRelease: () => {
        const { reservedSeats } = get();
        if (reservedSeats.length === 0) return;

        // Pick a random reserved seat to release (simulating someone canceling cart)
        const randomIndex = Math.floor(Math.random() * reservedSeats.length);
        const idToRelease = reservedSeats[randomIndex];

        set((state) => ({
            reservedSeats: state.reservedSeats.filter((id) => id !== idToRelease),
            availableCount: state.availableCount + 1,
        }));
    },
}));
