"use client";

export default function SignUpPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800 p-8">
      <button
        onClick={() => {
          const returnTo = typeof window !== 'undefined' ? '/' : '/';
          const url = new URL('/auth/login', window.location.origin);
          url.searchParams.set('screen_hint', 'signup');
          url.searchParams.set('returnTo', returnTo);
          window.location.href = url.toString();
        }}
        className="inline-flex items-center rounded-lg bg-sky-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-sky-700"
      >
        Sign up with Auth0
      </button>
    </div>
  );
}
