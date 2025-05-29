import { Metadata, ResolvingMetadata } from 'next';
import { notFound } from 'next/navigation';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

// ✅ Match Next.js Dynamic Route typing 100%
type Props = {
  params: {
    id: string;
  };
};

// ✅ Metadata function
export async function generateMetadata(
  { params }: Props,
  _parent: ResolvingMetadata
): Promise<Metadata> {
  const docRef = doc(db, 'albums', params.id);
  const snap = await getDoc(docRef);

  if (!snap.exists()) {
    return {
      title: 'Album Not Found',
    };
  }

  const data = snap.data();

  return {
    title: data?.title || 'Social Atlas Album',
    description: data?.description || 'Explore epic locations around the world.',
  };
}

// ✅ Page component
export default async function Page({ params }: Props) {
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
