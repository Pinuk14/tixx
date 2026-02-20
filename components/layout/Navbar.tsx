"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import GlassButton from "@/components/ui/GlassButton";

export default function Navbar() {
    return (
        <motion.nav
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="fixed top-0 left-0 right-0 z-50 glass border-b border-white/10 shadow-md backdrop-blur-md bg-white/5"
        >
            <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
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

                {/* Desktop Navigation */}
                <div className="hidden md:flex items-center gap-4">
                    <GlassButton className="!py-2 !px-5 text-sm">
                        <Link href="/login">Login</Link>
                    </GlassButton>
                    <GlassButton className="!py-2 !px-5 text-sm bg-white/10 hover:bg-white/20">
                        <Link href="/register">Register</Link>
                    </GlassButton>
                </div>

                {/* Mobile Menu Button - Optional visual enhancement */}
                <div className="md:hidden">
                    <GlassButton className="!p-2">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={1.5}
                            stroke="currentColor"
                            className="w-6 h-6"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
                            />
                        </svg>
                    </GlassButton>
                </div>
            </div>
        </motion.nav>
    );
}
