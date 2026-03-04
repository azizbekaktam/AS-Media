'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { motion } from 'framer-motion';
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
      <div className="bg-gradient min-h-screen flex-center">
        <LoadingSpinner text="Tizim yuklanmoqda..." size="lg" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="bg-gradient min-h-screen flex-center">
        <LoadingSpinner text="Redirecting..." size="lg" />
      </div>
    );
  }

  return (
    <div className="bg-gradient min-h-screen">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        <MoviesPage />
      </motion.div>
    </div>
  );
}
