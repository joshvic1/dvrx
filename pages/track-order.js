"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";

export default function TrackOrderIndex() {
  const [code, setCode] = useState("");
  const router = useRouter();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!code.trim()) return;
    router.push(`/track-order/${code.trim()}`);
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center p-6 bg-[var(--background)] transition-colors duration-300">
      <div className="w-full max-w-md rounded-2xl shadow-md p-6 bg-[var(--surface)] text-[var(--text-primary)] transition-colors duration-300">
        <h1 className="text-2xl font-bold text-center mb-4">
          Track Your Order
        </h1>
        <p className="text-[var(--text-secondary)] text-center mb-6">
          Enter your order code to see the latest status.
        </p>

        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            type="text"
            placeholder="Enter order code"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="flex-1 border border-[var(--border)] rounded-lg px-4 py-2 bg-[var(--background-alt)] text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] focus:ring-2 focus:ring-[var(--accent-gold)] focus:outline-none transition-colors duration-300"
          />
          <button
            type="submit"
            className="bg-[var(--accent-gold)] text-[var(--text-primary)] px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-[var(--accent-hover)] transition-colors duration-300"
          >
            <Search size={18} /> Track
          </button>
        </form>
      </div>
    </div>
  );
}
