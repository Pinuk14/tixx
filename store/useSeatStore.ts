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
    initializeSeats: (rows: string[], seatsPerRow: number, basePrice: number) => void;
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

    initializeSeats: (rows, seatsPerRow, basePrice) => {
        const newSeats: Seat[] = [];

        // Generate a grid of seats
        rows.forEach((row, rowIndex) => {
            // Increase price for rows closer to the stage (earlier in the array)
            const rowMultiplier = 1 + ((rows.length - rowIndex) * 0.1);
            const rowPrice = Math.round(basePrice * rowMultiplier);

            for (let i = 1; i <= seatsPerRow; i++) {
                const id = `${row}${i}`;
                // Randomly pre-reserve some seats (approx 30%)
                const isPreReserved = Math.random() < 0.3;

                newSeats.push({
                    id,
                    row,
                    number: i,
                    status: isPreReserved ? "reserved" : "available",
                    price: rowPrice,
                });
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
