import React from 'react';

interface LogoProps {
    className?: string;
}

export default function Logo({ className = "h-8" }: LogoProps) {
    return (
        <svg
            viewBox="0 0 130 50"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={`${className}`}
        >
            {/* T */}
            <path d="M10 15H30M20 15V35" stroke="currentColor" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />

            {/* I (Microphone) */}
            <rect x="42" y="14" width="10" height="15" rx="5" fill="currentColor" />
            <path d="M38 24V25C38 29.5 42 32 47 32C52 32 56 29.5 56 25V24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <path d="M47 32V36M43 36H51" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />

            {/* X 1 */}
            <path d="M75 15L95 35M95 15L75 35" stroke="currentColor" strokeWidth="5" strokeLinecap="round" />

            {/* X 2 (Overlapping creating perforation holes in the negative space) */}
            <path d="M95 15L115 35M115 15L95 35" stroke="currentColor" strokeWidth="5" strokeLinecap="round" />

            {/* Negative space perforation dots creating the tear edge where the Xs intersect */}
            {/* These dots simulate the perforated edge down the middle of the Xs */}
            <circle cx="95" cy="25" r="3" fill="var(--bg-color, #0a0f1c)" />
            <circle cx="95" cy="15" r="2" fill="var(--bg-color, #0a0f1c)" />
            <circle cx="95" cy="35" r="2" fill="var(--bg-color, #0a0f1c)" />
        </svg>
    );
}
