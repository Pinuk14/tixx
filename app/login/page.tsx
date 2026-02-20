"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import GlassCard from "@/components/ui/GlassCard";
import GlassInput from "@/components/ui/GlassInput";
import GlassButton from "@/components/ui/GlassButton";
import Link from "next/link";
import ErrorText from "@/components/ui/ErrorText";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [rememberMe, setRememberMe] = useState(false);

    // Mock states
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");

        // Mock verification
        setTimeout(() => {
            setIsLoading(false);

            if (!email.includes("@") || password.length < 6) {
                setError("Invalid email or password. Password must be 6+ chars.");
            } else {
                setSuccess(true);
            }
        }, 1500);
    };

    return (
        <main className="min-h-[calc(100vh-80px)] flex items-center justify-center p-6">
            <AnimatePresence mode="wait">
                {!success ? (
                    <motion.div
                        key="login-form"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 1.05, filter: "blur(10px)" }}
                        transition={{ duration: 0.5 }}
                        className="w-full max-w-md"
                    >
                        <GlassCard className="!p-8">
                            <div className="text-center mb-8">
                                <h1 className="text-3xl font-bold mb-2">Welcome Back</h1>
                                <p className="text-white/60">Log in to manage your events</p>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-5">
                                <GlassInput
                                    id="email"
                                    type="email"
                                    label="Email Address"
                                    placeholder="name@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />

                                <GlassInput
                                    id="password"
                                    type="password"
                                    label="Password"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />

                                <div className="flex items-center justify-between">
                                    <label className="flex items-center gap-2 cursor-pointer group">
                                        <div className="relative flex items-center justify-center w-5 h-5 rounded border border-white/30 bg-white/5 group-hover:bg-white/10 transition-colors">
                                            <input
                                                type="checkbox"
                                                className="sr-only"
                                                checked={rememberMe}
                                                onChange={(e) => setRememberMe(e.target.checked)}
                                            />
                                            <AnimatePresence>
                                                {rememberMe && (
                                                    <motion.svg
                                                        initial={{ scale: 0, opacity: 0 }}
                                                        animate={{ scale: 1, opacity: 1 }}
                                                        exit={{ scale: 0, opacity: 0 }}
                                                        className="w-3.5 h-3.5 text-white"
                                                        fill="none"
                                                        viewBox="0 0 24 24"
                                                        stroke="currentColor"
                                                        strokeWidth={3}
                                                    >
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                                    </motion.svg>
                                                )}
                                            </AnimatePresence>
                                        </div>
                                        <span className="text-sm text-white/80 group-hover:text-white transition-colors">
                                            Remember me
                                        </span>
                                    </label>

                                    <Link href="/forgot-password" className="text-sm text-purple-400 hover:text-purple-300 transition-colors">
                                        Forgot password?
                                    </Link>
                                </div>

                                {/* Animated Error Banner */}
                                <AnimatePresence>
                                    {error && (
                                        <motion.div
                                            initial={{ opacity: 0, y: -10, height: 0 }}
                                            animate={{ opacity: 1, y: 0, height: "auto" }}
                                            exit={{ opacity: 0, y: -10, height: 0 }}
                                            className="overflow-hidden"
                                        >
                                            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl mt-4 backdrop-blur-md">
                                                <ErrorText error={error} className="!mt-0" />
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                <GlassButton
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full flex justify-center mt-6 !bg-white/20 hover:!bg-white/30 border-white/40"
                                >
                                    {isLoading ? (
                                        <motion.div
                                            animate={{ rotate: 360 }}
                                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                            className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                                        />
                                    ) : (
                                        "Sign In"
                                    )}
                                </GlassButton>
                            </form>

                            <p className="text-center text-sm text-white/60 mt-6">
                                Don't have an account?{" "}
                                <Link href="/register" className="text-white hover:underline transition-all">
                                    Sign up
                                </Link>
                            </p>
                        </GlassCard>
                    </motion.div>
                ) : (
                    <motion.div
                        key="success-state"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ type: "spring", bounce: 0.5 }}
                        className="text-center"
                    >
                        <div className="w-24 h-24 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6 border border-green-500/30 backdrop-blur-xl shadow-[0_0_30px_rgba(34,197,94,0.3)]">
                            <motion.svg
                                initial={{ pathLength: 0 }}
                                animate={{ pathLength: 1 }}
                                transition={{ duration: 0.5, delay: 0.2 }}
                                className="w-12 h-12 text-green-400"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                strokeWidth={3}
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </motion.svg>
                        </div>
                        <h2 className="text-3xl font-bold mb-2">Login Successful!</h2>
                        <p className="text-white/70">Redirecting to your dashboard...</p>
                    </motion.div>
                )}
            </AnimatePresence>
        </main>
    );
}
