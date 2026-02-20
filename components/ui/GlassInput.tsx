"use client";

import React, { forwardRef } from "react";
import { motion } from "framer-motion";
import GlassLabel from "./GlassLabel";
import ErrorText from "./ErrorText";

interface GlassInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    containerClassName?: string;
}

const GlassInput = forwardRef<HTMLInputElement, GlassInputProps>(
    ({ label, error, className = "", containerClassName = "", id, required, ...props }, ref) => {
        // Generate a secure, unique ID for accessibility if not provided
        const inputId = id || React.useId();

        return (
            <motion.div
                className={`w-full ${containerClassName}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
            >
                {label && (
                    <GlassLabel htmlFor={inputId} required={required}>
                        {label}
                    </GlassLabel>
                )}

                <div className="relative">
                    <input
                        id={inputId}
                        ref={ref}
                        required={required}
                        className={`
              w-full 
              px-4 py-3 
              rounded-xl 
              bg-white/10 
              border 
              ${error ? 'border-red-400/50 focus:border-red-400' : 'border-white/20 focus:border-white/50'}
              text-white 
              placeholder-white/40 
              transition-all 
              duration-300
              outline-none
              backdrop-blur-md
              focus:bg-white/15
              focus:shadow-[0_0_15px_rgba(255,255,255,0.1)]
              ${className}
            `}
                        aria-invalid={!!error}
                        aria-describedby={error ? `${inputId}-error` : undefined}
                        {...props}
                    />
                </div>

                {error && (
                    <div id={`${inputId}-error`}>
                        <ErrorText error={error} />
                    </div>
                )}
            </motion.div>
        );
    }
);

GlassInput.displayName = "GlassInput";

export default GlassInput;
