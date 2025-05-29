import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const docRef = doc(db, 'albums', id);
  const snapshot = await getDoc(docRef);

  if (!snapshot.exists()) return {};

  const data = snapshot.data();
  return {
    title: data?.title || 'Album',
    description: data?.description || 'Explore this album on Social Atlas.',
  };
}

export default async function AlbumPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const docRef = doc(db, 'albums', id);
  const snapshot = await getDoc(docRef);

  if (!snapshot.exists()) return notFound();

  const data = snapshot.data();

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold">{data.title}</h1>
      <p className="text-gray-600 mt-2">{data.description}</p>
      {/* TODO: Render more album details here */}
    </div>
  );
}
