'use client';

import { useEffect, useState } from 'react';
import { SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/nextjs';
import Link from 'next/link';

type Resume = {
  id: string;
  title: string;
  name: string;
  email: string;
  createdAt: string;
  updatedAt: string;
};

export default function ResumesPage() {
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchResumes() {
      try {
        const res = await fetch('/api/resumes');
        if (res.ok) {
          const data = await res.json();
          setResumes(data.resumes || []);
        }
      } catch (error) {
        console.error('Failed to fetch resumes:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchResumes();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800 p-8">
      <div className="max-w-6xl mx-auto">
        <header className="flex items-center justify-between mb-12">
          <div>
            <h1 className="text-4xl font-bold text-slate-800 dark:text-slate-100 mb-1">
              My Resumes
            </h1>
            <p className="text-lg text-slate-600 dark:text-slate-300">
              Manage and edit your resume drafts
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="inline-flex items-center rounded-lg bg-sky-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-sky-400"
            >
              + New Resume
            </Link>
            <SignedIn>
              <UserButton afterSignOutUrl="/" />
            </SignedIn>
          </div>
        </header>

        <SignedOut>
          <section className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg p-8 text-center">
            <h2 className="text-2xl font-semibold text-slate-800 dark:text-slate-100 mb-3">Sign in required</h2>
            <p className="text-slate-600 dark:text-slate-300 mb-6">Please sign in to view your resumes.</p>
            <SignInButton mode="modal">
              <button className="inline-flex items-center rounded-lg bg-sky-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-sky-400">
                Sign in to continue
              </button>
            </SignInButton>
          </section>
        </SignedOut>

        <SignedIn>
          {loading ? (
            <div className="text-center py-12">
              <p className="text-slate-500 dark:text-slate-400">Loading your resumes...</p>
            </div>
          ) : resumes.length === 0 ? (
            <section className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg p-12 text-center">
              <h2 className="text-2xl font-semibold text-slate-800 dark:text-slate-100 mb-3">No resumes yet</h2>
              <p className="text-slate-600 dark:text-slate-300 mb-6">Create your first resume to get started</p>
              <Link
                href="/"
                className="inline-flex items-center rounded-lg bg-sky-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-sky-400"
              >
                Create First Resume
              </Link>
            </section>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {resumes.map((resume) => (
                <Link
                  key={resume.id}
                  href={`/?id=${resume.id}`}
                  className="block bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg p-6 transition hover:shadow-xl hover:border-sky-400"
                >
                  <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-50 mb-2">
                    {resume.title}
                  </h3>
                  <div className="text-sm text-slate-600 dark:text-slate-300 mb-4">
                    <p className="truncate">{resume.name}</p>
                    <p className="truncate">{resume.email}</p>
                  </div>
                  <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                    <span>
                      Created: {new Date(resume.createdAt).toLocaleDateString()}
                    </span>
                    <span className="text-sky-600 dark:text-sky-400 font-medium">
                      Edit →
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </SignedIn>
      </div>
    </div>
  );
}
