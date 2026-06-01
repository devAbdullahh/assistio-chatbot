import { redirect } from 'next/navigation';
import LandingPage from '@/components/LandingPage';
import { getSession } from '@/lib/auth/session.js';

export const metadata = {
  title: 'Assistio — Chat with your documents using AI',
  description:
    'Upload documents per conversation. Get grounded, cited answers powered by hybrid RAG and Gemini.',
};

export default async function HomePage() {
  const session = await getSession();
  if (session) redirect('/chat');

  return <LandingPage />;
}
