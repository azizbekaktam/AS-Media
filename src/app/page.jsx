'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { MoviesPage } from '../route-pages/movies-page';
import { useAuthContext } from '../features/authentication/auth-provider';
import { LoadingSpinner } from '../shared/ui/loading-spinner';

export default function Home() {
  const router = useRouter();
  const { user, loading } = useAuthContext();

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/LoginPage");
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-neutral-950">
        <LoadingSpinner text="Checking authentication..." />
      </div>
    );
  }

  if (!user) {
    return null; 
  }

  return <MoviesPage />;
}
