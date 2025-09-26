'use client';

import { useEffect, useState } from 'react';
import { sdk } from '@farcaster/miniapp-sdk'

export default function Home() {
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    const initializeSdk = async () => {
      await sdk.actions.ready();
    };
    initializeSdk();
  }, []);

  const copyToClipboard = async (text: string, id: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const commands = [
    {
      id: 'create',
      title: '1. Create a new repository from this template',
      command: 'gh repo create your-new-repo --template uratmangun/nextjs-mcp --public --clone',
      description: 'Creates a new public repository using this as a template and clones it locally'
    },
    {
      id: 'clone',
      title: '2. Or clone an existing repository created from this template',
      command: 'gh repo clone username/your-repo-name',
      description: 'Clones an existing repository to your local machine'
    },
    {
      id: 'make-public',
      title: '3. Make an existing repository public (if needed)',
      command: 'gh repo edit --visibility public',
      description: 'Changes repository visibility to public (run inside the repo directory)'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800 p-8">
      <div className="max-w-4xl mx-auto">
        <header className="text-center mb-12">
          <h1 className="text-4xl font-bold text-slate-800 dark:text-slate-100 mb-4">
            Next.js MCP Template
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-300">
            Use this to create your next Next.js MCP apps
          </p>
        </header>

        <div className="space-y-6">
          {commands.map((cmd) => (
            <div
              key={cmd.id}
              className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 border border-slate-200 dark:border-slate-700"
            >
              <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-100 mb-3">
                {cmd.title}
              </h3>
              <p className="text-slate-600 dark:text-slate-300 mb-4">
                {cmd.description}
              </p>
              <div className="relative">
                <pre className="bg-slate-900 dark:bg-slate-950 text-green-400 p-4 rounded-lg overflow-x-auto font-mono text-sm">
                  <code>{cmd.command}</code>
                </pre>
                <button
                  onClick={() => copyToClipboard(cmd.command, cmd.id)}
                  className="absolute top-2 right-2 bg-slate-700 hover:bg-slate-600 text-white px-3 py-1 rounded text-xs transition-colors"
                >
                  {copied === cmd.id ? '✓ Copied!' : 'Copy'}
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 bg-blue-50 dark:bg-blue-900/20 rounded-xl p-6 border border-blue-200 dark:border-blue-800">
          <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-200 mb-3">
            📋 Prerequisites
          </h3>
          <ul className="space-y-2 text-blue-700 dark:text-blue-300">
            <li>• Install GitHub CLI: <code className="bg-blue-100 dark:bg-blue-800 px-2 py-1 rounded">brew install gh</code> or <code className="bg-blue-100 dark:bg-blue-800 px-2 py-1 rounded">winget install GitHub.cli</code></li>
            <li>• Authenticate: <code className="bg-blue-100 dark:bg-blue-800 px-2 py-1 rounded">gh auth login</code></li>
            <li>• Replace <code className="bg-blue-100 dark:bg-blue-800 px-2 py-1 rounded">your-new-repo</code> and <code className="bg-blue-100 dark:bg-blue-800 px-2 py-1 rounded">username/your-repo-name</code> with actual names</li>
          </ul>
        </div>

        <footer className="text-center mt-12 text-slate-500 dark:text-slate-400">
          <p>After creating your repository, run <code className="bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">pnpm dev</code> to start development!</p>
        </footer>
      </div>
    </div>
  );
}
