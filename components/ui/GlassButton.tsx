"use client";

import { motion, HTMLMotionProps } from "framer-motion";

interface GlassButtonProps extends HTMLMotionProps<"button"> {
    children: React.ReactNode;
    className?: string;
}

export default function GlassButton({
    children,
    className = "",
    ...props
}: GlassButtonProps) {
    return (
        <motion.button
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`glass px-6 py-3 rounded-xl font-medium text-white transition-all duration-300 hover:bg-white/20 hover:border-white/40 ${className}`}
            {...props}
        >
            {children}
        </motion.button>
    );
}
