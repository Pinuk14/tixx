"use client";

import { motion, useScroll, useMotionValueEvent } from "framer-motion";
import Link from "next/link";
import GlassButton from "@/components/ui/GlassButton";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function Navbar() {
    const router = useRouter();
    const [scrolling, setScrolling] = useState(false);
    const { scrollY } = useScroll();

    // Track authentication directly from browser storage
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [isMounted, setIsMounted] = useState(false);

    // Setup scroll listener for the liquid glass transition
    useMotionValueEvent(scrollY, "change", (latest) => {
        if (latest > 50) setScrolling(true);
        else setScrolling(false);
    });

    // Check JWT token safely on the client
    useEffect(() => {
        setIsMounted(true);

        // Polling wrapper for extreme robustness if React Router doesn't trigger a full remount 
        // across layouts (common when traversing App Router)
        const checkAuth = () => {
            const token = localStorage.getItem('tixx_token');
            setIsLoggedIn(!!token);
        };

        checkAuth();

        // Listen for manual auth pushes across window
        window.addEventListener('storage', checkAuth);

        // Polling catch-all for local mutations without full reloads
        const poller = setInterval(checkAuth, 1000);

        return () => {
            window.removeEventListener('storage', checkAuth);
            clearInterval(poller);
        };
    }, []);

    const executeLogout = () => {
        localStorage.removeItem('tixx_token');
        setIsLoggedIn(false);
        router.push('/');
    };

    return (
        <motion.nav
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 border-b border-white/10 ${scrolling
                ? "glass shadow-md backdrop-blur-xl bg-black/40 py-2" // Scrolled state: Dark Glass
                : "bg-transparent py-4 border-transparent"            // Top state: Completely clear
                }`}
        >
            <div className={`max-w-7xl mx-auto px-6 flex items-center justify-between transition-all duration-500 ${scrolling ? "h-16" : "h-20"}`}>
                {/* Logo */}
                <Link href="/">
                    <motion.div
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="flex items-center gap-2 cursor-pointer"
                    >
                        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-500 to-blue-500 flex items-center justify-center text-white font-bold text-xl shadow-[0_0_15px_rgba(168,85,247,0.5)]">
                            T
                        </div>
                        <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-white/70">
                            TiXX
                        </span>
                    </motion.div>
                </Link>

                {/* Conditional Dynamic Navigation Array */}
                {isMounted && ( // Prevent layout shift hydration mismatch
                    <div className="hidden md:flex items-center gap-4">
                        {!isLoggedIn ? (
                            // Logged Out State View
                            <>
                                <GlassButton className="!py-2 !px-5 text-sm !bg-transparent border-transparent hover:!bg-white/10">
                                    <Link href="/login">Login</Link>
                                </GlassButton>
                                <GlassButton className="!py-2 !px-5 text-sm bg-white/10 hover:bg-white/20">
                                    <Link href="/register">Register</Link>
                                </GlassButton>
                            </>
                        ) : (
                            // Logged In Status View
                            <>
                                <GlassButton className="!py-2 !px-5 text-sm !bg-transparent border-transparent text-purple-300 hover:!bg-purple-500/10">
                                    <Link href="/dashboard">Dashboard</Link>
                                </GlassButton>
                                <GlassButton
                                    onClick={executeLogout}
                                    className="!py-2 !px-5 text-sm bg-white/5 border-white/10 hover:bg-red-500/20 hover:border-red-500/30 hover:text-red-300 transition-colors"
                                >
                                    Log out
                                </GlassButton>
                            </>
                        )}
                    </div>
                )}

                {/* Mobile Menu Button  */}
                <div className="md:hidden">
                    <GlassButton className="!p-2">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                        </svg>
                    </GlassButton>
                </div>
            </div>
        </motion.nav>
    );
}
