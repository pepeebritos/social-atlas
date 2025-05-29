import { NextResponse } from 'next/server';
import { db } from 'lib/firebase';
import { collection, getDocs } from 'firebase/firestore';

type RouteData = {
  id: string;
  public: boolean;
  // You can add more fields here as needed (e.g., geojson, name, user, etc.)
};

export async function GET() {
  try {
    const routesRef = collection(db, 'routes');
    const snapshot = await getDocs(routesRef);

    const publicRoutes: RouteData[] = snapshot.docs
      .map(doc => ({ id: doc.id, ...(doc.data() as RouteData) }))
      .filter(route => route.public); // ✅ Type-safe now

    return NextResponse.json(publicRoutes);
  } catch (error) {
    console.error('Error fetching public routes:', error);
    return NextResponse.json(
      { error: 'Failed to fetch public routes' },
      { status: 500 }
    );
  }
}
