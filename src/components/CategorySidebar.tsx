// src/components/menu/CategorySidebar.tsx
"use client";

import React, { useState, useEffect } from "react";
import { db } from "@/src/lib/firebase";
import { collection, query, onSnapshot, Timestamp } from "firebase/firestore";

interface Category {
  id: string;
  name: string;
  imageUrl?: string;
  createdAt?: Timestamp | null;
}

interface Props {
  activeCategory: string;
  onCategoryChange: (id: string) => void;
}

export const CategorySidebar: React.FC<Props> = ({
  activeCategory,
  onCategoryChange,
}) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, "categories"));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const fetchedCategories: Category[] = snapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            name: data.name || "Unnamed Category",
            imageUrl: data.imageUrl || "",
            createdAt: data.createdAt ?? null,
          };
        });

        // Sort newest first
        fetchedCategories.sort((a, b) => {
          const aTime = a.createdAt ? a.createdAt.toMillis() : 0;
          const bTime = b.createdAt ? b.createdAt.toMillis() : 0;
          return bTime - aTime;
        });

        setCategories(fetchedCategories);
        setLoading(false);

        // Auto-select first category if none selected
        if (fetchedCategories.length > 0 && !activeCategory) {
          onCategoryChange(fetchedCategories[0].id);
        }
      },
      (error) => {
        console.error("Error fetching categories:", error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [activeCategory, onCategoryChange]);

  // Skeleton for loading state
  const SkeletonItem = () => (
    <div className="flex flex-col items-center py-3 mb-2 animate-pulse">
      <div className="w-14 h-14 bg-gray-300 rounded-lg" />
      <div className="h-3 bg-gray-300 rounded w-20 mt-2" />
    </div>
  );

  return (
    <aside className="w-24 sm:w-40 md:w-32 sticky top-28 h-[calc(100vh-8rem)] overflow-y-auto bg-linear-to-r from-red-950 via-red-800 to-red-700 border-r rounded-xl shadow-sm p-2 scrollbar-thin">
      {loading || categories.length === 0 ? (
        // Show 6 skeleton items while loading or empty
        Array(6).fill(0).map((_, i) => <SkeletonItem key={i} />)
      ) : (
        categories.map((cat) => (
          <div
            key={cat.id}
            onClick={() => onCategoryChange(cat.id)}
            className={`flex flex-col items-center cursor-pointer rounded-xl px-8 py-2 mb-2 transition-all border ${
              activeCategory === cat.id
                ? "bg-orange-100 border-orange-400 shadow-lg scale-110"
                : "hover:bg-gray-50 border-transparent"
            }`}
          >
            <div className="w-14 h-14 rounded-lg overflow-hidden bg-gray-200 shadow-sm">
              <img
                src={cat.imageUrl || "/placeholder.svg"}
                alt={cat.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.src = "/placeholder.svg";
                }}
              />
            </div>
            <span className="text-xs sm:text-sm font-semibold text-center mt-1 uppercase tracking-wider text-gray-800 ">
              {cat.name}
            </span>
          </div>
        ))
      )}
    </aside>
  );
};