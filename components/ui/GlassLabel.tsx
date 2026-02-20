"use client";

import { motion, HTMLMotionProps } from "framer-motion";

interface GlassLabelProps extends HTMLMotionProps<"label"> {
    children: React.ReactNode;
    className?: string;
    required?: boolean;
}

export default function GlassLabel({
    children,
    className = "",
    required,
    ...props
}: GlassLabelProps) {
    return (
        <motion.label
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className={`block text-sm font-medium text-white/90 mb-2 ${className}`}
            {...props}
        >
            {children}
            {required && <span className="text-red-400 ml-1">*</span>}
        </motion.label>
    );
}
