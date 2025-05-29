import { doc, getDoc } from 'firebase/firestore';
import { db } from 'lib/firebase';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';

// ✅ Explicit type for props
interface PageProps {
  params: {
    id: string;
  };
}

// ✅ Fully explicit generateMetadata
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const docRef = doc(db, 'albums', params.id);
  const snapshot = await getDoc(docRef);

  if (!snapshot.exists()) return {};

  const album = snapshot.data();
  return {
    title: album.title || 'Album',
    description: album.description || '',
  };
}

// ✅ Fully explicit page component
export default async function AlbumPage({ params }: PageProps) {
  const docRef = doc(db, 'albums', params.id);
  const snapshot = await getDoc(docRef);

  if (!snapshot.exists()) return notFound();

  const album = snapshot.data();

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold">{album.title}</h1>
      <p className="mt-2 text-lg text-neutral-600">{album.description}</p>
    </div>
  );
}
