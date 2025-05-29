// app/privacy/page.tsx
'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

function PrivacyContent() {
  const params = useSearchParams();
  // your logic here...

  return (
    <div className="p-6 text-white">
      {/* your actual content here */}
    </div>
  );
}

export default function PrivacyPage() {
  return (
    <Suspense fallback={<div className="p-6 text-white">Loading privacy...</div>}>
      <PrivacyContent />
    </Suspense>
  );
}
