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
import { useSendMessage } from "@/app/hooks/use-send-message";

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
  resumeId: string;
  name: string;
  title: string;
  email: string;
  github?: string;
  description?: string;
  workHistory: WorkHistoryEntry[];
  projects: ProjectEntry[];
  achievements: AchievementEntry[];
}

export default function EditResumePage() {
  const toolOutput = useWidgetProps<{
    resumeId?: string;
    name?: string;
    title?: string;
    email?: string;
    github?: string;
    description?: string;
    workHistory?: WorkHistoryEntry[];
    projects?: ProjectEntry[];
    achievements?: AchievementEntry[];
  }>();
  const maxHeight = useMaxHeight() ?? undefined;
  const displayMode = useDisplayMode();
  const requestDisplayMode = useRequestDisplayMode();
  const isChatGptApp = useIsChatGptApp();
  const callTool = useCallTool();
  const sendMessage = useSendMessage();

  const [formData, setFormData] = useState<ResumeFormData>({
    resumeId: "",
    name: "",
    title: "",
    email: "",
    github: "",
    description: "",
    workHistory: [{ companyName: "", role: "", dateOfWork: "", description: "" }],
    projects: [{ projectName: "", projectUrl: "", projectDescription: "" }],
    achievements: [{ achievementName: "", achievementUrl: "", achievementDescription: "" }],
  });
  const [statusMessage, setStatusMessage] = useState("");
  const [disabled, setDisabled] = useState(true);
  const [showPreview, setShowPreview] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // AI Modal state
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);
  const [translateFromLanguage, setTranslateFromLanguage] = useState('');
  const [translateToLanguage, setTranslateToLanguage] = useState('');
  const [aiEditMode, setAiEditMode] = useState<'proofread' | 'translate'>('proofread');
  const [currentField, setCurrentField] = useState<{
    type: 'description' | 'workHistory' | 'project' | 'achievement';
    field?: string;
    index?: number;
  }>({ type: 'description' });

  useEffect(() => {
    const loadResume = async () => {
      if (!toolOutput?.resumeId) {
        setDisabled(true);
        return;
      }

      setLoading(true);
      setDisabled(true);

      try {
        const result = await callTool("get-resume", { resumeId: toolOutput.resumeId });
        
        if (result == null) {
          setStatusMessage("Tool call unavailable outside ChatGPT");
          return;
        }

        // Parse the resume data from the tool response
        const resumeData = JSON.parse(result.result);
        
        if (resumeData.error) {
          setStatusMessage(resumeData.error);
          return;
        }

        // Merge database data with toolOutput overrides
        // Priority: toolOutput (user input) > resumeData (database) > defaults
        setFormData({
          resumeId: resumeData.id || toolOutput.resumeId,
          name: toolOutput.name ?? resumeData.name ?? "",
          title: toolOutput.title ?? resumeData.title ?? "",
          email: toolOutput.email ?? resumeData.email ?? "",
          github: toolOutput.github ?? resumeData.github ?? "",
          description: toolOutput.description ?? resumeData.description ?? "",
          workHistory: toolOutput.workHistory ?? 
            (resumeData.workHistory?.length
              ? resumeData.workHistory
              : [{ companyName: "", role: "", dateOfWork: "", description: "" }]),
          projects: toolOutput.projects ?? 
            (resumeData.projects?.length
              ? resumeData.projects
              : [{ projectName: "", projectUrl: "", projectDescription: "" }]),
          achievements: toolOutput.achievements ?? 
            (resumeData.achievements?.length
              ? resumeData.achievements
              : [{ achievementName: "", achievementUrl: "", achievementDescription: "" }]),
        });
        setDisabled(false);
      } catch (error: any) {
        setStatusMessage(error?.message || "Error loading resume");
      } finally {
        setLoading(false);
      }
    };

    loadResume();
  }, [toolOutput?.resumeId, toolOutput?.name, toolOutput?.title, toolOutput?.email, toolOutput?.github, toolOutput?.description, toolOutput?.workHistory, toolOutput?.projects, toolOutput?.achievements, callTool]);

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
    setStatusMessage("Updating...");

    try {
      const result = await callTool(
        "update-resume",
        formData as unknown as Record<string, unknown>
      );

      if (result == null) {
        setStatusMessage("Tool call unavailable outside ChatGPT");
        return;
      }

      setStatusMessage("Resume updated successfully!");
      setShowPreview(true);
      setTimeout(() => setStatusMessage(""), 3000);
    } catch (error: any) {
      setStatusMessage(error?.message || "Error updating resume");
    }
  };

  const handleDownloadPdf = async () => {
    const prompt = `using this data:

${JSON.stringify(formData)}

create a modern stylized pdf do not show the title of the resume just give me beautiful colored pdf file and give me the download link
named the pdf file ${formData.name}.pdf
`;

    await sendMessage(prompt);
  };

  const handleListResumes = async () => {
    await sendMessage('list-resumes');
  };

  const handleDraftCreateResume = async () => {
    await sendMessage('draft-create-resume');
  };

  // AI Modal handlers
  const openAIModal = (fieldType: 'description' | 'workHistory' | 'project' | 'achievement', field?: string, index?: number) => {
    setCurrentField({ type: fieldType, field, index });
    setIsAIModalOpen(true);
  };

  const closeAIModal = () => {
    setIsAIModalOpen(false);
    setTranslateFromLanguage('');
    setTranslateToLanguage('');
  };

  const getCurrentText = () => {
    if (currentField.type === 'description') {
      return formData.description || '';
    } else if (currentField.type === 'workHistory' && currentField.index !== undefined) {
      return formData.workHistory[currentField.index]?.description || '';
    } else if (currentField.type === 'project' && currentField.index !== undefined) {
      return formData.projects[currentField.index]?.projectDescription || '';
    } else if (currentField.type === 'achievement' && currentField.index !== undefined) {
      return formData.achievements[currentField.index]?.achievementDescription || '';
    }
    return '';
  };

  const handleProofread = async () => {
    setAiEditMode('proofread');
    const fieldKey = currentField.type === 'description' ? 'description' :
      currentField.type === 'workHistory' ? `workHistory[${currentField.index}].description` :
      currentField.type === 'project' ? `projects[${currentField.index}].projectDescription` :
      `achievements[${currentField.index}].achievementDescription`;
    
    const prompt = `please proofread key \`${fieldKey}\` in this data:\n\n${JSON.stringify(formData, null, 2)}`;
    await sendMessage(prompt);
  };

  const handleTranslate = async () => {
    if (!translateFromLanguage || !translateToLanguage) {
      return;
    }
    setAiEditMode('translate');
    const fieldKey = currentField.type === 'description' ? 'description' :
      currentField.type === 'workHistory' ? `workHistory[${currentField.index}].description` :
      currentField.type === 'project' ? `projects[${currentField.index}].projectDescription` :
      `achievements[${currentField.index}].achievementDescription`;
    
    const prompt = `please translate \`${fieldKey}\` from \`${translateFromLanguage}\` to \`${translateToLanguage}\` from this data:\n\n${JSON.stringify(formData, null, 2)}`;
    await sendMessage(prompt);
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
        {!showPreview ? (
          <section className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg p-8 relative">
            <h2 className="text-2xl font-semibold text-slate-800 dark:text-slate-100 mb-6">
              Edit your resume
            </h2>
            {disabled && (
              <div className="relative z-30 mb-6">
                <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                  <svg className="h-5 w-5 animate-spin text-slate-400" viewBox="0 0 24 24" aria-hidden="true">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v3a5 5 0 00-5 5H4z" />
                  </svg>
                  <span className="text-sm">Loading resume data...</span>
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
                  <label htmlFor="resumeId" className="text-sm font-medium text-slate-600 dark:text-slate-300 mb-2">
                    Resume ID
                  </label>
                  <div className="flex gap-2">
                    <input
                      id="resumeId"
                      name="resumeId"
                      type="text"
                      disabled
                      value={formData.resumeId}
                      className="flex-1 rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-100 dark:bg-slate-800 px-4 py-2 text-slate-600 dark:text-slate-400 cursor-not-allowed"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(formData.resumeId);
                        setStatusMessage("Resume ID copied!");
                        setTimeout(() => setStatusMessage(""), 2000);
                      }}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-slate-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-400"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184" />
                      </svg>
                      Copy
                    </button>
                  </div>
                </div>

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
                  <div className="flex items-center justify-between mb-2">
                    <label htmlFor="description" className="text-sm font-medium text-slate-600 dark:text-slate-300">
                      Professional summary
                    </label>
                    <button
                      type="button"
                      onClick={() => openAIModal('description')}
                      className="text-xs font-medium text-sky-600 hover:text-sky-700 flex items-center gap-1"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
                      </svg>
                      AI
                    </button>
                  </div>
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
                          <div className="flex items-center justify-between mb-1">
                            <label
                              htmlFor={`work-desc-${index}`}
                              className="text-xs font-medium text-slate-600 dark:text-slate-400"
                            >
                              Description
                            </label>
                            <button
                              type="button"
                              onClick={() => openAIModal('workHistory', 'description', index)}
                              className="text-xs font-medium text-sky-600 hover:text-sky-700 flex items-center gap-1"
                            >
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
                              </svg>
                              AI
                            </button>
                          </div>
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
                          <div className="flex items-center justify-between mb-1">
                            <label
                              htmlFor={`project-desc-${index}`}
                              className="text-xs font-medium text-slate-600 dark:text-slate-400"
                            >
                              Project description
                            </label>
                            <button
                              type="button"
                              onClick={() => openAIModal('project', 'projectDescription', index)}
                              className="text-xs font-medium text-sky-600 hover:text-sky-700 flex items-center gap-1"
                            >
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
                              </svg>
                              AI
                            </button>
                          </div>
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
                        <div className="flex items-center justify-between mb-1">
                          <label
                            htmlFor={`achievement-desc-${index}`}
                            className="text-xs font-medium text-slate-600 dark:text-slate-400"
                          >
                            Achievement description
                          </label>
                          <button
                            type="button"
                            onClick={() => openAIModal('achievement', 'achievementDescription', index)}
                            className="text-xs font-medium text-sky-600 hover:text-sky-700 flex items-center gap-1"
                          >
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
                            </svg>
                            AI
                          </button>
                        </div>
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
                    Update resume
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
        ) : (
          <>


            {/* Resume Preview Section */}
            <section className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg p-8">
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
                      <p className="text-sm">Your resume preview will appear here</p>
                    </div>
                  )}
              </div>

              {/* Action Buttons */}
              <div className="mt-6 flex flex-wrap gap-3 justify-start border-t border-slate-200 dark:border-slate-700 pt-6">
                <button
                  type="button"
                  onClick={handleDownloadPdf}
                  className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6.72 13.829c-.24.03-.48.062-.72.096m.72-.096a42.415 42.415 0 0110.56 0m-10.56 0L6.34 18m10.94-4.171c.24.03.48.062.72.096m-.72-.096L17.66 18m0 0l.229 2.523a1.125 1.125 0 01-1.12 1.227H7.231c-.662 0-1.18-.568-1.12-1.227L6.34 18m11.318 0h1.091A2.25 2.25 0 0021 15.75V9.456c0-1.081-.768-2.015-1.837-2.175a48.055 48.055 0 00-1.913-.247M6.34 18H5.25A2.25 2.25 0 013 15.75V9.456c0-1.081.768-2.015 1.837-2.175a48.041 48.041 0 011.913-.247m10.5 0a48.536 48.536 0 00-10.5 0m10.5 0V3.375c0-.621-.504-1.125-1.125-1.125h-8.25c-.621 0-1.125.504-1.125 1.125v3.659M18 10.5h.008v.008H18V10.5zm-3 0h.008v.008H15V10.5z" />
                  </svg>
                  Download as pdf
                </button>
                <button
                  type="button"
                  onClick={handleListResumes}
                  className="inline-flex items-center gap-2 rounded-lg bg-sky-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-sky-400"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM3.75 12h.007v.008H3.75V12zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm-.375 5.25h.007v.008H3.75v-.008zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                  </svg>
                  List All Resumes
                </button>
                <button
                  type="button"
                  onClick={handleDraftCreateResume}
                  className="inline-flex items-center gap-2 rounded-lg bg-slate-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-400"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                  </svg>
                  Create Draft Resume
                </button>
              </div>
            </section>
          </>
        )}
      </div>

      {/* AI Modal */}
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
                  Proofread
                </button>
                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    type="button"
                    onClick={handleTranslate}
                    className="rounded-md bg-sky-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-sky-400"
                  >
                    Translate
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

              <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 p-3">
                <div className="text-xs font-medium text-slate-600 dark:text-slate-300 mb-2">Current text</div>
                <div className="text-sm text-slate-700 dark:text-slate-200 whitespace-pre-wrap min-h-[6rem] max-h-[12rem] overflow-y-auto">
                  {getCurrentText() || 'No text provided yet.'}
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2 p-4 border-t border-slate-200 dark:border-slate-700">
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
    </div>
  );
}
