'use client';

import { useEffect, useState, ChangeEvent, FormEvent, Suspense } from 'react';
import { sdk } from '@farcaster/miniapp-sdk'
import { SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/nextjs';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';

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
  const searchParams = useSearchParams();
  const resumeId = searchParams.get('id');

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
  const [isEditing, setIsEditing] = useState(false);

  const [titleContext, setTitleContext] = useState<string>('');

  // AI chat hook for title generation
  const { messages: aiMessages, sendMessage: sendAIMessage, status: aiStatus } = useChat({
    id: 'title-generator',
    transport: new DefaultChatTransport({
      api: '/api/ai-suggest-title',
      prepareSendMessagesRequest: ({ messages }) => ({
        body: {
          messages,
          context: titleContext, // Include context in the request
        },
      }),
    }),
    onFinish: (result) => {
      // Extract the generated title from the AI response
      const lastMessage = result.messages[result.messages.length - 1];
      if (lastMessage && lastMessage.role === 'assistant') {
        let titleText = lastMessage.parts
          .filter(part => part.type === 'text')
          .map(part => part.type === 'text' ? part.text : '')
          .join('')
          .trim();
        
        if (titleText) {
          // Clean up the title with regex
          // Remove quotes at start/end
          titleText = titleText.replace(/^["']|["']$/g, '');
          // Remove character count like "(51 characters)"
          titleText = titleText.replace(/\s*\(\d+\s*characters?\)\s*/gi, '');
          // Remove any text in parentheses at the end (suggestions, notes, etc.)
          titleText = titleText.replace(/\s*\([^)]*\)\s*$/g, '');
          // Remove asterisks (markdown emphasis)
          titleText = titleText.replace(/\*/g, '');
          // Clean up any extra whitespace
          titleText = titleText.trim();
          
          if (titleText) {
            setFormData(prev => ({ ...prev, title: titleText }));
          }
        }
      }
    },
  });

  const isGeneratingTitle = aiStatus === 'submitted' || aiStatus === 'streaming';

  useEffect(() => {
    const initializeSdk = async () => {
      await sdk.actions.ready();
    };
    initializeSdk();
  }, []);

  useEffect(() => {
    if (resumeId) {
      // Load existing resume for editing
      async function loadResume() {
        try {
          const res = await fetch(`/api/resumes/${resumeId}`);
          if (res.ok) {
            const data = await res.json();
            setFormData({
              title: data.title || '',
              name: data.name || '',
              description: data.description || '',
              email: data.email || '',
              github: data.github || '',
              workHistory: data.workHistory?.length > 0 ? data.workHistory : [{ companyName: '', role: '', dateOfWork: '', description: '' }],
              projects: data.projects?.length > 0 ? data.projects : [{ projectName: '', projectUrl: '', projectDescription: '' }],
              achievements: data.achievements?.length > 0 ? data.achievements : [{ achievementName: '', achievementUrl: '', achievementDescription: '' }]
            });
            setIsEditing(true);
          }
        } catch (error) {
          console.error('Failed to load resume:', error);
        }
      }
      loadResume();
    }
  }, [resumeId]);

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

  const handleAISuggestTitle = () => {
    // Build context from form data
    const context = `
Name: ${formData.name || 'Not provided'}
Description: ${formData.description || 'Not provided'}
Work History: ${formData.workHistory.map(w => `${w.role} at ${w.companyName}`).filter(Boolean).join(', ') || 'Not provided'}
Projects: ${formData.projects.map(p => p.projectName).filter(Boolean).join(', ') || 'Not provided'}
    `.trim();

    // Update context and send message
    setTitleContext(context);
    
    // Use setTimeout to ensure state update completes
    setTimeout(() => {
      sendAIMessage({
        text: 'Generate a professional resume title based on the information provided.',
      });
    }, 0);
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
              Resume AI Analyzer
            </h1>
            <p className="text-lg text-slate-600 dark:text-slate-300 mb-3">
              analyze how your resume need to be changed using ai
            </p>
            <SignedIn>
              <div className="flex items-center justify-center gap-3">
                <Link
                  href="/"
                  onClick={() => { setFormData({ title: '', name: '', description: '', email: '', github: '', workHistory: [{ companyName: '', role: '', dateOfWork: '', description: '' }], projects: [{ projectName: '', projectUrl: '', projectDescription: '' }], achievements: [{ achievementName: '', achievementUrl: '', achievementDescription: '' }] }); setIsEditing(false); }}
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

        <SignedOut>
          <section className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg p-8 text-center">
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
              {isEditing ? 'Edit Resume' : 'Build your resume snapshot'}
            </h2>
            <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="flex flex-col">
              <label htmlFor="title" className="text-sm font-medium text-slate-600 dark:text-slate-300 mb-2">
                Resume Title *
              </label>
              <div className="relative">
                <input
                  id="title"
                  name="title"
                  type="text"
                  required
                  placeholder="e.g. Software Engineer Resume 2024"
                  value={formData.title}
                  onChange={handleChange('title')}
                  className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-4 py-2 pr-20 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
                <button
                  type="button"
                  onClick={handleAISuggestTitle}
                  disabled={isGeneratingTitle}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md bg-gradient-to-r from-sky-500 to-blue-600 px-3 py-1 text-xs font-medium text-white hover:from-sky-600 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-sky-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  title="Generate title with AI"
                >
                  {isGeneratingTitle ? (
                    <span className="flex items-center gap-1">
                      <svg className="animate-spin h-3 w-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    </span>
                  ) : (
                    '✨ AI'
                  )}
                </button>
              </div>
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
            <h1 className="text-4xl font-bold text-slate-800 dark:text-slate-100 mb-1">Resume AI Analyzer</h1>
            <p className="text-lg text-slate-600 dark:text-slate-300">Loading...</p>
          </div>
        </div>
      </div>
    }>
      <HomeContent />
    </Suspense>
  );
}
