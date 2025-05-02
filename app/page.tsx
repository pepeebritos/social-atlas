'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function RedirectHome() {
  const router = useRouter();

  useEffect(() => {
    router.push('/welcome');
  }, [router]);

  return null;
}
