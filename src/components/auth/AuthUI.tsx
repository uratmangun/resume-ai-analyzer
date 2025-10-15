"use client";

import React, { useEffect, useState } from "react";

type User = {
  sub: string;
  name?: string;
  email?: string;
  picture?: string;
} | null;

function useAuth() {
  const [user, setUser] = useState<User>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch('/api/auth/session')
      .then(res => res.json())
      .then(data => {
        setUser(data.user);
        setIsLoading(false);
      })
      .catch(() => {
        setUser(null);
        setIsLoading(false);
      });
  }, []);

  return { user, isLoading };
}

export function SignedIn({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  if (isLoading) return null;
  return user ? <>{children}</> : null;
}

export function SignedOut({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  if (isLoading) return null;
  return !user ? <>{children}</> : null;
}

export function SignInButton({ children, mode }: { children: React.ReactNode; mode?: string }) {
  const onClick = () => {
    const returnTo = typeof window !== "undefined" ? window.location.pathname : "/";
    const url = new URL(`/auth/login`, window.location.origin);
    url.searchParams.set("returnTo", returnTo);
    if (mode === "modal") {
      // Auth0 doesn't support modal natively; we ignore but keep API compatible
    }
    window.location.href = url.toString();
  };
  return <span onClick={onClick} role="button">{children}</span>;
}

export function UserButton({ afterSignOutUrl = "/" }: { afterSignOutUrl?: string }) {
  const { user } = useAuth();
  const onLogout = () => {
    // Use full URL (origin + path) for Auth0 logout redirect
    const fullUrl = typeof window !== "undefined" 
      ? `${window.location.origin}${afterSignOutUrl}`
      : "http://localhost:3000/";
    window.location.href = `/auth/logout?returnTo=${encodeURIComponent(fullUrl)}`;
  };
  return (
    <button onClick={onLogout} className="inline-flex items-center rounded-lg bg-slate-200 px-3 py-2 text-sm font-medium text-slate-900 hover:bg-slate-300">
      {user?.name ? `${user.name} · Sign out` : "Sign out"}
    </button>
  );
}
