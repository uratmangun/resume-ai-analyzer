'use client';

import { useEffect, useState, ChangeEvent, FormEvent } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/nextjs';
import { toast } from 'sonner';

type WorkHistoryEntry = { companyName: string; role: string; dateOfWork: string; description: string };
type ProjectEntry = { projectName: string; projectUrl: string; projectDescription: string };
type AchievementEntry = { achievementName: string; achievementUrl: string; achievementDescription: string };

export default function EditResumeClient() {
  const params = useParams();
  const id = typeof params?.id === 'string' ? params.id : Array.isArray(params?.id) ? params?.id[0] : '';

  const [formData, setFormData] = useState({
    title: '',
    name: '',
    description: '',
    email: '',
    github: '',
    workHistory: [{ companyName: '', role: '', dateOfWork: '', description: '' }] as WorkHistoryEntry[],
    projects: [{ projectName: '', projectUrl: '', projectDescription: '' }] as ProjectEntry[],
    achievements: [{ achievementName: '', achievementUrl: '', achievementDescription: '' }] as AchievementEntry[],
  });

  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/resumes/${id}`);
        if (!res.ok) throw new Error('Failed to load resume');
        const data = await res.json();
        setFormData({
          title: data.title || '',
          name: data.name || '',
          description: data.description || '',
          email: data.email || '',
          github: data.github || '',
          workHistory: data.workHistory?.length ? data.workHistory : [{ companyName: '', role: '', dateOfWork: '', description: '' }],
          projects: data.projects?.length ? data.projects : [{ projectName: '', projectUrl: '', projectDescription: '' }],
          achievements: data.achievements?.length ? data.achievements : [{ achievementName: '', achievementUrl: '', achievementDescription: '' }],
        });
      } catch (e: any) {
        toast.error('Failed to load resume', { description: e?.message || 'Unknown error' });
      } finally {
        setLoading(false);
      }
    }
    if (id) load();
  }, [id]);

  type ScalarField = 'title' | 'name' | 'description' | 'email' | 'github';
  type WorkField = 'companyName' | 'role' | 'dateOfWork' | 'description';
  type ProjectField = 'projectName' | 'projectUrl' | 'projectDescription';
  type AchievementField = 'achievementName' | 'achievementUrl' | 'achievementDescription';

  const handleChange = (field: ScalarField) => (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({ ...prev, [field]: event.target.value }));
  };

  const handleWorkChange = (index: number, field: WorkField) => (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const value = event.target.value;
    setFormData((prev) => {
      const updated = [...prev.workHistory];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, workHistory: updated };
    });
  };

  const handleProjectChange = (index: number, field: ProjectField) => (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const value = event.target.value;
    setFormData((prev) => {
      const updated = [...prev.projects];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, projects: updated };
    });
  };

  const handleAchievementChange = (index: number, field: AchievementField) => (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const value = event.target.value;
    setFormData((prev) => {
      const updated = [...prev.achievements];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, achievements: updated };
    });
  };

  const addWorkEntry = () => setFormData((prev) => ({ ...prev, workHistory: [...prev.workHistory, { companyName: '', role: '', dateOfWork: '', description: '' }] }));
  const addProjectEntry = () => setFormData((prev) => ({ ...prev, projects: [...prev.projects, { projectName: '', projectUrl: '', projectDescription: '' }] }));
  const addAchievementEntry = () => setFormData((prev) => ({ ...prev, achievements: [...prev.achievements, { achievementName: '', achievementUrl: '', achievementDescription: '' }] }));

  const removeWorkEntry = (index: number) => () => setFormData((prev) => ({ ...prev, workHistory: prev.workHistory.filter((_, i) => i !== index) }));
  const removeProjectEntry = (index: number) => () => setFormData((prev) => ({ ...prev, projects: prev.projects.filter((_, i) => i !== index) }));
  const removeAchievementEntry = (index: number) => () => setFormData((prev) => ({ ...prev, achievements: prev.achievements.filter((_, i) => i !== index) }));

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatusMessage('Updating resume...');
    try {
      const payload = {
        title: formData.title || 'Untitled Resume',
        name: formData.name,
        email: formData.email,
        github: formData.github,
        description: formData.description,
        workHistory: formData.workHistory.filter((v) => v.companyName || v.role || v.dateOfWork || v.description),
        projects: formData.projects.filter((v) => v.projectName || v.projectUrl || v.projectDescription),
        achievements: formData.achievements.filter((v) => v.achievementName || v.achievementUrl || v.achievementDescription),
      };

      const res = await fetch(`/api/resumes/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => null);
        throw new Error(err?.error ? JSON.stringify(err.error) : 'Request failed');
      }
      setStatusMessage(null);
      toast.success('Resume updated successfully!', {
        description: 'Your changes have been saved.',
      });
    } catch (error: any) {
      setStatusMessage(null);
      toast.error('Failed to update resume', {
        description: error?.message ?? 'Unknown error',
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800 p-8">
      <div className="max-w-4xl mx-auto">
        <header className="flex items-center justify-between mb-12">
          <div className="text-center flex-1">
            <h1 className="text-4xl font-bold text-slate-800 dark:text-slate-100 mb-1">Edit Resume</h1>
            <p className="text-lg text-slate-600 dark:text-slate-300 mb-3">Update your existing resume</p>
          </div>
          <div className="ml-4">
            <SignedIn>
              <UserButton afterSignOutUrl="/" />
            </SignedIn>
            <SignedOut>
              <SignInButton mode="modal">
                <button className="inline-flex items-center rounded-lg bg-sky-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-sky-400">Sign in</button>
              </SignInButton>
            </SignedOut>
          </div>
        </header>

        {loading ? (
          <div className="text-center py-12 text-slate-500 dark:text-slate-400">Loading…</div>
        ) : (
          <>
          <section className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg p-8">
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div className="flex flex-col">
                <label htmlFor="title" className="text-sm font-medium text-slate-600 dark:text-slate-300 mb-2">Resume Title *</label>
                <input id="title" name="title" type="text" required placeholder="e.g. Software Engineer Resume 2024" value={formData.title} onChange={handleChange('title')} className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-4 py-2 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500" />
              </div>
              <div className="grid gap-6 md:grid-cols-2">
                <div className="flex flex-col">
                  <label htmlFor="name" className="text-sm font-medium text-slate-600 dark:text-slate-300 mb-2">Name</label>
                  <input id="name" name="name" type="text" required value={formData.name} onChange={handleChange('name')} className="rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-4 py-2 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500" />
                </div>
                <div className="flex flex-col">
                  <label htmlFor="email" className="text-sm font-medium text-slate-600 dark:text-slate-300 mb-2">Email</label>
                  <input id="email" name="email" type="email" required value={formData.email} onChange={handleChange('email')} className="rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-4 py-2 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500" />
                </div>
              </div>
              <div className="flex flex-col">
                <label htmlFor="github" className="text-sm font-medium text-slate-600 dark:text-slate-300 mb-2">GitHub link</label>
                <input id="github" name="github" type="url" placeholder="https://github.com/username" value={formData.github} onChange={handleChange('github')} className="rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-4 py-2 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500" />
              </div>
              <div className="flex flex-col">
                <label htmlFor="description" className="text-sm font-medium text-slate-600 dark:text-slate-300 mb-2">Professional summary</label>
                <textarea id="description" name="description" rows={4} value={formData.description} onChange={handleChange('description')} className="rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-4 py-2 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500" />
              </div>

              <div className="flex flex-col gap-6">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-slate-600 dark:text-slate-300">Work history</label>
                  <button type="button" onClick={addWorkEntry} className="text-sm font-medium text-sky-600 hover:text-sky-700">+ Add role</button>
                </div>
                {formData.workHistory.map((entry, index) => (
                  <div key={`work-${index}`} className="flex flex-col gap-3 p-4 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50">
                    <div className="grid gap-3 md:grid-cols-2">
                      <div className="flex flex-col">
                        <label className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Company name</label>
                        <input type="text" value={entry.companyName} onChange={handleWorkChange(index, 'companyName')} className="rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-3 py-2 text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500" />
                      </div>
                      <div className="flex flex-col">
                        <label className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Role</label>
                        <input type="text" value={entry.role} onChange={handleWorkChange(index, 'role')} className="rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-3 py-2 text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500" />
                      </div>
                    </div>
                    <div className="flex flex-col">
                      <label className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Date of work</label>
                      <input type="text" value={entry.dateOfWork} onChange={handleWorkChange(index, 'dateOfWork')} className="rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-3 py-2 text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500" />
                    </div>
                    <div className="flex flex-col">
                      <label className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Description</label>
                      <textarea rows={3} value={entry.description} onChange={handleWorkChange(index, 'description')} className="rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-3 py-2 text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500" />
                    </div>
                    {formData.workHistory.length > 1 && (
                      <button type="button" onClick={removeWorkEntry(index)} className="self-end text-xs font-medium text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200">Remove</button>
                    )}
                  </div>
                ))}
              </div>

              <div className="flex flex-col gap-6">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-slate-600 dark:text-slate-300">Project highlights</label>
                  <button type="button" onClick={addProjectEntry} className="text-sm font-medium text-sky-600 hover:text-sky-700">+ Add project</button>
                </div>
                {formData.projects.map((entry, index) => (
                  <div key={`project-${index}`} className="flex flex-col gap-3 p-4 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50">
                    <div className="flex flex-col">
                      <label className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Project name</label>
                      <input type="text" value={entry.projectName} onChange={handleProjectChange(index, 'projectName')} className="rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-3 py-2 text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500" />
                    </div>
                    <div className="flex flex-col">
                      <label className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Project URL (optional)</label>
                      <input type="url" value={entry.projectUrl} onChange={handleProjectChange(index, 'projectUrl')} className="rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-3 py-2 text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500" />
                    </div>
                    <div className="flex flex-col">
                      <label className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Project description</label>
                      <textarea rows={3} value={entry.projectDescription} onChange={handleProjectChange(index, 'projectDescription')} className="rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-3 py-2 text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500" />
                    </div>
                    {formData.projects.length > 1 && (
                      <button type="button" onClick={removeProjectEntry(index)} className="self-end text-xs font-medium text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200">Remove</button>
                    )}
                  </div>
                ))}
              </div>

              <div className="flex flex-col gap-6">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-slate-600 dark:text-slate-300">Achievements</label>
                  <button type="button" onClick={addAchievementEntry} className="text-sm font-medium text-sky-600 hover:text-sky-700">+ Add achievement</button>
                </div>
                {formData.achievements.map((entry, index) => (
                  <div key={`achievement-${index}`} className="flex flex-col gap-3 p-4 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50">
                    <div className="flex flex-col">
                      <label className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Achievement name</label>
                      <input type="text" value={entry.achievementName} onChange={handleAchievementChange(index, 'achievementName')} className="rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-3 py-2 text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500" />
                    </div>
                    <div className="flex flex-col">
                      <label className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Achievement URL (optional)</label>
                      <input type="url" value={entry.achievementUrl} onChange={handleAchievementChange(index, 'achievementUrl')} className="rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-3 py-2 text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500" />
                    </div>
                    <div className="flex flex-col">
                      <label className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Achievement description</label>
                      <textarea rows={3} value={entry.achievementDescription} onChange={handleAchievementChange(index, 'achievementDescription')} className="rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-3 py-2 text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500" />
                    </div>
                    {formData.achievements.length > 1 && (
                      <button type="button" onClick={removeAchievementEntry(index)} className="self-end text-xs font-medium text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200">Remove</button>
                    )}
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Link href="/resumes" className="text-sm font-medium text-sky-600 hover:text-sky-700">← Back</Link>
                </div>
                <div className="flex items-center gap-3">
                  {statusMessage && <span className="text-sm text-slate-500 dark:text-slate-300">{statusMessage}</span>}
                  <button
                    type="button"
                    onClick={() => window.open(`/resumes/${id}/print`, '_blank')}
                    className="inline-flex items-center rounded-lg bg-emerald-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                  >
                    Print Resume
                  </button>
                  <button type="submit" className="inline-flex items-center rounded-lg bg-sky-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-sky-400">Save changes</button>
                </div>
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
          </>
        )}
      </div>
    </div>
  );
}


