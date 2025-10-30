'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import MoviesPage from './Movies/page';

export default function Home() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [isAuth, setIsAuth] = useState(false); // token bormi yo‘qmi

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      router.replace("/LoginPage"); // push emas replace ishlat
    } else {
      setIsAuth(true);
      setLoading(false);
    }
  }, [router]);

  if (loading) {
return  }

  if (!isAuth) {
    return null; // redirect bo‘lguncha hech narsa ko‘rinmasin
  }

  return (
  <MoviesPage/>
  );
}
