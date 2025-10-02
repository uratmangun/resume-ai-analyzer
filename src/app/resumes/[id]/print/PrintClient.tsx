'use client';

import { useEffect } from 'react';

type Resume = {
  id: string;
  title: string;
  name: string;
  email: string;
  github?: string | null;
  description?: string | null;
  workHistory: Array<{
    companyName: string;
    role: string;
    dateOfWork: string;
    description: string;
  }>;
  projects: Array<{
    projectName: string;
    projectUrl?: string | null;
    projectDescription: string;
  }>;
  achievements: Array<{
    achievementName: string;
    achievementUrl?: string | null;
    achievementDescription: string;
  }>;
};

export default function PrintClient({ resume }: { resume: Resume }) {
  useEffect(() => {
    // Trigger print dialog after component mounts
    window.print();
  }, []);

  return (
    <div className="min-h-screen bg-white p-8">
      <style jsx global>{`
        @media print {
          body {
            margin: 0;
            padding: 0;
          }
          .no-print {
            display: none !important;
          }
          @page {
            margin: 0.5in;
          }
        }
      `}</style>

      {/* Print button for manual printing */}
      <div className="no-print mb-4 flex justify-end gap-3">
        <button
          onClick={() => window.print()}
          className="rounded-lg bg-sky-600 px-5 py-2 text-sm font-semibold text-white hover:bg-sky-700"
        >
          Print
        </button>
        <button
          onClick={() => window.close()}
          className="rounded-lg bg-slate-600 px-5 py-2 text-sm font-semibold text-white hover:bg-slate-700"
        >
          Close
        </button>
      </div>

      {/* Resume content */}
      <div className="mx-auto max-w-4xl space-y-6 text-slate-900">
        {/* Header Section */}
        <div className="border-b-2 border-slate-300 pb-4">
          <h1 className="text-4xl font-bold mb-2">{resume.name}</h1>
          <div className="flex flex-wrap gap-4 text-sm">
            {resume.email && <span>📧 {resume.email}</span>}
            {resume.github && (
              <span>🔗 {resume.github}</span>
            )}
          </div>
        </div>

        {/* Professional Summary */}
        {resume.description && (
          <div>
            <h2 className="text-2xl font-bold mb-3 text-slate-800">
              Professional Summary
            </h2>
            <p className="text-base leading-relaxed whitespace-pre-wrap">
              {resume.description}
            </p>
          </div>
        )}

        {/* Work History */}
        {resume.workHistory.some(
          (w) => w.companyName || w.role || w.dateOfWork || w.description
        ) && (
          <div>
            <h2 className="text-2xl font-bold mb-3 text-slate-800">
              Work Experience
            </h2>
            <div className="space-y-4">
              {resume.workHistory.map(
                (work, index) =>
                  (work.companyName ||
                    work.role ||
                    work.dateOfWork ||
                    work.description) && (
                    <div key={index} className="border-l-4 border-slate-400 pl-4">
                      <div className="flex justify-between items-start mb-1">
                        <h3 className="text-lg font-semibold">
                          {work.role || 'Role Title'}
                        </h3>
                        {work.dateOfWork && (
                          <span className="text-sm text-slate-600">
                            {work.dateOfWork}
                          </span>
                        )}
                      </div>
                      {work.companyName && (
                        <p className="text-base font-medium text-slate-700 mb-2">
                          {work.companyName}
                        </p>
                      )}
                      {work.description && (
                        <p className="text-sm text-slate-700 whitespace-pre-wrap">
                          {work.description}
                        </p>
                      )}
                    </div>
                  )
              )}
            </div>
          </div>
        )}

        {/* Projects */}
        {resume.projects.some(
          (p) => p.projectName || p.projectUrl || p.projectDescription
        ) && (
          <div>
            <h2 className="text-2xl font-bold mb-3 text-slate-800">Projects</h2>
            <div className="space-y-4">
              {resume.projects.map(
                (project, index) =>
                  (project.projectName ||
                    project.projectUrl ||
                    project.projectDescription) && (
                    <div key={index} className="border-l-4 border-slate-400 pl-4">
                      <div className="flex items-start gap-2 mb-1">
                        <h3 className="text-lg font-semibold">
                          {project.projectName || 'Project Name'}
                        </h3>
                        {project.projectUrl && (
                          <span className="text-xs text-slate-600">
                            ({project.projectUrl})
                          </span>
                        )}
                      </div>
                      {project.projectDescription && (
                        <p className="text-sm text-slate-700 whitespace-pre-wrap">
                          {project.projectDescription}
                        </p>
                      )}
                    </div>
                  )
              )}
            </div>
          </div>
        )}

        {/* Achievements */}
        {resume.achievements.some(
          (a) => a.achievementName || a.achievementUrl || a.achievementDescription
        ) && (
          <div>
            <h2 className="text-2xl font-bold mb-3 text-slate-800">
              Achievements
            </h2>
            <div className="space-y-4">
              {resume.achievements.map(
                (achievement, index) =>
                  (achievement.achievementName ||
                    achievement.achievementUrl ||
                    achievement.achievementDescription) && (
                    <div key={index} className="border-l-4 border-slate-400 pl-4">
                      <div className="flex items-start gap-2 mb-1">
                        <h3 className="text-lg font-semibold">
                          {achievement.achievementName || 'Achievement Name'}
                        </h3>
                        {achievement.achievementUrl && (
                          <span className="text-xs text-slate-600">
                            ({achievement.achievementUrl})
                          </span>
                        )}
                      </div>
                      {achievement.achievementDescription && (
                        <p className="text-sm text-slate-700 whitespace-pre-wrap">
                          {achievement.achievementDescription}
                        </p>
                      )}
                    </div>
                  )
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

