"use client";
import dynamic from 'next/dynamic';

const Component = dynamic(() => import('@/views/Parent-Dashboard/Profile'), { ssr: false });

export default function Page() {
  return <Component />;
}
