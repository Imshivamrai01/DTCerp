"use client";
import dynamic from 'next/dynamic';

const Component = dynamic(() => import('@/views/Parent-Dashboard/Homework'), { ssr: false });

export default function Page() {
  return <Component />;
}
