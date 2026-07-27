"use client";
import dynamic from 'next/dynamic';

const Component = dynamic(() => import('@/pages/Parent-Dashboard/Profile'), { ssr: false });

export default function Page() {
  return <Component />;
}
