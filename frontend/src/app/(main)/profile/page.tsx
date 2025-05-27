'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export default function ProfileRedirect() {
    const router = useRouter();
    const { user } = useAuth();

    useEffect(() => {
        if (user?.id) {
            router.push(`/profile/${encodeURIComponent(user.id)}`);
        }
    }, [user, router]);

    return null;
}