// src/components/loaders/BiryaniLoader.tsx
"use client";

import {
  CookingPot,
  Soup,
  UtensilsCrossed,
  Flame,
  Microwave,
  Loader2,
  HandPlatter,
} from "lucide-react";

export default function BiryaniLoader() {
  return (
    <div className="fixed inset-0 min-h-screen bg-linear-to-br from-amber-50 via-orange-50 to-yellow-100 flex flex-col items-center justify-center z-50">
      {/* Floating Food Icons — Biryani Highlight */}
      <div className="relative w-64 h-48">
        {/* Main Biryani Pot (HIGHLIGHT) */}
        <CookingPot
          className="absolute top-6 left-20 w-20 h-20 text-orange-700 animate-bounce drop-shadow-[0_0_12px_rgba(234,88,12,0.6)]"
        />

        {/* Supporting food icons */}
        <Soup className="absolute top-4 left-4 w-12 h-12 text-amber-600 animate-bounce [animation-delay:200ms]" />
        <UtensilsCrossed className="absolute top-12 right-4 w-14 h-14 text-yellow-700 animate-bounce [animation-delay:400ms]" />
        <Flame className="absolute bottom-6 left-8 w-12 h-12 text-red-600 animate-bounce [animation-delay:600ms]" />
      </div>

      {/* Dum / Oven Cooking Animation */}
      <div className="mt-2 flex items-center gap-3">
        {/* <div className="w-32 h-20 bg-linear-to-r from-orange-500 to-red-700 rounded-lg shadow-2xl relative overflow-hidden"> */}
          <div className="absolute inset-0 bg-linear-to-t from-orange-600/60 to-transparent animate-pulse" />

          {/* Microwave → Dum Pot Effect */}
          {/* <Microwave className="absolute inset-0 m-auto w-28 h-20 text-yellow-200 opacity-80" /> */}
          <HandPlatter className="absolute inset-0 m-auto w-42 h-28 py-2 text-red-500 opacity-80" />

          {/* Heat layer */}
          <div className="absolute inset-x-0 bottom-0 h-8 bg-orange-500/40 animate-pulse [animation-delay:300ms]" />
        {/* </div> */}
      </div>

      {/* Text */}
      <div className="mt-8 text-center">
        <p className="text-3xl font-bold text-orange-800 tracking-wide animate-pulse">
          Just getting your Lazeeez Biryani...
        </p>
        <p className="text-lg text-amber-700 mt-2">
          Slow-cooked on dum for perfect flavour
        </p>
      </div>

      {/* Loading dots */}
      <div className="flex gap-2 mt-6">
        {[0, 150, 300].map((delay) => (
          <div
            key={delay}
            className="w-3 h-3 bg-orange-600 rounded-full animate-bounce"
            style={{ animationDelay: `${delay}ms` }}
          />
        ))}
      </div>
    </div>
  );
}
