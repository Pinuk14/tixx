"use client";

import { motion } from "framer-motion";

export default function GlassCard({
    children,
    className = "",
}: {
    children: React.ReactNode;
    className?: string;
}) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            whileHover={{ scale: 1.02, y: -5 }}
            className={`glass rounded-3xl p-10 transition-all duration-300 ${className}`}
        >
            {children}
        </motion.div>
    );
}