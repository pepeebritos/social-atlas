import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

// ✅ Properly typed for Next.js 15+ App Router
type AlbumPageProps = {
  params: {
    id: string;
  };
};

// Optional: Dynamic metadata per album
export async function generateMetadata({ params }: AlbumPageProps): Promise<Metadata> {
  return {
    title: `Album ${params.id}`,
  };
}

export default async function AlbumPage({ params }: AlbumPageProps) {
  const ref = doc(db, 'posts/albums', params.id);
  const snap = await getDoc(ref);

  if (!snap.exists()) {
    return notFound();
  }

  const data = snap.data();

  return (
    <main className="min-h-screen bg-[#1e1e1e] text-white p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold">{data.title}</h1>

        {data.description && (
          <p className="text-gray-400">{data.description}</p>
        )}

        {data.location && (
          <p className="text-sm text-gray-500">📍 {data.location}</p>
        )}

        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 pt-4">
          {data.imageUrls?.map((url: string, idx: number) => (
            <img
              key={idx}
              src={url}
              alt={`Album photo ${idx + 1}`}
              className="w-full h-64 object-cover rounded-lg"
            />
          ))}
        </div>
      </div>
    </main>
  );
}
