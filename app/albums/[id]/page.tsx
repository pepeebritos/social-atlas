import { doc, getDoc } from 'firebase/firestore';
import { db } from 'lib/firebase';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';

// ✅ Correct type from Next.js for dynamic routes
interface PageProps {
  params: {
    id: string;
  };
}

// ✅ generateMetadata uses correct prop type — not Promise
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const ref = doc(db, 'albums', params.id);
  const snap = await getDoc(ref);

  if (!snap.exists()) {
    return {
      title: 'Album Not Found',
    };
  }

  const album = snap.data();

  return {
    title: `${album.title} | Social Atlas`,
    description: album.description || '',
  };
}

// ✅ Page function also uses PageProps (not Promise)
export default async function Page({ params }: PageProps) {
  const ref = doc(db, 'albums', params.id);
  const snap = await getDoc(ref);

  if (!snap.exists()) {
    notFound();
  }

  const album = snap.data();

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold">{album.title}</h1>
      <p className="mt-2 text-neutral-600">{album.description}</p>
    </div>
  );
}
