import auth0 from '@/lib/auth0';
import { redirect } from 'next/navigation';
import { getResume } from '@/lib/db/resume';
import PrintClient from './PrintClient';

export default async function PrintResumePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth0.getSession();
  const userId = session?.user?.sub;
  if (!userId) {
    redirect('/sign-in');
  }

  const { id } = await params;
  const resume = await getResume(id);

  if (!resume) {
    redirect('/resumes');
  }

  if (resume.userId !== userId) {
    redirect('/resumes');
  }

  return <PrintClient resume={resume} />;
}

