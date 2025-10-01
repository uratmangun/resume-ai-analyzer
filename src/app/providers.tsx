"use client";

import { ClerkProvider } from "@clerk/nextjs";
import React from "react";
import { Toaster } from "sonner";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      {children}
      <Toaster position="top-right" richColors duration={Infinity} closeButton />
    </ClerkProvider>
  );
}
