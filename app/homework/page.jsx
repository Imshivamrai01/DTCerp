"use client";
import dynamic from 'next/dynamic';

const Component = dynamic(() => import('@/pages/Homework/Homework'), { ssr: false });

export default function Page() {
  return <Component />;
}
