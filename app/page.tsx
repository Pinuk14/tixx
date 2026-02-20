"use client";

import GlassCard from "@/components/ui/GlassCard";

export default function Home() {
  return (
    <main className="min-h-screen flex items-center justify-center">
      <GlassCard className="text-center">
        <h1 className="text-4xl font-bold mb-4">
          TiXX Event Platform
        </h1>
        <p className="text-white/70">
          Cloud-Based Event Registration & Pass Generation
        </p>
      </GlassCard>
    </main>
  );
}