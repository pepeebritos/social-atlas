// app/terms/page.tsx
'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

function TermsContent() {
  const params = useSearchParams();
  // Any dynamic logic based on URL

  return (
    <div className="p-6 text-white">
      {/* your actual Terms of Use content here */}
      <h1 className="text-2xl font-bold">Terms of Use</h1>
      <p>Effective as of ...</p>
    </div>
  );
}

export default function TermsPage() {
  return (
    <Suspense fallback={<div className="p-6 text-white">Loading terms...</div>}>
      <TermsContent />
    </Suspense>
  );
}
