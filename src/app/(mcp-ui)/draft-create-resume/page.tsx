"use client";

import { useState, useEffect } from "react";
import {
  useWidgetProps,
  useMaxHeight,
  useDisplayMode,
  useRequestDisplayMode,
  useIsChatGptApp,
} from "@/app/hooks";
import { useCallTool } from "@/app/hooks/use-call-tool";

interface WorkHistoryEntry {
  companyName: string;
  role: string;
  dateOfWork: string;
  description: string;
}

interface ProjectEntry {
  projectName: string;
  projectUrl?: string;
  projectDescription: string;
}

interface AchievementEntry {
  achievementName: string;
  achievementUrl?: string;
  achievementDescription: string;
}

interface ResumeFormData {
  name: string;
  title: string;
  email: string;
  github?: string;
  description?: string;
  workHistory: WorkHistoryEntry[];
  projects: ProjectEntry[];
  achievements: AchievementEntry[];
}

export default function ResumeFormPage() {
  const toolOutput = useWidgetProps<{
    name?: string;
    title?: string;
    email?: string;
    github?: string;
    description?: string;
    workHistory?: WorkHistoryEntry[];
    projects?: ProjectEntry[];
    achievements?: AchievementEntry[];
     result?: { structuredContent?: { name?: string;
    title?: string;
    email?: string;
    github?: string;
    description?: string;
    workHistory?: WorkHistoryEntry[];
    projects?: ProjectEntry[];
    achievements?: AchievementEntry[]; } };
  }>();
  const maxHeight = useMaxHeight() ?? undefined;
  const displayMode = useDisplayMode();
  const requestDisplayMode = useRequestDisplayMode();
  const isChatGptApp = useIsChatGptApp();
  const callTool = useCallTool();

  // Extract form data directly from toolOutput with fallbacks
  const initialFormData: ResumeFormData = {
    name: toolOutput?.name || "",
    title: toolOutput?.title || "",
    email: toolOutput?.email || "",
    github: toolOutput?.github || "",
    description: toolOutput?.description || "",
    workHistory: toolOutput?.workHistory?.length 
      ? toolOutput.workHistory 
      : [{ companyName: "", role: "", dateOfWork: "", description: "" }],
    projects: toolOutput?.projects?.length 
      ? toolOutput.projects 
      : [{ projectName: "", projectUrl: "", projectDescription: "" }],
    achievements: toolOutput?.achievements?.length 
      ? toolOutput.achievements 
      : [{ achievementName: "", achievementUrl: "", achievementDescription: "" }],
  };

  const [formData, setFormData] = useState<ResumeFormData>(initialFormData);
  const [statusMessage, setStatusMessage] = useState("");
  const [disabled, setDisabled] = useState(true);

  useEffect(() => {
    const hasData = Boolean(
      toolOutput &&
      Object.keys(toolOutput).length > 0 &&
      (
        toolOutput.name ||
        toolOutput.title ||
        toolOutput.email ||
        toolOutput.github ||
        toolOutput.description ||
        (toolOutput.workHistory && toolOutput.workHistory.length > 0) ||
        (toolOutput.projects && toolOutput.projects.length > 0) ||
        (toolOutput.achievements && toolOutput.achievements.length > 0)
      )
    );

    if (hasData) {
     
      setFormData({
        name: toolOutput?.name || "",
        title: toolOutput?.title || "",
        email: toolOutput?.email || "",
        github: toolOutput?.github || "",
        description: toolOutput?.description || "",
        workHistory: toolOutput?.workHistory?.length
          ? toolOutput.workHistory
          : [{ companyName: "", role: "", dateOfWork: "", description: "" }],
        projects: toolOutput?.projects?.length
          ? toolOutput.projects
          : [{ projectName: "", projectUrl: "", projectDescription: "" }],
        achievements: toolOutput?.achievements?.length
          ? toolOutput.achievements
          : [{ achievementName: "", achievementUrl: "", achievementDescription: "" }],
      });
      setDisabled(false);
    } else {
      setDisabled(true);
    }
  }, [toolOutput]);

  const handleChange = (field: keyof ResumeFormData) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleWorkChange = (index: number, field: keyof WorkHistoryEntry) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const updated = [...formData.workHistory];
    updated[index] = { ...updated[index], [field]: e.target.value };
    setFormData((prev) => ({ ...prev, workHistory: updated }));
  };

  const handleProjectChange = (index: number, field: keyof ProjectEntry) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const updated = [...formData.projects];
    updated[index] = { ...updated[index], [field]: e.target.value };
    setFormData((prev) => ({ ...prev, projects: updated }));
  };

  const handleAchievementChange = (index: number, field: keyof AchievementEntry) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const updated = [...formData.achievements];
    updated[index] = { ...updated[index], [field]: e.target.value };
    setFormData((prev) => ({ ...prev, achievements: updated }));
  };

  const addWorkEntry = () => {
    setFormData((prev) => ({
      ...prev,
      workHistory: [...prev.workHistory, { companyName: "", role: "", dateOfWork: "", description: "" }],
    }));
  };

  const removeWorkEntry = (index: number) => () => {
    setFormData((prev) => ({
      ...prev,
      workHistory: prev.workHistory.filter((_, i) => i !== index),
    }));
  };

  const addProjectEntry = () => {
    setFormData((prev) => ({
      ...prev,
      projects: [...prev.projects, { projectName: "", projectUrl: "", projectDescription: "" }],
    }));
  };

  const removeProjectEntry = (index: number) => () => {
    setFormData((prev) => ({
      ...prev,
      projects: prev.projects.filter((_, i) => i !== index),
    }));
  };

  const addAchievementEntry = () => {
    setFormData((prev) => ({
      ...prev,
      achievements: [...prev.achievements, { achievementName: "", achievementUrl: "", achievementDescription: "" }],
    }));
  };

  const removeAchievementEntry = (index: number) => () => {
    setFormData((prev) => ({
      ...prev,
      achievements: prev.achievements.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMessage("Saving...");

    try {
      const result = await callTool(
        "create-resume",
        formData as unknown as Record<string, unknown>
      );

      if (result == null) {
        setStatusMessage("Tool call unavailable outside ChatGPT");
        return;
      }

      setStatusMessage("Resume saved successfully!");
      setTimeout(() => setStatusMessage(""), 3000);
    } catch (error: any) {
      setStatusMessage(error?.message || "Error saving resume");
    }
  };

  return (
    <div
      className="font-sans bg-slate-50 dark:bg-slate-950 p-4"
      style={{
        maxHeight: maxHeight ? `${maxHeight}px` : "100vh",
        height: displayMode === "fullscreen" ? (maxHeight ? `${maxHeight}px` : "100vh") : "auto",
        minHeight: maxHeight ? `${maxHeight}px` : "100vh",
        overflow: "auto",
      }}
    >
      {displayMode !== "fullscreen" && (
        <button
          aria-label="Enter fullscreen"
          className="fixed top-4 right-4 z-50 rounded-full bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 shadow-lg ring-1 ring-slate-900/10 dark:ring-white/10 p-2.5 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors cursor-pointer"
          onClick={() => requestDisplayMode("fullscreen")}
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.5}
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15"
            />
          </svg>
        </button>
      )}

      {!isChatGptApp && (
        <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg px-4 py-3 mb-6 max-w-4xl mx-auto">
          <div className="flex items-center gap-3">
            <svg
              className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0"
              fill="currentColor"
              viewBox="0 0 20 20"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a.75.75 0 000 1.5h.253a.25.25 0 01.244.304l-.459 2.066A1.75 1.75 0 0010.747 15H11a.75.75 0 000-1.5h-.253a.25.25 0 01-.244-.304l.459-2.066A1.75 1.75 0 009.253 9H9z"
                clipRule="evenodd"
              />
            </svg>
            <p className="text-sm text-blue-900 dark:text-blue-100 font-medium">
              This form is designed to work within ChatGPT. Some features may not work outside of ChatGPT.
            </p>
          </div>
        </div>
      )}

      <div className="max-w-4xl mx-auto">
        <section className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg p-8 relative">
          <h2 className="text-2xl font-semibold text-slate-800 dark:text-slate-100 mb-6">
            Build your resume
          </h2>
          {disabled && (
            <div className="relative z-30 mb-6">
              <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                <svg className="h-5 w-5 animate-spin text-slate-400" viewBox="0 0 24 24" aria-hidden="true">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v3a5 5 0 00-5 5H4z" />
                </svg>
                <span className="text-sm">Loading form data...</span>
              </div>
              <div className="mt-4 space-y-3">
                <div className="h-3 w-1/3 rounded bg-slate-200/70 dark:bg-slate-700/50 animate-pulse" />
                <div className="h-10 rounded bg-slate-200/70 dark:bg-slate-700/50 animate-pulse" />
                <div className="grid grid-cols-2 gap-3">
                  <div className="h-10 rounded bg-slate-200/70 dark:bg-slate-700/50 animate-pulse" />
                  <div className="h-10 rounded bg-slate-200/70 dark:bg-slate-700/50 animate-pulse" />
                </div>
              </div>
            </div>
          )}
          {disabled && (
            <div aria-hidden className="absolute inset-0 z-20 bg-white/40 dark:bg-slate-900/30" />
          )}
          <form className="space-y-6 relative z-10" onSubmit={handleSubmit}>
            <fieldset disabled={disabled} aria-disabled={disabled} className={disabled ? "pointer-events-none select-none" : undefined}>
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
                onChange={handleChange("title")}
                className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-4 py-2 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div className="flex flex-col">
                <label htmlFor="name" className="text-sm font-medium text-slate-600 dark:text-slate-300 mb-2">
                  Name *
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  value={formData.name}
                  onChange={handleChange("name")}
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
                  value={formData.email}
                  onChange={handleChange("email")}
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
                onChange={handleChange("github")}
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
                onChange={handleChange("description")}
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
                  <div
                    key={`work-${index}`}
                    className="flex flex-col gap-3 p-4 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50"
                  >
                    <div className="grid gap-3 md:grid-cols-2">
                      <div className="flex flex-col">
                        <label
                          htmlFor={`company-${index}`}
                          className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-1"
                        >
                          Company name
                        </label>
                        <input
                          id={`company-${index}`}
                          type="text"
                          placeholder="e.g. Google"
                          value={entry.companyName}
                          onChange={handleWorkChange(index, "companyName")}
                          className="rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-3 py-2 text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500"
                        />
                      </div>
                      <div className="flex flex-col">
                        <label
                          htmlFor={`role-${index}`}
                          className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-1"
                        >
                          Role
                        </label>
                        <input
                          id={`role-${index}`}
                          type="text"
                          placeholder="e.g. Senior Software Engineer"
                          value={entry.role}
                          onChange={handleWorkChange(index, "role")}
                          className="rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-3 py-2 text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500"
                        />
                      </div>
                    </div>
                    <div className="flex flex-col">
                      <label
                        htmlFor={`date-${index}`}
                        className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-1"
                      >
                        Date of work
                      </label>
                      <input
                        id={`date-${index}`}
                        type="text"
                        placeholder="e.g. Jan 2020 - Dec 2022"
                        value={entry.dateOfWork}
                        onChange={handleWorkChange(index, "dateOfWork")}
                        className="rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-3 py-2 text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500"
                      />
                    </div>
                    <div className="flex flex-col">
                      <label
                        htmlFor={`work-desc-${index}`}
                        className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-1"
                      >
                        Description
                      </label>
                      <textarea
                        id={`work-desc-${index}`}
                        rows={3}
                        placeholder="Describe your responsibilities and achievements"
                        value={entry.description}
                        onChange={handleWorkChange(index, "description")}
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
                  <div
                    key={`project-${index}`}
                    className="flex flex-col gap-3 p-4 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50"
                  >
                    <div className="flex flex-col">
                      <label
                        htmlFor={`project-name-${index}`}
                        className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-1"
                      >
                        Project name
                      </label>
                      <input
                        id={`project-name-${index}`}
                        type="text"
                        placeholder="e.g. E-commerce Platform"
                        value={entry.projectName}
                        onChange={handleProjectChange(index, "projectName")}
                        className="rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-3 py-2 text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500"
                      />
                    </div>
                    <div className="flex flex-col">
                      <label
                        htmlFor={`project-url-${index}`}
                        className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-1"
                      >
                        Project URL (optional)
                      </label>
                      <input
                        id={`project-url-${index}`}
                        type="url"
                        placeholder="e.g. https://github.com/username/project"
                        value={entry.projectUrl}
                        onChange={handleProjectChange(index, "projectUrl")}
                        className="rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-3 py-2 text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500"
                      />
                    </div>
                    <div className="flex flex-col">
                      <label
                        htmlFor={`project-desc-${index}`}
                        className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-1"
                      >
                        Project description
                      </label>
                      <textarea
                        id={`project-desc-${index}`}
                        rows={3}
                        placeholder="Describe the project, your role, and key achievements"
                        value={entry.projectDescription}
                        onChange={handleProjectChange(index, "projectDescription")}
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
                <div
                  key={`achievement-${index}`}
                  className="flex flex-col gap-3 p-4 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50"
                >
                  <div className="flex flex-col">
                    <label
                      htmlFor={`achievement-name-${index}`}
                      className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-1"
                    >
                      Achievement name
                    </label>
                    <input
                      id={`achievement-name-${index}`}
                      type="text"
                      placeholder="e.g. AWS Certified Solutions Architect"
                      value={entry.achievementName}
                      onChange={handleAchievementChange(index, "achievementName")}
                      className="rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-3 py-2 text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500"
                    />
                  </div>
                  <div className="flex flex-col">
                    <label
                      htmlFor={`achievement-url-${index}`}
                      className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-1"
                    >
                      Achievement URL (optional)
                    </label>
                    <input
                      id={`achievement-url-${index}`}
                      type="url"
                      placeholder="e.g. https://www.credly.com/badges/..."
                      value={entry.achievementUrl}
                      onChange={handleAchievementChange(index, "achievementUrl")}
                      className="rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-3 py-2 text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500"
                    />
                  </div>
                  <div className="flex flex-col">
                    <label
                      htmlFor={`achievement-desc-${index}`}
                      className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-1"
                    >
                      Achievement description
                    </label>
                    <textarea
                      id={`achievement-desc-${index}`}
                      rows={3}
                      placeholder="Describe the achievement, award, or certification"
                      value={entry.achievementDescription}
                      onChange={handleAchievementChange(index, "achievementDescription")}
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
                Save resume
              </button>

              {statusMessage && (
                <span className="text-sm text-slate-500 dark:text-slate-300">
                  {statusMessage}
                </span>
              )}
            </div>
            </fieldset>
          </form>
        </section>
      </div>
    </div>
  );
}
