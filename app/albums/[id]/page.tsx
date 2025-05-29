import { doc, getDoc } from 'firebase/firestore';
import { db } from 'lib/firebase';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';

// ✅ Fix generateMetadata with correct inline typing
export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const docRef = doc(db, 'albums', params.id);
  const docSnap = await getDoc(docRef);

  if (!docSnap.exists()) {
    return { title: 'Album not found' };
  }

  const data = docSnap.data();
  return {
    title: `${data.title} | Social Atlas`,
    description: data.description || '',
  };
}

// ✅ Fix Page props typing as well
export default async function Page({ params }: { params: { id: string } }) {
  const docRef = doc(db, 'albums', params.id);
  const docSnap = await getDoc(docRef);

  if (!docSnap.exists()) {
    notFound();
  }

  const data = docSnap.data();

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold">{data.title}</h1>
      <p className="text-neutral-700">{data.description}</p>
    </div>
  );
}
