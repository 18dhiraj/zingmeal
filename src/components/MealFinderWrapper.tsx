"use client";

import dynamic from "next/dynamic";

const MealFinderClient = dynamic(() => import("./MealFinderClient"), {
  ssr: false,
});

export default function MealFinderWrapper() {
  return <MealFinderClient />;
}
