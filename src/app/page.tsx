'use client';

import { useEffect, useState, ChangeEvent, FormEvent } from 'react';
import { sdk } from '@farcaster/miniapp-sdk'

export default function Home() {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    email: '',
    github: '',
    workHistory: [''],
    projects: [''],
    achievements: ['']
  });
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  useEffect(() => {
    const initializeSdk = async () => {
      await sdk.actions.ready();
    };
    initializeSdk();
  }, []);

  type ScalarField = 'name' | 'description' | 'email' | 'github';
  type ListField = 'workHistory' | 'projects' | 'achievements';

  const handleChange = (
    field: ScalarField,
  ) => (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({
      ...prev,
      [field]: event.target.value,
    }));
  };

  const handleListChange = (
    field: ListField,
    index: number,
  ) => (event: ChangeEvent<HTMLTextAreaElement>) => {
    const value = event.target.value;
    setFormData((prev) => {
      const updated = [...prev[field]];
      updated[index] = value;
      return {
        ...prev,
        [field]: updated,
      };
    });
  };

  const addListEntry = (field: ListField) => () => {
    setFormData((prev) => ({
      ...prev,
      [field]: [...prev[field], ''],
    }));
  };

  const removeListEntry = (field: ListField, index: number) => () => {
    setFormData((prev) => {
      if (prev[field].length === 1) return prev;
      const updated = prev[field].filter((_, idx) => idx !== index);
      return {
        ...prev,
        [field]: updated,
      };
    });
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatusMessage('Resume draft saved locally. You can wire this up to storage or AI next.');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800 p-8">
      <div className="max-w-4xl mx-auto">
        <header className="text-center mb-12">
          <h1 className="text-4xl font-bold text-slate-800 dark:text-slate-100 mb-4">
            Resume analyzer
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-300">
            analyze how your resume need to be changed using ai
          </p>
        </header>

        <section className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg p-8">
          <h2 className="text-2xl font-semibold text-slate-800 dark:text-slate-100 mb-6">
            Build your resume snapshot
          </h2>
          <form className="space-y-6" onSubmit={handleSubmit}>
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
                    onClick={addListEntry('workHistory')}
                    className="text-sm font-medium text-sky-600 hover:text-sky-700"
                  >
                    + Add role
                  </button>
                </div>
                {formData.workHistory.map((entry, index) => (
                  <div key={`work-${index}`} className="flex flex-col gap-2">
                    <textarea
                      rows={4}
                      placeholder="List roles, companies, and impact"
                      value={entry}
                      onChange={handleListChange('workHistory', index)}
                      className="rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-4 py-2 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500"
                    />
                    {formData.workHistory.length > 1 && (
                      <button
                        type="button"
                        onClick={removeListEntry('workHistory', index)}
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
                    onClick={addListEntry('projects')}
                    className="text-sm font-medium text-sky-600 hover:text-sky-700"
                  >
                    + Add project
                  </button>
                </div>
                {formData.projects.map((entry, index) => (
                  <div key={`project-${index}`} className="flex flex-col gap-2">
                    <textarea
                      rows={4}
                      placeholder="Describe standout projects and metrics"
                      value={entry}
                      onChange={handleListChange('projects', index)}
                      className="rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-4 py-2 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500"
                    />
                    {formData.projects.length > 1 && (
                      <button
                        type="button"
                        onClick={removeListEntry('projects', index)}
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
                  onClick={addListEntry('achievements')}
                  className="text-sm font-medium text-sky-600 hover:text-sky-700"
                >
                  + Add achievement
                </button>
              </div>
              {formData.achievements.map((entry, index) => (
                <div key={`achievement-${index}`} className="flex flex-col gap-2">
                  <textarea
                    rows={3}
                    placeholder="Awards, certifications, and key wins"
                    value={entry}
                    onChange={handleListChange('achievements', index)}
                    className="rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-4 py-2 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                  {formData.achievements.length > 1 && (
                    <button
                      type="button"
                      onClick={removeListEntry('achievements', index)}
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
      </div>
    </div>
  );
}
