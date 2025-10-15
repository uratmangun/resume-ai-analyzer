"use client";

export default function SignInPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800 p-8">
      <button
        onClick={() => {
          const returnTo = typeof window !== 'undefined' ? window.location.pathname : '/';
          window.location.href = `/auth/login?returnTo=${encodeURIComponent(returnTo)}`;
        }}
        className="inline-flex items-center rounded-lg bg-sky-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-sky-700"
      >
        Sign in with Auth0
      </button>
    </div>
  );
}
