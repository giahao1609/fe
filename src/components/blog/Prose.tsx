"use client";

import React from "react";

export default function Prose({ children }: { children: React.ReactNode }) {
  return (
    <div className="prose prose-rose max-w-none prose-headings:font-semibold prose-img:rounded-2xl prose-a:text-rose-700 hover:prose-a:text-rose-800">
      {children}
    </div>
  );
}
