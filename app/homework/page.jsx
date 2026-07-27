"use client";
import dynamic from 'next/dynamic';

const Component = dynamic(() => import('@/views/Homework/Homework'), { ssr: false });

export default function Page() {
  return <Component />;
}
