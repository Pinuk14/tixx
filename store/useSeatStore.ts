import { create } from "zustand";

export interface Seat {
    id: string; // Seat ID or Tier ID
    row: string;
    number: number;
    status: "available" | "reserved" | "selected";
    price: number;
    name?: string; // e.g. "VIP Section"
}

interface SeatStore {
    seats: Seat[];
    selectedSeats: string[];
    reservedSeats: string[];
    totalSeats: number;
    availableCount: number;
    isSimulating: boolean;

    // Actions
    initializeSeats: (
        rows: string[], 
        seatsPerRow: number, 
        basePrice: number, 
        isDynamicPricing?: boolean, 
        strategy?: string | null, 
        trueTotalSeats?: number, 
        trueAvailableSeats?: number,
        seatingType?: "general" | "matrix",
        ticketTiers?: any[],
        seatingConfig?: any
    ) => void;
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

    initializeSeats: (rows, seatsPerRow, basePrice, isDynamicPricing, strategy, trueTotalSeats, trueAvailableSeats, seatingType, ticketTiers, seatingConfig) => {
        const newSeats: Seat[] = [];

        if (seatingType === "general" && ticketTiers && ticketTiers.length > 0) {
            // General Admission Mode: Render 1 big block per Tier
            ticketTiers.forEach((tier) => {
                newSeats.push({
                    id: tier.id,
                    name: tier.name,
                    row: tier.name, // Display name
                    number: 1, // Represents a group
                    status: "available",
                    price: tier.price
                });
            });

            set({
                seats: newSeats,
                totalSeats: ticketTiers.reduce((acc, t) => acc + (t.capacity || 0), 0),
                reservedSeats: [],
                availableCount: ticketTiers.reduce((acc, t) => acc + (t.capacity || 0), 0),
                selectedSeats: [],
            });
            return;
        }

        // --- Matrix / Default Mode ---
        let exactSeatsSold = 0;
        if (trueTotalSeats !== undefined && trueAvailableSeats !== undefined) {
            exactSeatsSold = trueTotalSeats - trueAvailableSeats;
        }

        let currentSeatIndex = 0;

        // Use custom matrix config if provided, else fallback to passed defaults
        const actualRows = seatingConfig?.rows ? Array.from({ length: seatingConfig.rows }).map((_, i) => String.fromCharCode(65 + i)) : rows;
        const actualSeatsPerRow = seatingConfig?.seatsPerRow || seatsPerRow;
        const targetTotalSeats = seatingConfig ? (actualRows.length * actualSeatsPerRow) : (trueTotalSeats || (actualRows.length * actualSeatsPerRow));
        let generatedSeatsCount = 0;

        // Helper function to figure out price of specific row based on config
        const getRowPrice = (rowLabel: string, defaultPrice: number, rIndex: number) => {
            if (seatingConfig?.rowTiers && ticketTiers) {
                const tierId = seatingConfig.rowTiers[rowLabel];
                const tier = ticketTiers.find(t => t.id === tierId);
                if (tier) return tier.price;
            }

            // Legacy dynamic pricing fallback
            let rowPrice = defaultPrice;
            if (isDynamicPricing && strategy) {
                if (strategy === "front_rows_extra") {
                    const rowMultiplier = 1 + ((actualRows.length - rIndex) * 0.15);
                    rowPrice = Math.round(defaultPrice * rowMultiplier);
                } else if (strategy === "back_rows_extra") {
                    const rowMultiplier = 1 + (rIndex * 0.15);
                    rowPrice = Math.round(defaultPrice * rowMultiplier);
                } else if (strategy === "center_rows_extra") {
                    const middleIndex = Math.floor(actualRows.length / 2);
                    const distanceToCenter = Math.abs(rIndex - middleIndex);
                    const rowMultiplier = 1 + ((actualRows.length - distanceToCenter) * 0.1);
                    rowPrice = Math.round(defaultPrice * rowMultiplier);
                }
            }
            return rowPrice;
        };

        actualRows.forEach((row, rowIndex) => {
            const rowPrice = getRowPrice(row, basePrice, rowIndex);

            for (let i = 1; i <= actualSeatsPerRow; i++) {
                if (generatedSeatsCount >= targetTotalSeats) continue;

                const id = `${row}${i}`;
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
        }));
    },

    deselectSeat: (seatId) => {
        const { selectedSeats } = get();
        if (!selectedSeats.includes(seatId)) return;

        set((state) => ({
            selectedSeats: state.selectedSeats.filter((id) => id !== seatId),
        }));
    },

    clearSelection: () => {
        set((state) => ({
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
