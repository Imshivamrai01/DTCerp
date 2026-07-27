"use client";
import dynamic from 'next/dynamic';

const Component = dynamic(() => import('@/views/Homework/AddHomework'), { ssr: false });

export default function Page() {
  return <Component />;
}
