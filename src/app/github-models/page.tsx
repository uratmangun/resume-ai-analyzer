'use client';

import { useEffect, useState } from 'react';
import { SignedIn, SignedOut, SignInButton, UserButton } from '@/components/auth/AuthUI';
import Link from 'next/link';

type GitHubModel = {
  name: string;
  id: string;
  publisher?: {
    name: string;
    url?: string;
  };
  description?: string;
  capabilities?: string[];
  rate_limits?: {
    requests_per_minute?: number;
    requests_per_day?: number;
  };
};

export default function GitHubModelsPage() {
  const [models, setModels] = useState<GitHubModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchModels() {
      try {
        const response = await fetch('/api/github-models');
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.error || 'Failed to fetch models');
        }
        
        setModels(data.models || []);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchModels();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800 p-8">
      <div className="max-w-6xl mx-auto">
        <header className="flex items-center justify-between mb-12">
          <div className="flex-1">
            <h1 className="text-4xl font-bold text-slate-800 dark:text-slate-100 mb-2">
              GitHub Models
            </h1>
            <p className="text-lg text-slate-600 dark:text-slate-300">
              Browse available AI models from GitHub Marketplace
            </p>
          </div>
          <div className="ml-4 flex items-center gap-4">
            <Link
              href="/"
              className="text-sm font-medium text-sky-600 hover:text-sky-700"
            >
              ← Back to Home
            </Link>
            <SignedIn>
              <UserButton afterSignOutUrl="/" />
            </SignedIn>
            <SignedOut>
              <SignInButton mode="modal">
                <button className="inline-flex items-center rounded-lg bg-sky-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-sky-700">
                  Sign in
                </button>
              </SignInButton>
            </SignedOut>
          </div>
        </header>

        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg p-8">
          {loading && (
            <div className="text-center py-12">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-sky-600 border-r-transparent"></div>
              <p className="mt-4 text-slate-600 dark:text-slate-300">Loading models...</p>
            </div>
          )}

          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
              <h3 className="text-red-800 dark:text-red-200 font-semibold mb-2">Error</h3>
              <p className="text-red-600 dark:text-red-300">{error}</p>
            </div>
          )}

          {!loading && !error && models.length === 0 && (
            <div className="text-center py-12">
              <p className="text-slate-600 dark:text-slate-300">No models found</p>
            </div>
          )}

          {!loading && !error && models.length > 0 && (
            <>
              <div className="mb-6">
                <p className="text-sm text-slate-600 dark:text-slate-300">
                  Found <span className="font-semibold text-sky-600">{models.length}</span> models
                </p>
              </div>

              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {models.map((model) => (
                  <div
                    key={model.id || model.name}
                    className="border border-slate-200 dark:border-slate-700 rounded-lg p-5 hover:shadow-lg transition-shadow bg-slate-50 dark:bg-slate-900/50"
                  >
                    <div className="mb-3">
                      <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-50 mb-1">
                        {model.name}
                      </h3>
                      {model.publisher && (
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                          by {model.publisher.name}
                        </p>
                      )}
                    </div>

                    {model.description && (
                      <p className="text-sm text-slate-600 dark:text-slate-300 mb-3 line-clamp-3">
                        {model.description}
                      </p>
                    )}

                    {model.capabilities && model.capabilities.length > 0 && (
                      <div className="mb-3">
                        <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-2">
                          Capabilities:
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {model.capabilities.map((cap) => (
                            <span
                              key={cap}
                              className="px-2 py-1 text-xs rounded-full bg-sky-100 dark:bg-sky-900/30 text-sky-700 dark:text-sky-300"
                            >
                              {cap}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {model.rate_limits && (
                      <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700">
                        <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
                          Rate Limits:
                        </p>
                        <div className="text-xs text-slate-600 dark:text-slate-300 space-y-1">
                          {model.rate_limits.requests_per_minute && (
                            <div>• {model.rate_limits.requests_per_minute} req/min</div>
                          )}
                          {model.rate_limits.requests_per_day && (
                            <div>• {model.rate_limits.requests_per_day} req/day</div>
                          )}
                        </div>
                      </div>
                    )}

                    <div className="mt-4">
                      <code className="text-xs bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded text-slate-700 dark:text-slate-300">
                        {model.id || model.name}
                      </code>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
