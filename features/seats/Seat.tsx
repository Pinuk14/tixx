"use client";

import { motion } from "framer-motion";

export type SeatStatus = "available" | "selected" | "reserved" | "unavailable";

interface SeatProps {
    id: string;
    number: number | string;
    status: SeatStatus;
    onClick?: (id: string) => void;
    className?: string;
    price?: number;
}

export default function Seat({ id, number, status, onClick, className = "" }: SeatProps) {
    const isAvailable = status === "available";
    const isSelected = status === "selected";
    const isReserved = status === "reserved" || status === "unavailable";

    const getStyleClasses = () => {
        switch (status) {
            case "selected":
                return "bg-green-500 border-green-400 text-white shadow-[0_0_20px_rgba(34,197,94,0.6)] z-10";
            case "reserved":
            case "unavailable":
                return "bg-red-500/30 border-red-500/30 text-white/20 cursor-not-allowed";
            case "available":
            default:
                return "bg-white/10 border-white/20 text-white/40 shadow-sm hover:bg-white/30 hover:shadow-[0_0_15px_rgba(255,255,255,0.3)] hover:text-white";
        }
    };

    return (
        <motion.button
            layout
            key={id}
            disabled={isReserved}
            onClick={() => (isAvailable || isSelected) && onClick ? onClick(id) : undefined}
            initial={false}
            animate={{
                scale: isSelected ? 1.05 : 1,
                opacity: isReserved ? 0.7 : 1,
            }}
            whileHover={!isReserved ? { scale: 1.15, zIndex: 10 } : {}}
            whileTap={!isReserved ? { scale: 0.9 } : {}}
            transition={{
                type: "spring",
                stiffness: 400,
                damping: 25,
                opacity: { duration: 0.4 } // Reserved fade transition
            }}
            className={`
        relative w-8 h-8 md:w-10 md:h-10 rounded-t-xl rounded-b-md border transition-colors duration-300 flex items-center justify-center text-xs font-semibold
        ${getStyleClasses()}
        ${className}
      `}
            aria-label={`${status} Seat ${id}`}
            aria-pressed={isSelected}
            aria-disabled={isReserved}
        >
            {/* Only show number if it's not reserved, making reserved seats look cleaner */}
            {!isReserved && <span>{number}</span>}
        </motion.button>
    );
}
