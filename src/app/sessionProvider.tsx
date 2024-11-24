"use client";
import { SessionProvider } from "next-auth/react";
import { ReactNode } from "react";

export function Session_Provider({ children }: { children: ReactNode }) {
  return (
    <>
      <SessionProvider>{children}</SessionProvider>
    </>
  );
}
