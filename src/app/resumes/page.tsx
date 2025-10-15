'use client';

import { useEffect, useState } from 'react';
import { SignedIn, SignedOut, SignInButton, UserButton } from '@/components/auth/AuthUI';
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

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete "${title}"? This action cannot be undone.`)) {
      return;
    }

    try {
      const res = await fetch(`/api/resumes/${id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        setResumes((prev) => prev.filter((r) => r.id !== id));
      } else {
        alert('Failed to delete resume. Please try again.');
      }
    } catch (error) {
      console.error('Failed to delete resume:', error);
      alert('Failed to delete resume. Please try again.');
    }
  };

  const handleUseTemplate = async (id: string, title: string) => {
    try {
      // Fetch the original resume
      const res = await fetch(`/api/resumes/${id}`);
      if (!res.ok) {
        alert('Failed to load template. Please try again.');
        return;
      }

      const template = await res.json();

      // Store template data in localStorage temporarily
      const templateData = {
        title: `${title} (Copy)`,
        name: template.name || '',
        email: template.email || '',
        github: template.github || '',
        description: template.description || '',
        workHistory: template.workHistory || [],
        projects: template.projects || [],
        achievements: template.achievements || [],
      };

      localStorage.setItem('resumeTemplate', JSON.stringify(templateData));
      
      // Redirect to home page
      window.location.href = '/';
    } catch (error) {
      console.error('Failed to use template:', error);
      alert('Failed to load template. Please try again.');
    }
  };

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
                <div
                  key={resume.id}
                  className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg p-6 transition hover:shadow-xl"
                >
                  <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-50 mb-2">
                    {resume.title}
                  </h3>
                  <div className="text-sm text-slate-600 dark:text-slate-300 mb-4">
                    <p className="truncate">{resume.name}</p>
                    <p className="truncate">{resume.email}</p>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500 dark:text-slate-400">
                        Created: {new Date(resume.createdAt).toLocaleDateString()}
                      </span>
                      <div className="flex items-center gap-3">
                        <Link
                          href={`/resumes/${resume.id}/edit`}
                          className="text-sky-600 dark:text-sky-400 font-medium hover:text-sky-700 dark:hover:text-sky-500 transition"
                        >
                          Edit →
                        </Link>
                        <button
                          onClick={() => handleDelete(resume.id, resume.title)}
                          className="text-red-600 dark:text-red-400 font-medium hover:text-red-700 dark:hover:text-red-500 transition"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => window.open(`/resumes/${resume.id}/print`, '_blank')}
                        className="rounded-md bg-slate-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-slate-700 transition"
                      >
                        Print
                      </button>
                      <button
                        onClick={() => handleUseTemplate(resume.id, resume.title)}
                        className="rounded-md bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-emerald-700 transition"
                      >
                        Use as Template
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </SignedIn>
      </div>
    </div>
  );
}
