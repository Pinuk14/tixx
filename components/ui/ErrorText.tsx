"use client";

import { motion } from "framer-motion";

interface ErrorTextProps {
    error?: string;
    className?: string;
}

export default function ErrorText({ error, className = "" }: ErrorTextProps) {
    if (!error) return null;

    return (
        <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className={`text-red-400 text-sm mt-2 font-medium ${className}`}
            role="alert"
        >
            {error}
        </motion.p>
    );
}
