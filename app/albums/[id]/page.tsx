import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

// ✅ Correctly typed for Next.js dynamic routes
export async function generateMetadata({
  params,
}: {
  params: { id: string };
}): Promise<Metadata> {
  const docRef = doc(db, 'albums', params.id);
  const snap = await getDoc(docRef);

  if (!snap.exists()) {
    return {
      title: 'Album Not Found',
    };
  }

  const data = snap.data();
  return {
    title: data.title || 'Social Atlas Album',
    description: data.description || 'Explore more with Social Atlas.',
  };
}

export default async function AlbumPage({
  params,
}: {
  params: { id: string };
}) {
  const docRef = doc(db, 'albums', params.id);
  const snap = await getDoc(docRef);

  if (!snap.exists()) return notFound();

  const album = snap.data();

  return (
    <main className="p-4">
      <h1 className="text-3xl font-bold">{album.title}</h1>
      <p className="text-lg mt-2">{album.description}</p>
    </main>
  );
}
