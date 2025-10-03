'use client';

import { useEffect, useState, ChangeEvent, FormEvent, Suspense } from 'react';
import { sdk } from '@farcaster/miniapp-sdk'
import { SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';
import { toast } from 'sonner';

type WorkHistoryEntry = {
  companyName: string;
  role: string;
  dateOfWork: string;
  description: string;
};

type ProjectEntry = {
  projectName: string;
  projectUrl: string;
  projectDescription: string;
};

type AchievementEntry = {
  achievementName: string;
  achievementUrl: string;
  achievementDescription: string;
};

function HomeContent() {
  const router = useRouter();
  

  const [formData, setFormData] = useState({
    title: '',
    name: '',
    description: '',
    email: '',
    github: '',
    workHistory: [{ companyName: '', role: '', dateOfWork: '', description: '' }] as WorkHistoryEntry[],
    projects: [{ projectName: '', projectUrl: '', projectDescription: '' }] as ProjectEntry[],
    achievements: [{ achievementName: '', achievementUrl: '', achievementDescription: '' }] as AchievementEntry[]
  });
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [apiKeys, setApiKeys] = useState<Array<{ id: string; key: string; name: string }>>([]);
  

  // AI modal state for description editing mock
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);
  const [translateFromLanguage, setTranslateFromLanguage] = useState('');
  const [translateToLanguage, setTranslateToLanguage] = useState('');
  const [aiEditedText, setAiEditedText] = useState('');
  const [aiEditMode, setAiEditMode] = useState<'proofread' | 'translate'>('proofread');
  const [currentField, setCurrentField] = useState<{
    type: 'description' | 'workHistory' | 'project' | 'achievement';
    index?: number;
  }>({ type: 'description' });

  // AI chat hook for proofreading
  const { sendMessage: sendProofreadMessage, status: proofreadStatus } = useChat({
    id: 'ai-proofread',
    transport: new DefaultChatTransport({
      api: '/api/ai-proofread',
    }),
    onFinish: (result) => {
      const lastMessage = result.messages[result.messages.length - 1];
      if (lastMessage && lastMessage.role === 'assistant') {
        let text = lastMessage.parts
          .filter((part) => part.type === 'text')
          .map((part) => (part.type === 'text' ? part.text : ''))
          .join('')
          .trim();

        setAiEditedText(text);
      }
    },
    onError: (error) => {
      console.error('AI proofread error:', error);
      toast.error('Proofread Failed', {
        description: error?.message || 'Failed to proofread text. Please try again.',
      });
      setAiEditedText('Proofreading failed. Please try again.');
    },
  });

  // AI chat hook for translating
  const { sendMessage: sendTranslateMessageRaw, status: translateStatus } = useChat({
    id: 'ai-translate',
    transport: new DefaultChatTransport({
      api: '/api/ai-translate',
    }),
    onFinish: (result) => {
      const lastMessage = result.messages[result.messages.length - 1];
      if (lastMessage && lastMessage.role === 'assistant') {
        let text = lastMessage.parts
          .filter((part) => part.type === 'text')
          .map((part) => (part.type === 'text' ? part.text : ''))
          .join('')
          .trim();

        setAiEditedText(text);
      }
    },
  });

  const isEditingText = proofreadStatus === 'submitted' || proofreadStatus === 'streaming' || translateStatus === 'submitted' || translateStatus === 'streaming';

  useEffect(() => {
    const initializeSdk = async () => {
      await sdk.actions.ready();
    };
    initializeSdk();

    // Check for template data in localStorage
    const templateData = localStorage.getItem('resumeTemplate');
    if (templateData) {
      try {
        const data = JSON.parse(templateData);
        setFormData(data);
        localStorage.removeItem('resumeTemplate'); // Clear after loading
      } catch (error) {
        console.error('Failed to load template data:', error);
      }
    }
  }, []);

  // Fetch API keys
  useEffect(() => {
    const fetchApiKeys = async () => {
      try {
        const response = await fetch('/api/api-keys');
        if (response.ok) {
          const data = await response.json();
          setApiKeys(Array.isArray(data) ? data : []);
        }
      } catch (error) {
        console.error('Failed to fetch API keys:', error);
      }
    };
    fetchApiKeys();
  }, []);

  const copyMcpUrl = () => {
    const firstApiKey = apiKeys[0]?.key;
    if (!firstApiKey) {
      toast.error('No API Key', {
        description: 'Please create an API key first.',
      });
      return;
    }
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
    const mcpUrl = `${baseUrl}/mcp?api-key=${firstApiKey}`;
    navigator.clipboard.writeText(mcpUrl);
    toast.success('Copied!', {
      description: 'MCP URL copied to clipboard.',
    });
  };

  

  type ScalarField = 'title' | 'name' | 'description' | 'email' | 'github';
  type WorkField = 'companyName' | 'role' | 'dateOfWork' | 'description';
  type ProjectField = 'projectName' | 'projectUrl' | 'projectDescription';
  type AchievementField = 'achievementName' | 'achievementUrl' | 'achievementDescription';

  const handleChange = (
    field: ScalarField,
  ) => (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({
      ...prev,
      [field]: event.target.value,
    }));
  };


  const handleWorkChange = (
    index: number,
    field: WorkField,
  ) => (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const value = event.target.value;
    setFormData((prev) => {
      const updated = [...prev.workHistory];
      updated[index] = { ...updated[index], [field]: value };
      return {
        ...prev,
        workHistory: updated,
      };
    });
  };

  const handleProjectChange = (
    index: number,
    field: ProjectField,
  ) => (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const value = event.target.value;
    setFormData((prev) => {
      const updated = [...prev.projects];
      updated[index] = { ...updated[index], [field]: value };
      return {
        ...prev,
        projects: updated,
      };
    });
  };

  const handleAchievementChange = (
    index: number,
    field: AchievementField,
  ) => (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const value = event.target.value;
    setFormData((prev) => {
      const updated = [...prev.achievements];
      updated[index] = { ...updated[index], [field]: value };
      return {
        ...prev,
        achievements: updated,
      };
    });
  };


  const addWorkEntry = () => {
    setFormData((prev) => ({
      ...prev,
      workHistory: [...prev.workHistory, { companyName: '', role: '', dateOfWork: '', description: '' }],
    }));
  };

  const addProjectEntry = () => {
    setFormData((prev) => ({
      ...prev,
      projects: [...prev.projects, { projectName: '', projectUrl: '', projectDescription: '' }],
    }));
  };

  const addAchievementEntry = () => {
    setFormData((prev) => ({
      ...prev,
      achievements: [...prev.achievements, { achievementName: '', achievementUrl: '', achievementDescription: '' }],
    }));
  };


  const removeWorkEntry = (index: number) => () => {
    setFormData((prev) => {
      if (prev.workHistory.length === 1) return prev;
      const updated = prev.workHistory.filter((_, idx) => idx !== index);
      return {
        ...prev,
        workHistory: updated,
      };
    });
  };

  const removeProjectEntry = (index: number) => () => {
    setFormData((prev) => {
      if (prev.projects.length === 1) return prev;
      const updated = prev.projects.filter((_, idx) => idx !== index);
      return {
        ...prev,
        projects: updated,
      };
    });
  };

  const removeAchievementEntry = (index: number) => () => {
    setFormData((prev) => {
      if (prev.achievements.length === 1) return prev;
      const updated = prev.achievements.filter((_, idx) => idx !== index);
      return {
        ...prev,
        achievements: updated,
      };
    });
  };

  // Mock actions for AI modal
  const openAIModal = (type: 'description' | 'workHistory' | 'project' | 'achievement', index?: number) => {
    setCurrentField({ type, index });
    setAiEditedText('');
    setIsAIModalOpen(true);
  };
  const closeAIModal = () => setIsAIModalOpen(false);
  
  const getCurrentText = () => {
    if (currentField.type === 'description') return formData.description;
    if (currentField.type === 'workHistory' && currentField.index !== undefined) {
      return formData.workHistory[currentField.index]?.description || '';
    }
    if (currentField.type === 'project' && currentField.index !== undefined) {
      return formData.projects[currentField.index]?.projectDescription || '';
    }
    if (currentField.type === 'achievement' && currentField.index !== undefined) {
      return formData.achievements[currentField.index]?.achievementDescription || '';
    }
    return '';
  };
  
  const handleProofread = () => {
    const base = getCurrentText()?.trim();
    if (!base) {
      setAiEditedText('No text provided.');
      return;
    }
    setAiEditMode('proofread');
    sendProofreadMessage({ text: base });
  };
  const handleTranslate = async () => {
    const base = getCurrentText()?.trim();
    if (!base) {
      setAiEditedText('No text provided.');
      return;
    }
    setAiEditMode('translate');
    
    // Manually call the API with current language values
    try {
      const response = await fetch('/api/ai-translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{
            id: Date.now().toString(),
            role: 'user',
            parts: [{ type: 'text', text: base }]
          }],
          fromLanguage: translateFromLanguage,
          toLanguage: translateToLanguage,
        }),
      });

      if (!response.ok) throw new Error('Translation failed');
      
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let result = '';
      let buffer = '';

      if (reader) {
        setAiEditedText('Translating...');
        
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() || ''; // Keep incomplete line in buffer
          
          for (const line of lines) {
            if (!line.trim() || line === 'data: [DONE]') continue;
            
            // Parse Server-Sent Events format
            if (line.startsWith('data: ')) {
              const jsonStr = line.substring(6); // Remove 'data: ' prefix
              try {
                const data = JSON.parse(jsonStr);
                
                // Handle errors in stream
                if (data.type === 'error') {
                  toast.error('Translation Error', {
                    description: data.errorText || 'An error occurred during translation',
                  });
                  setAiEditedText('Translation failed. Please try again.');
                  return;
                }
                
                // Handle text-delta events for streaming translation
                if (data.type === 'text-delta' && data.delta) {
                  result += data.delta;
                  setAiEditedText(result);
                }
              } catch (e) {
                console.error('Parse error:', e, 'Line:', jsonStr);
              }
            }
          }
        }
      }
    } catch (error: any) {
      console.error('Translation error:', error);
      toast.error('Translation Failed', {
        description: error?.message || 'An unexpected error occurred',
      });
      setAiEditedText('Translation failed. Please try again.');
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatusMessage('Saving resume...');

    try {
      const payload = {
        title: formData.title || 'Untitled Resume',
        name: formData.name,
        email: formData.email,
        github: formData.github,
        description: formData.description,
        workHistory: formData.workHistory.filter((v) => 
          v.companyName.trim().length > 0 || 
          v.role.trim().length > 0 || 
          v.dateOfWork.trim().length > 0 || 
          v.description.trim().length > 0
        ),
        projects: formData.projects.filter((v) => 
          v.projectName.trim().length > 0 || 
          v.projectUrl.trim().length > 0 || 
          v.projectDescription.trim().length > 0
        ),
        achievements: formData.achievements.filter((v) => 
          v.achievementName.trim().length > 0 || 
          v.achievementUrl.trim().length > 0 || 
          v.achievementDescription.trim().length > 0
        ),
      };

      const res = await fetch('/api/resumes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => null);
        throw new Error(err?.error ? JSON.stringify(err.error) : 'Request failed');
      }

      const data = await res.json();
      setStatusMessage(`Resume saved successfully!`);
      
      // Redirect to resumes page after a short delay
      setTimeout(() => {
        router.push('/resumes');
      }, 1500);
    } catch (error: any) {
      console.error(error);
      setStatusMessage(`Error saving resume: ${error?.message ?? 'Unknown error'}`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800 p-8">
      <div className="max-w-4xl mx-auto">
        <header className="flex items-center justify-between mb-12">
          <div className="text-center flex-1">
            <h1 className="text-4xl font-bold text-slate-800 dark:text-slate-100 mb-1">
              Resume AI Creator
            </h1>
            <p className="text-lg text-slate-600 dark:text-slate-300 mb-3">
              create your resume using ai and mcp
            </p>
            <SignedIn>
              <div className="flex items-center justify-center gap-3">
                <Link
                  href="/"
                  onClick={() => { setFormData({ title: '', name: '', description: '', email: '', github: '', workHistory: [{ companyName: '', role: '', dateOfWork: '', description: '' }], projects: [{ projectName: '', projectUrl: '', projectDescription: '' }], achievements: [{ achievementName: '', achievementUrl: '', achievementDescription: '' }] }); }}
                  className="text-sm font-medium text-sky-600 hover:text-sky-700"
                >
                  + New Resume
                </Link>
                <span className="text-slate-300">|</span>
                <Link
                  href="/resumes"
                  className="text-sm font-medium text-sky-600 hover:text-sky-700"
                >
                  My Resumes
                </Link>
                <span className="text-slate-300">|</span>
                <Link
                  href="/api-keys"
                  className="text-sm font-medium text-sky-600 hover:text-sky-700"
                >
                  API Keys
                </Link>
              </div>
            </SignedIn>
          </div>
          <div className="ml-4">
            <SignedIn>
              <UserButton afterSignOutUrl="/" />
            </SignedIn>
            <SignedOut>
              <SignInButton mode="modal">
                <button className="inline-flex items-center rounded-lg bg-sky-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-sky-400">
                  Sign in
                </button>
              </SignInButton>
            </SignedOut>
          </div>
        </header>

        {/* MCP Connection Section - Always visible */}
        <section className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg p-8 mb-6">
          <h2 className="text-2xl font-semibold text-slate-800 dark:text-slate-100 mb-4">
            Connect to MCP
          </h2>
          <p className="text-slate-600 dark:text-slate-300 mb-4">
            Use this URL to connect your AI assistant via Model Context Protocol:
          </p>
          <div className="flex gap-2">
            <input
              type="text"
              readOnly
              value={typeof window !== 'undefined' ? `${window.location.origin}/mcp?api-key=${apiKeys.length > 0 ? apiKeys[0].key : '<get the api key after login>'}` : ''}
              className="flex-1 rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 px-4 py-2 text-slate-800 dark:text-slate-100 font-mono text-sm"
            />
            <SignedIn>
              {apiKeys.length > 0 && (
                <button
                  type="button"
                  onClick={copyMcpUrl}
                  className="inline-flex items-center justify-center rounded-lg bg-sky-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-sky-400"
                  title="Copy to clipboard"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </button>
              )}
            </SignedIn>
          </div>
          <SignedIn>
            {apiKeys.length === 0 && (
              <div className="mt-3 text-sm text-slate-600 dark:text-slate-300">
                No API key found.{' '}
                <Link href="/api-keys" className="text-sky-600 dark:text-sky-400 hover:underline">
                  Create one here
                </Link>
                .
              </div>
            )}
          </SignedIn>
          <SignedOut>
            <div className="mt-3 text-sm text-slate-600 dark:text-slate-300">
              <Link href="/sign-in" className="text-sky-600 dark:text-sky-400 hover:underline">
                Sign in
              </Link>
              {' '}to get your API key.
            </div>
          </SignedOut>
        </section>

        <SignedOut>
          <section className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg p-8 text-center mb-6">
            <h2 className="text-2xl font-semibold text-slate-800 dark:text-slate-100 mb-3">Sign in required</h2>
            <p className="text-slate-600 dark:text-slate-300 mb-6">Please sign in to create and save your resume snapshots.</p>
            <SignInButton mode="modal">
              <button className="inline-flex items-center rounded-lg bg-sky-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-sky-400">
                Sign in to continue
              </button>
            </SignInButton>
          </section>
        </SignedOut>

        <SignedIn>
          <section className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg p-8">
            <h2 className="text-2xl font-semibold text-slate-800 dark:text-slate-100 mb-6">
              Build your resume snapshot
            </h2>
            <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="flex flex-col">
              <label htmlFor="title" className="text-sm font-medium text-slate-600 dark:text-slate-300 mb-2">
                Resume Title *
              </label>
              <input
                id="title"
                name="title"
                type="text"
                required
                placeholder="e.g. Software Engineer Resume 2024"
                value={formData.title}
                onChange={handleChange('title')}
                className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-4 py-2 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div className="flex flex-col">
                <label htmlFor="name" className="text-sm font-medium text-slate-600 dark:text-slate-300 mb-2">
                  Name
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  value={formData.name}
                  onChange={handleChange('name')}
                  className="rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-4 py-2 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>
              <div className="flex flex-col">
                <label htmlFor="email" className="text-sm font-medium text-slate-600 dark:text-slate-300 mb-2">
                  Email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleChange('email')}
                  className="rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-4 py-2 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>
            </div>

            <div className="flex flex-col">
              <label htmlFor="github" className="text-sm font-medium text-slate-600 dark:text-slate-300 mb-2">
                GitHub link
              </label>
              <input
                id="github"
                name="github"
                type="url"
                placeholder="https://github.com/username"
                value={formData.github}
                onChange={handleChange('github')}
                className="rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-4 py-2 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>

            <div className="flex flex-col">
              <label htmlFor="description" className="text-sm font-medium text-slate-600 dark:text-slate-300 mb-2">
                Professional summary
              </label>
              <textarea
                id="description"
                name="description"
                rows={4}
                value={formData.description}
                onChange={handleChange('description')}
                className="rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-4 py-2 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
              <div className="mt-2">
                <button
                  type="button"
                  onClick={() => openAIModal('description')}
                  className="inline-flex items-center rounded-md bg-sky-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-sky-400"
                >
                  AI
                </button>
              </div>
            </div>

            <div className="flex flex-col gap-6">
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-slate-600 dark:text-slate-300">
                    Work history
                  </label>
                  <button
                    type="button"
                    onClick={addWorkEntry}
                    className="text-sm font-medium text-sky-600 hover:text-sky-700"
                  >
                    + Add role
                  </button>
                </div>
                {formData.workHistory.map((entry, index) => (
                  <div key={`work-${index}`} className="flex flex-col gap-3 p-4 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50">
                    <div className="grid gap-3 md:grid-cols-2">
                      <div className="flex flex-col">
                        <label htmlFor={`company-${index}`} className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                          Company name
                        </label>
                        <input
                          id={`company-${index}`}
                          type="text"
                          placeholder="e.g. Google"
                          value={entry.companyName}
                          onChange={handleWorkChange(index, 'companyName')}
                          className="rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-3 py-2 text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500"
                        />
                      </div>
                      <div className="flex flex-col">
                        <label htmlFor={`role-${index}`} className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                          Role
                        </label>
                        <input
                          id={`role-${index}`}
                          type="text"
                          placeholder="e.g. Senior Software Engineer"
                          value={entry.role}
                          onChange={handleWorkChange(index, 'role')}
                          className="rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-3 py-2 text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500"
                        />
                      </div>
                    </div>
                    <div className="flex flex-col">
                      <label htmlFor={`date-${index}`} className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                        Date of work
                      </label>
                      <input
                        id={`date-${index}`}
                        type="text"
                        placeholder="e.g. Jan 2020 - Dec 2022"
                        value={entry.dateOfWork}
                        onChange={handleWorkChange(index, 'dateOfWork')}
                        className="rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-3 py-2 text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500"
                      />
                    </div>
                    <div className="flex flex-col">
                      <label htmlFor={`work-desc-${index}`} className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                        Description
                      </label>
                      <textarea
                        id={`work-desc-${index}`}
                        rows={3}
                        placeholder="Describe your responsibilities and achievements"
                        value={entry.description}
                        onChange={handleWorkChange(index, 'description')}
                        className="rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-3 py-2 text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500"
                      />
                      <button
                        type="button"
                        onClick={() => openAIModal('workHistory', index)}
                        className="mt-2 self-start inline-flex items-center rounded-md bg-sky-600 px-2 py-1 text-xs font-medium text-white hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-sky-400"
                      >
                        AI
                      </button>
                    </div>
                    {formData.workHistory.length > 1 && (
                      <button
                        type="button"
                        onClick={removeWorkEntry(index)}
                        className="self-end text-xs font-medium text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                ))}
              </div>

              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-slate-600 dark:text-slate-300">
                    Project highlights
                  </label>
                  <button
                    type="button"
                    onClick={addProjectEntry}
                    className="text-sm font-medium text-sky-600 hover:text-sky-700"
                  >
                    + Add project
                  </button>
                </div>
                {formData.projects.map((entry, index) => (
                  <div key={`project-${index}`} className="flex flex-col gap-3 p-4 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50">
                    <div className="flex flex-col">
                      <label htmlFor={`project-name-${index}`} className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                        Project name
                      </label>
                      <input
                        id={`project-name-${index}`}
                        type="text"
                        placeholder="e.g. E-commerce Platform"
                        value={entry.projectName}
                        onChange={handleProjectChange(index, 'projectName')}
                        className="rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-3 py-2 text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500"
                      />
                    </div>
                    <div className="flex flex-col">
                      <label htmlFor={`project-url-${index}`} className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                        Project URL (optional)
                      </label>
                      <input
                        id={`project-url-${index}`}
                        type="url"
                        placeholder="e.g. https://github.com/username/project"
                        value={entry.projectUrl}
                        onChange={handleProjectChange(index, 'projectUrl')}
                        className="rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-3 py-2 text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500"
                      />
                    </div>
                    <div className="flex flex-col">
                      <label htmlFor={`project-desc-${index}`} className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                        Project description
                      </label>
                      <textarea
                        id={`project-desc-${index}`}
                        rows={3}
                        placeholder="Describe the project, your role, and key achievements"
                        value={entry.projectDescription}
                        onChange={handleProjectChange(index, 'projectDescription')}
                        className="rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-3 py-2 text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500"
                      />
                      <button
                        type="button"
                        onClick={() => openAIModal('project', index)}
                        className="mt-2 self-start inline-flex items-center rounded-md bg-sky-600 px-2 py-1 text-xs font-medium text-white hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-sky-400"
                      >
                        AI
                      </button>
                    </div>
                    {formData.projects.length > 1 && (
                      <button
                        type="button"
                        onClick={removeProjectEntry(index)}
                        className="self-end text-xs font-medium text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-slate-600 dark:text-slate-300">
                  Achievements
                </label>
                <button
                  type="button"
                  onClick={addAchievementEntry}
                  className="text-sm font-medium text-sky-600 hover:text-sky-700"
                >
                  + Add achievement
                </button>
              </div>
              {formData.achievements.map((entry, index) => (
                <div key={`achievement-${index}`} className="flex flex-col gap-3 p-4 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50">
                  <div className="flex flex-col">
                    <label htmlFor={`achievement-name-${index}`} className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                      Achievement name
                    </label>
                    <input
                      id={`achievement-name-${index}`}
                      type="text"
                      placeholder="e.g. AWS Certified Solutions Architect"
                      value={entry.achievementName}
                      onChange={handleAchievementChange(index, 'achievementName')}
                      className="rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-3 py-2 text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500"
                    />
                  </div>
                  <div className="flex flex-col">
                    <label htmlFor={`achievement-url-${index}`} className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                      Achievement URL (optional)
                    </label>
                    <input
                      id={`achievement-url-${index}`}
                      type="url"
                      placeholder="e.g. https://www.credly.com/badges/..."
                      value={entry.achievementUrl}
                      onChange={handleAchievementChange(index, 'achievementUrl')}
                      className="rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-3 py-2 text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500"
                    />
                  </div>
                  <div className="flex flex-col">
                    <label htmlFor={`achievement-desc-${index}`} className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                      Achievement description
                    </label>
                    <textarea
                      id={`achievement-desc-${index}`}
                      rows={3}
                      placeholder="Describe the achievement, award, or certification"
                      value={entry.achievementDescription}
                      onChange={handleAchievementChange(index, 'achievementDescription')}
                      className="rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-3 py-2 text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500"
                    />
                    <button
                      type="button"
                      onClick={() => openAIModal('achievement', index)}
                      className="mt-2 self-start inline-flex items-center rounded-md bg-sky-600 px-2 py-1 text-xs font-medium text-white hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-sky-400"
                    >
                      AI
                    </button>
                  </div>
                  {formData.achievements.length > 1 && (
                    <button
                      type="button"
                      onClick={removeAchievementEntry(index)}
                      className="self-end text-xs font-medium text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                    >
                      Remove
                    </button>
                  )}
                </div>
              ))}
            </div>

              <div className="flex items-center justify-between">
                <button
                  type="submit"
                  className="inline-flex items-center rounded-lg bg-sky-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-sky-400"
                >
                  Save resume draft
                </button>

                {statusMessage && (
                  <span className="text-sm text-slate-500 dark:text-slate-300">
                    {statusMessage}
                  </span>
                )}
              </div>
            </form>
          </section>

          {isAIModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center">
              <div className="absolute inset-0 bg-black/50" onClick={closeAIModal} />
              <div className="relative z-10 w-full max-w-2xl rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-xl">
                <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700">
                  <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">AI Assistant</h3>
                  <button
                    type="button"
                    onClick={closeAIModal}
                    className="rounded-md px-2 py-1 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 focus:outline-none"
                  >
                    ✕
                  </button>
                </div>
                <div className="p-4 space-y-4">
                  <div className="flex items-end gap-3 flex-wrap">
                    <button
                      type="button"
                      onClick={handleProofread}
                      className="rounded-md bg-sky-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-sky-400"
                    >
                      {isEditingText && aiEditMode === 'proofread' ? 'Processing…' : 'Proofread'}
                    </button>
                    <div className="flex items-center gap-2 flex-wrap">
                      <button
                        type="button"
                        onClick={handleTranslate}
                        className="rounded-md bg-sky-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-sky-400"
                      >
                        {isEditingText && aiEditMode === 'translate' ? 'Processing…' : 'Translate'}
                      </button>
                      <input
                        type="text"
                        placeholder="From language"
                        value={translateFromLanguage}
                        onChange={(e) => setTranslateFromLanguage(e.target.value)}
                        className="rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-3 py-1.5 text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500"
                      />
                      <input
                        type="text"
                        placeholder="To language"
                        value={translateToLanguage}
                        onChange={(e) => setTranslateToLanguage(e.target.value)}
                        className="rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-3 py-1.5 text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500"
                      />
                    </div>
                  </div>

                  <div className="grid gap-3 md:grid-cols-2">
                    <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 p-3">
                      <div className="text-xs font-medium text-slate-600 dark:text-slate-300 mb-2">Original text</div>
                      <div className="text-sm text-slate-700 dark:text-slate-200 whitespace-pre-wrap min-h-[6rem]">
                        {getCurrentText() || 'No text provided yet.'}
                      </div>
                    </div>
                    <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 p-3">
                      <div className="text-xs font-medium text-slate-600 dark:text-slate-300 mb-2">AI edit</div>
                      <div className="text-sm text-slate-700 dark:text-slate-200 whitespace-pre-wrap min-h-[6rem]">
                        {isEditingText ? 'Generating…' : (aiEditedText || 'AI output will appear here.')}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex justify-between gap-2 p-4 border-t border-slate-200 dark:border-slate-700">
                  <button
                    type="button"
                    onClick={() => {
                      if (aiEditedText && !aiEditedText.includes('failed')) {
                        if (currentField.type === 'description') {
                          setFormData(prev => ({ ...prev, description: aiEditedText }));
                        } else if (currentField.type === 'workHistory' && currentField.index !== undefined) {
                          setFormData(prev => {
                            const updated = [...prev.workHistory];
                            updated[currentField.index!] = { ...updated[currentField.index!], description: aiEditedText };
                            return { ...prev, workHistory: updated };
                          });
                        } else if (currentField.type === 'project' && currentField.index !== undefined) {
                          setFormData(prev => {
                            const updated = [...prev.projects];
                            updated[currentField.index!] = { ...updated[currentField.index!], projectDescription: aiEditedText };
                            return { ...prev, projects: updated };
                          });
                        } else if (currentField.type === 'achievement' && currentField.index !== undefined) {
                          setFormData(prev => {
                            const updated = [...prev.achievements];
                            updated[currentField.index!] = { ...updated[currentField.index!], achievementDescription: aiEditedText };
                            return { ...prev, achievements: updated };
                          });
                        }
                        toast.success('Text Applied', {
                          description: 'AI-generated text has been applied to the textarea',
                        });
                      }
                    }}
                    disabled={!aiEditedText || aiEditedText.includes('failed') || isEditingText}
                    className="rounded-md bg-sky-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-sky-400 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Apply to Textarea
                  </button>
                  <button
                    type="button"
                    onClick={closeAIModal}
                    className="rounded-md px-3 py-1.5 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 focus:outline-none"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Resume Preview */}
          <section className="mt-8 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg p-8">
            <h2 className="text-2xl font-semibold text-slate-800 dark:text-slate-100 mb-6">
              Resume Preview
            </h2>
            
            <div className="space-y-6 text-slate-700 dark:text-slate-200">
              {/* Header Section */}
              <div className="border-b border-slate-200 dark:border-slate-700 pb-4">
                <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-50 mb-2">
                  {formData.name || 'Your Name'}
                </h1>
                <div className="flex flex-wrap gap-3 text-sm">
                  {formData.email && (
                    <span className="flex items-center gap-1">
                      📧 {formData.email}
                    </span>
                  )}
                  {formData.github && (
                    <a 
                      href={formData.github} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-sky-600 hover:text-sky-700"
                    >
                      🔗 GitHub
                    </a>
                  )}
                </div>
              </div>

              {/* Professional Summary */}
              {formData.description && (
                <div>
                  <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-2">
                    Professional Summary
                  </h3>
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">
                    {formData.description}
                  </p>
                </div>
              )}

              {/* Work History */}
              {formData.workHistory.some(w => w.companyName || w.role || w.dateOfWork || w.description) && (
                <div>
                  <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-3">
                    Work Experience
                  </h3>
                  <div className="space-y-4">
                    {formData.workHistory.map((work, index) => (
                      (work.companyName || work.role || work.dateOfWork || work.description) && (
                        <div key={`preview-work-${index}`} className="border-l-2 border-sky-500 pl-4">
                          <div className="flex justify-between items-start mb-1">
                            <h4 className="font-semibold text-slate-900 dark:text-slate-50">
                              {work.role || 'Role Title'}
                            </h4>
                            {work.dateOfWork && (
                              <span className="text-sm text-slate-500 dark:text-slate-400">
                                {work.dateOfWork}
                              </span>
                            )}
                          </div>
                          {work.companyName && (
                            <p className="text-sm font-medium text-slate-600 dark:text-slate-300 mb-2">
                              {work.companyName}
                            </p>
                          )}
                          {work.description && (
                            <p className="text-sm text-slate-600 dark:text-slate-300 whitespace-pre-wrap">
                              {work.description}
                            </p>
                          )}
                        </div>
                      )
                    ))}
                  </div>
                </div>
              )}

              {/* Projects */}
              {formData.projects.some(p => p.projectName || p.projectUrl || p.projectDescription) && (
                <div>
                  <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-3">
                    Projects
                  </h3>
                  <div className="space-y-4">
                    {formData.projects.map((project, index) => (
                      (project.projectName || project.projectUrl || project.projectDescription) && (
                        <div key={`preview-project-${index}`} className="border-l-2 border-emerald-500 pl-4">
                          <div className="flex items-start gap-2 mb-1">
                            <h4 className="font-semibold text-slate-900 dark:text-slate-50">
                              {project.projectName || 'Project Name'}
                            </h4>
                            {project.projectUrl && (
                              <a 
                                href={project.projectUrl} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-xs text-sky-600 hover:text-sky-700"
                              >
                                🔗
                              </a>
                            )}
                          </div>
                          {project.projectDescription && (
                            <p className="text-sm text-slate-600 dark:text-slate-300 whitespace-pre-wrap">
                              {project.projectDescription}
                            </p>
                          )}
                        </div>
                      )
                    ))}
                  </div>
                </div>
              )}

              {/* Achievements */}
              {formData.achievements.some(a => a.achievementName || a.achievementUrl || a.achievementDescription) && (
                <div>
                  <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-3">
                    Achievements
                  </h3>
                  <div className="space-y-4">
                    {formData.achievements.map((achievement, index) => (
                      (achievement.achievementName || achievement.achievementUrl || achievement.achievementDescription) && (
                        <div key={`preview-achievement-${index}`} className="border-l-2 border-amber-500 pl-4">
                          <div className="flex items-start gap-2 mb-1">
                            <h4 className="font-semibold text-slate-900 dark:text-slate-50">
                              {achievement.achievementName || 'Achievement Name'}
                            </h4>
                            {achievement.achievementUrl && (
                              <a 
                                href={achievement.achievementUrl} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-xs text-sky-600 hover:text-sky-700"
                              >
                                🔗
                              </a>
                            )}
                          </div>
                          {achievement.achievementDescription && (
                            <p className="text-sm text-slate-600 dark:text-slate-300 whitespace-pre-wrap">
                              {achievement.achievementDescription}
                            </p>
                          )}
                        </div>
                      )
                    ))}
                  </div>
                </div>
              )}

              {/* Empty State */}
              {!formData.name && !formData.email && !formData.description && 
               !formData.workHistory.some(w => w.companyName || w.role) &&
               !formData.projects.some(p => p.projectName) &&
               !formData.achievements.some(a => a.achievementName) && (
                <div className="text-center py-8 text-slate-400 dark:text-slate-500">
                  <p className="text-sm">Fill out the form above to see your resume preview here</p>
                </div>
              )}
            </div>
          </section>
        </SignedIn>
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-slate-800 dark:text-slate-100 mb-1">Resume AI Creator</h1>
            <p className="text-lg text-slate-600 dark:text-slate-300">Loading...</p>
          </div>
        </div>
      </div>
    }>
      <HomeContent />
    </Suspense>
  );
}
