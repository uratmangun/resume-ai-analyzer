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

interface ResumeData {
  id: string;
  name: string;
  title: string;
  email: string;
  github?: string;
  description?: string;
  workHistory: WorkHistoryEntry[];
  projects: ProjectEntry[];
  achievements: AchievementEntry[];
}

export default function ViewResumePage() {
  const toolOutput = useWidgetProps<{
    resumeId?: string;
  }>();
  const maxHeight = useMaxHeight() ?? undefined;
  const displayMode = useDisplayMode();
  const requestDisplayMode = useRequestDisplayMode();
  const isChatGptApp = useIsChatGptApp();
  const callTool = useCallTool();
  const sendMessage = useSendMessage();

  const [resumeData, setResumeData] = useState<ResumeData | null>(null);
  const [statusMessage, setStatusMessage] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadResume = async () => {
      if (!toolOutput?.resumeId) {
        setStatusMessage("No resume ID provided");
        return;
      }

      setLoading(true);

      try {
        const result = await callTool("get-resume", { resumeId: toolOutput.resumeId });
        
        if (result == null) {
          setStatusMessage("Tool call unavailable outside ChatGPT");
          return;
        }

        // Parse the resume data from the tool response
        const data = JSON.parse(result.result);
        
        if (data.error) {
          setStatusMessage(data.error);
          return;
        }

        setResumeData(data);
      } catch (error: any) {
        setStatusMessage(error?.message || "Error loading resume");
      } finally {
        setLoading(false);
      }
    };

    loadResume();
  }, [toolOutput?.resumeId, callTool]);

  const handleDownloadPdf = async () => {
    if (!resumeData) return;

    const prompt = `using this data:

${JSON.stringify(resumeData)}

create a modern stylized pdf do not show the title of the resume just give me beautiful colored pdf file and give me the download link
named the pdf file ${resumeData.name}.pdf
`;

    await sendMessage(prompt);
  };

  const handleEditResume = async () => {
    if (!resumeData) return;
    await sendMessage(`resume-editor-interface resumeId: ${resumeData.id}`);
  };

  const handleListResumes = async () => {
    await sendMessage('list-resumes');
  };

  const handleCopyResumeId = () => {
    if (!resumeData) return;
    navigator.clipboard.writeText(resumeData.id);
    setStatusMessage("Resume ID copied!");
    setTimeout(() => setStatusMessage(""), 2000);
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
              This viewer is designed to work within ChatGPT. Some features may not work outside of ChatGPT.
            </p>
          </div>
        </div>
      )}

      <div className="max-w-4xl mx-auto">
        {loading ? (
          <section className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg p-8">
            <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300 mb-6">
              <svg className="h-5 w-5 animate-spin text-slate-400" viewBox="0 0 24 24" aria-hidden="true">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v3a5 5 0 00-5 5H4z" />
              </svg>
              <span className="text-sm">Loading resume data...</span>
            </div>
            <div className="space-y-3">
              <div className="h-8 w-1/2 rounded bg-slate-200/70 dark:bg-slate-700/50 animate-pulse" />
              <div className="h-4 w-1/3 rounded bg-slate-200/70 dark:bg-slate-700/50 animate-pulse" />
              <div className="h-20 rounded bg-slate-200/70 dark:bg-slate-700/50 animate-pulse" />
            </div>
          </section>
        ) : statusMessage && !resumeData ? (
          <section className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg p-8">
            <div className="text-center">
              <svg className="w-12 h-12 mx-auto text-slate-400 dark:text-slate-500 mb-4" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
              </svg>
              <p className="text-slate-600 dark:text-slate-300">{statusMessage}</p>
            </div>
          </section>
        ) : resumeData ? (
          <section className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold text-slate-800 dark:text-slate-100">
                Resume Preview
              </h2>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500 dark:text-slate-400">ID: {resumeData.id.slice(0, 8)}...</span>
                <button
                  type="button"
                  onClick={handleCopyResumeId}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-slate-600 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-400"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184" />
                  </svg>
                  Copy
                </button>
              </div>
            </div>

            {statusMessage && (
              <div className="mb-4 text-sm text-emerald-600 dark:text-emerald-400">
                {statusMessage}
              </div>
            )}

            <div className="space-y-6 text-slate-700 dark:text-slate-200">
              {/* Header Section */}
              <div className="border-b border-slate-200 dark:border-slate-700 pb-4">
                <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-50 mb-2">
                  {resumeData.name || 'Your Name'}
                </h1>
                <div className="flex flex-wrap gap-3 text-sm">
                  {resumeData.email && (
                    <span className="flex items-center gap-1">
                      📧 {resumeData.email}
                    </span>
                  )}
                  {resumeData.github && (
                    <a
                      href={resumeData.github}
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
              {resumeData.description && (
                <div>
                  <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-2">
                    Professional Summary
                  </h3>
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">
                    {resumeData.description}
                  </p>
                </div>
              )}

              {/* Work History */}
              {resumeData.workHistory && resumeData.workHistory.length > 0 && resumeData.workHistory.some(w => w.companyName || w.role || w.dateOfWork || w.description) && (
                <div>
                  <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-3">
                    Work Experience
                  </h3>
                  <div className="space-y-4">
                    {resumeData.workHistory.map((work, index) => (
                      (work.companyName || work.role || work.dateOfWork || work.description) && (
                        <div key={`work-${index}`} className="border-l-2 border-sky-500 pl-4">
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
              {resumeData.projects && resumeData.projects.length > 0 && resumeData.projects.some(p => p.projectName || p.projectUrl || p.projectDescription) && (
                <div>
                  <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-3">
                    Projects
                  </h3>
                  <div className="space-y-4">
                    {resumeData.projects.map((project, index) => (
                      (project.projectName || project.projectUrl || project.projectDescription) && (
                        <div key={`project-${index}`} className="border-l-2 border-emerald-500 pl-4">
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
              {resumeData.achievements && resumeData.achievements.length > 0 && resumeData.achievements.some(a => a.achievementName || a.achievementUrl || a.achievementDescription) && (
                <div>
                  <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-3">
                    Achievements
                  </h3>
                  <div className="space-y-4">
                    {resumeData.achievements.map((achievement, index) => (
                      (achievement.achievementName || achievement.achievementUrl || achievement.achievementDescription) && (
                        <div key={`achievement-${index}`} className="border-l-2 border-amber-500 pl-4">
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
              {!resumeData.name && !resumeData.email && !resumeData.description &&
                (!resumeData.workHistory || !resumeData.workHistory.some(w => w.companyName || w.role)) &&
                (!resumeData.projects || !resumeData.projects.some(p => p.projectName)) &&
                (!resumeData.achievements || !resumeData.achievements.some(a => a.achievementName)) && (
                  <div className="text-center py-8 text-slate-400 dark:text-slate-500">
                    <p className="text-sm">This resume appears to be empty</p>
                  </div>
                )}
            </div>

            {/* Action Buttons */}
            <div className="mt-6 flex flex-wrap gap-3 justify-start border-t border-slate-200 dark:border-slate-700 pt-6">
              <button
                type="button"
                onClick={handleEditResume}
                className="inline-flex items-center gap-2 rounded-lg bg-sky-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-sky-400"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                </svg>
                Edit Resume
              </button>
              <button
                type="button"
                onClick={handleDownloadPdf}
                className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-400"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6.72 13.829c-.24.03-.48.062-.72.096m.72-.096a42.415 42.415 0 0110.56 0m-10.56 0L6.34 18m10.94-4.171c.24.03.48.062.72.096m-.72-.096L17.66 18m0 0l.229 2.523a1.125 1.125 0 01-1.12 1.227H7.231c-.662 0-1.18-.568-1.12-1.227L6.34 18m11.318 0h1.091A2.25 2.25 0 0021 15.75V9.456c0-1.081-.768-2.015-1.837-2.175a48.055 48.055 0 00-1.913-.247M6.34 18H5.25A2.25 2.25 0 013 15.75V9.456c0-1.081.768-2.015 1.837-2.175a48.041 48.041 0 011.913-.247m10.5 0a48.536 48.536 0 00-10.5 0m10.5 0V3.375c0-.621-.504-1.125-1.125-1.125h-8.25c-.621 0-1.125.504-1.125 1.125v3.659M18 10.5h.008v.008H18V10.5zm-3 0h.008v.008H15V10.5z" />
                </svg>
                Download as PDF
              </button>
              <button
                type="button"
                onClick={handleListResumes}
                className="inline-flex items-center gap-2 rounded-lg bg-slate-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-400"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM3.75 12h.007v.008H3.75V12zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm-.375 5.25h.007v.008H3.75v-.008zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                </svg>
                List All Resumes
              </button>
            </div>
          </section>
        ) : null}
      </div>
    </div>
  );
}
