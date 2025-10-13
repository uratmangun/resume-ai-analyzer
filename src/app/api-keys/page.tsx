'use client';

import { useEffect, useState } from 'react';
import { SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/nextjs';
import Link from 'next/link';
import { toast } from 'sonner';

type ApiKey = {
  id: string;
  name: string;
  key: string;
  lastUsed: string | null;
  createdAt: string;
};

export default function ApiKeysPage() {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [revealedKeys, setRevealedKeys] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchApiKeys();
  }, []);

  const fetchApiKeys = async () => {
    try {
      const response = await fetch('/api/api-keys');
      if (response.ok) {
        const data = await response.json();
        setApiKeys(data);
      }
    } catch (error) {
      console.error('Failed to fetch API keys:', error);
      toast.error('Failed to load API keys');
    } finally {
      setIsLoading(false);
    }
  };

  const createApiKey = async () => {
    if (!newKeyName.trim()) {
      toast.error('Please enter a name for the API key');
      return;
    }

    setIsCreating(true);
    try {
      const response = await fetch('/api/api-keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newKeyName }),
      });

      if (response.ok) {
        const newKey = await response.json();
        setApiKeys([newKey]);
        setNewKeyName('');
        setShowCreateDialog(false);
        toast.success('API key created successfully');
        // Reveal the newly created key
        setRevealedKeys(new Set([newKey.id]));
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || 'Failed to create API key');
      }
    } catch (error) {
      console.error('Failed to create API key:', error);
      toast.error('Failed to create API key');
    } finally {
      setIsCreating(false);
    }
  };

  const deleteApiKey = async (id: string) => {
    if (!confirm('Are you sure you want to delete this API key? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`/api/api-keys/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setApiKeys(apiKeys.filter((key) => key.id !== id));
        toast.success('API key deleted successfully');
      } else {
        toast.error('Failed to delete API key');
      }
    } catch (error) {
      console.error('Failed to delete API key:', error);
      toast.error('Failed to delete API key');
    }
  };

  const toggleKeyVisibility = (id: string) => {
    const newRevealed = new Set(revealedKeys);
    if (newRevealed.has(id)) {
      newRevealed.delete(id);
    } else {
      newRevealed.add(id);
    }
    setRevealedKeys(newRevealed);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('API key copied to clipboard');
  };

  const maskKey = (key: string) => {
    if (key.length <= 8) return '••••••••';
    return `${key.substring(0, 4)}${'•'.repeat(key.length - 8)}${key.substring(key.length - 4)}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <header className="sticky top-0 bg-white/80 backdrop-blur-md z-10 border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <Link href="/" className="text-2xl font-bold bg-gradient-to-r from-sky-600 to-blue-600 bg-clip-text text-transparent">
                Resume AI
              </Link>
              <nav className="flex items-center gap-4">
                <Link href="/" className="text-sm font-medium text-slate-600 hover:text-slate-900">
                  Home
                </Link>
                <Link href="/resumes" className="text-sm font-medium text-slate-600 hover:text-slate-900">
                  My Resumes
                </Link>
                <Link href="/api-keys" className="text-sm font-medium text-sky-600 hover:text-sky-700">
                  API Keys
                </Link>
              </nav>
            </div>
            <div className="flex items-center gap-4">
              <SignedIn>
                <UserButton />
              </SignedIn>
              <SignedOut>
                <SignInButton mode="modal">
                  <button className="px-4 py-2 rounded-lg bg-sky-600 text-white hover:bg-sky-700 transition-colors">
                    Sign In
                  </button>
                </SignInButton>
              </SignedOut>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-12">
        <SignedIn>
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-bold text-black">API Keys</h1>
                <p className="text-black mt-2">Manage your API key for programmatic access (one key per user)</p>
              </div>
              {apiKeys.length === 0 && (
                <button
                  onClick={() => setShowCreateDialog(true)}
                  className="px-6 py-3 rounded-lg bg-sky-600 text-white hover:bg-sky-700 transition-colors font-medium shadow-lg shadow-sky-500/30"
                >
                  + Create API Key
                </button>
              )}
            </div>

            {showCreateDialog && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                <div className="bg-white rounded-xl shadow-2xl p-8 max-w-md w-full mx-4">
                  <h2 className="text-2xl font-bold text-black mb-4">Create New API Key</h2>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-black mb-2">
                        Key Name
                      </label>
                      <input
                        type="text"
                        value={newKeyName}
                        onChange={(e) => setNewKeyName(e.target.value)}
                        placeholder="e.g., Production API Key"
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent text-black"
                        disabled={isCreating}
                      />
                    </div>
                    <div className="flex gap-3">
                      <button
                        onClick={() => {
                          setShowCreateDialog(false);
                          setNewKeyName('');
                        }}
                        className="flex-1 px-4 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 transition-colors"
                        disabled={isCreating}
                      >
                        Cancel
                      </button>
                      <button
                        onClick={createApiKey}
                        disabled={isCreating || !newKeyName.trim()}
                        className="flex-1 px-4 py-2 rounded-lg bg-sky-600 text-white hover:bg-sky-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isCreating ? 'Creating...' : 'Create'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
              {isLoading ? (
                <div className="p-12 text-center text-slate-500">Loading API keys...</div>
              ) : apiKeys.length === 0 ? (
                <div className="p-12 text-center">
                  <p className="text-slate-500 mb-4">No API keys yet</p>
                  <button
                    onClick={() => setShowCreateDialog(true)}
                    className="px-6 py-2 rounded-lg bg-sky-600 text-white hover:bg-sky-700 transition-colors"
                  >
                    Create your first API key
                  </button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-slate-50 border-b border-slate-200">
                      <tr>
                        <th className="text-left px-6 py-4 text-sm font-semibold text-black">Name</th>
                        <th className="text-left px-6 py-4 text-sm font-semibold text-black">API Key</th>
                        <th className="text-left px-6 py-4 text-sm font-semibold text-black">Last Used</th>
                        <th className="text-left px-6 py-4 text-sm font-semibold text-black">Created</th>
                        <th className="text-right px-6 py-4 text-sm font-semibold text-black">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {apiKeys.map((apiKey) => (
                        <tr key={apiKey.id} className="hover:bg-slate-50 transition-colors">
                          <td className="px-6 py-4 text-sm font-medium text-black">
                            {apiKey.name}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <code className="text-sm font-mono text-black bg-slate-100 px-3 py-1 rounded">
                                {revealedKeys.has(apiKey.id) ? apiKey.key : maskKey(apiKey.key)}
                              </code>
                              <button
                                onClick={() => toggleKeyVisibility(apiKey.id)}
                                className="text-slate-500 hover:text-slate-700 text-xs"
                                title={revealedKeys.has(apiKey.id) ? 'Hide' : 'Show'}
                              >
                                {revealedKeys.has(apiKey.id) ? '👁️' : '👁️‍🗨️'}
                              </button>
                              <button
                                onClick={() => copyToClipboard(apiKey.key)}
                                className="text-slate-500 hover:text-slate-700 text-xs"
                                title="Copy to clipboard"
                              >
                                📋
                              </button>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-black">
                            {apiKey.lastUsed
                              ? new Date(apiKey.lastUsed).toLocaleDateString()
                              : 'Never'}
                          </td>
                          <td className="px-6 py-4 text-sm text-black">
                            {new Date(apiKey.createdAt).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 text-right">
                            <button
                              onClick={() => deleteApiKey(apiKey.id)}
                              className="text-red-600 hover:text-red-700 text-sm font-medium"
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </SignedIn>

        <SignedOut>
          <div className="text-center py-20">
            <h1 className="text-4xl font-bold text-black mb-4">Sign in to manage API keys</h1>
            <p className="text-black mb-8">You need to be signed in to access this page</p>
            <SignInButton mode="modal">
              <button className="px-6 py-3 rounded-lg bg-sky-600 text-white hover:bg-sky-700 transition-colors">
                Sign In
              </button>
            </SignInButton>
          </div>
        </SignedOut>
      </main>
    </div>
  );
}

