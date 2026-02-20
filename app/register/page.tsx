"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import GlassCard from "@/components/ui/GlassCard";
import GlassInput from "@/components/ui/GlassInput";
import GlassButton from "@/components/ui/GlassButton";
import Link from "next/link";
import ErrorText from "@/components/ui/ErrorText";

export default function RegisterPage() {
    const router = useRouter();
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const [strength, setStrength] = useState(0); // 0-4
    const [passwordsMatch, setPasswordsMatch] = useState<boolean | null>(null);

    // Mock states
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);

    // Calculate Password Strength
    useEffect(() => {
        let score = 0;
        if (password.length > 5) score += 1;
        if (password.length > 8) score += 1;
        if (/[A-Z]/.test(password)) score += 1;
        if (/[0-9]/.test(password) || /[^A-Za-z0-9]/.test(password)) score += 1;
        setStrength(score);
    }, [password]);

    // Check Password Match
    useEffect(() => {
        if (confirmPassword.length === 0) {
            setPasswordsMatch(null);
        } else {
            setPasswordsMatch(password === confirmPassword);
        }
    }, [password, confirmPassword]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");

        // Basic front-end validation
        if (strength < 2) {
            setError("Password is too weak. Please choose a stronger password.");
            setIsLoading(false);
            return;
        }

        if (password !== confirmPassword) {
            setError("Passwords do not match.");
            setIsLoading(false);
            return;
        }

        if (!email.includes("@")) {
            setError("Please enter a valid email address.");
            setIsLoading(false);
            return;
        }

        try {
            const res = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name,
                    email,
                    password,
                    role: 'user' // Defaulting to user for this public form
                })
            });

            const data = await res.json();

            if (!res.ok) {
                // If the backend threw a 400/409/500, it sends { error: string }
                setError(data.error || 'Registration failed. Please try again.');
            } else {
                // Success! The API returned { token, user }
                console.log("Registration Token:", data.token); // Store this in LocalStorage or cookies later
                localStorage.setItem('tixx_token', data.token);
                setSuccess(true);
                // Push UX to gateway exactly 1.5 seconds later
                setTimeout(() => {
                    router.push('/dashboard');
                }, 1500);
            }
        } catch (err: any) {
            setError('A network error occurred connecting to the Authentication servers.');
        } finally {
            setIsLoading(false);
        }
    };

    const strengthColors = ["bg-red-500", "bg-orange-500", "bg-yellow-400", "bg-green-400", "bg-green-500"];
    const strengthLabels = ["Weak", "Fair", "Good", "Strong", "Very Strong"];

    return (
        <main className="min-h-[calc(100vh-80px)] flex items-center justify-center p-6 mt-10 mb-10">
            <AnimatePresence mode="wait">
                {!success ? (
                    <motion.div
                        key="register-form"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 1.05, filter: "blur(10px)" }}
                        transition={{ duration: 0.5 }}
                        className="w-full max-w-md"
                    >
                        <GlassCard className="!p-8">
                            <div className="text-center mb-8">
                                <h1 className="text-3xl font-bold mb-2">Create Account</h1>
                                <p className="text-white/60">Join TiXX for your event needs</p>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <GlassInput
                                    id="name"
                                    type="text"
                                    label="Full Name"
                                    placeholder="John Doe"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    required
                                />

                                <GlassInput
                                    id="email"
                                    type="email"
                                    label="Email Address"
                                    placeholder="name@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />

                                <div className="space-y-2">
                                    <GlassInput
                                        id="password"
                                        type="password"
                                        label="Password"
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                    />

                                    {/* Password Strength Indicator */}
                                    {password.length > 0 && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: "auto" }}
                                            className="text-xs space-y-1"
                                        >
                                            <div className="flex justify-between items-center text-white/70">
                                                <span>Password strength</span>
                                                <span className="font-medium">{strengthLabels[strength]}</span>
                                            </div>
                                            <div className="flex gap-1 h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                                                {[1, 2, 3, 4].map((level) => (
                                                    <motion.div
                                                        key={level}
                                                        initial={{ width: 0 }}
                                                        animate={{ width: "25%" }}
                                                        className={`h-full ${strength >= level ? strengthColors[strength] : "bg-transparent"} transition-colors duration-300`}
                                                    />
                                                ))}
                                            </div>
                                        </motion.div>
                                    )}
                                </div>

                                <div className="relative">
                                    <GlassInput
                                        id="confirm-password"
                                        type="password"
                                        label="Confirm Password"
                                        placeholder="••••••••"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        required
                                        error={passwordsMatch === false ? "Passwords must match" : ""}
                                    />

                                    {/* Match Indicator */}
                                    <AnimatePresence>
                                        {passwordsMatch && (
                                            <motion.div
                                                initial={{ opacity: 0, scale: 0.5 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                exit={{ opacity: 0, scale: 0.5 }}
                                                className="absolute right-4 top-[44px] text-green-400"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                                                </svg>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
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
                                            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl mt-2 backdrop-blur-md">
                                                <ErrorText error={error} className="!mt-0" />
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                <GlassButton
                                    type="submit"
                                    disabled={isLoading || (confirmPassword.length > 0 && !passwordsMatch)}
                                    className="w-full flex justify-center mt-6 !bg-white/20 hover:!bg-white/30 border-white/40 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isLoading ? (
                                        <motion.div
                                            animate={{ rotate: 360 }}
                                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                            className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                                        />
                                    ) : (
                                        "Create Account"
                                    )}
                                </GlassButton>
                            </form>

                            <p className="text-center text-sm text-white/60 mt-6">
                                Already have an account?{" "}
                                <Link href="/login" className="text-white hover:underline transition-all">
                                    Sign in
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
                                strokeWidth={3}
                                stroke="currentColor"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </motion.svg>
                        </div>
                        <h2 className="text-3xl font-bold mb-2">Registration Successful!</h2>
                        <p className="text-white/70">Welcome to TiXX, {name}!</p>
                    </motion.div>
                )}
            </AnimatePresence>
        </main>
    );
}
