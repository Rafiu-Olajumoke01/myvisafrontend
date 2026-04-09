'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function useAdminGuard() {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    const isStaff = localStorage.getItem('is_staff');

    if (!token || isStaff !== 'true') {
      router.replace('/login');
    } else {
      setReady(true);
    }
  }, []);

  return ready;
}