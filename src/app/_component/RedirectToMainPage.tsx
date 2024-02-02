"use client";

import { useRouter } from 'next/navigation'
import { useEffect } from 'react';

export default function RedirectToMainPage() {
    const router = useRouter();

    useEffect(() => {
        router.replace('/');
    }, [router]);

    return (
        <></>
    )
}
