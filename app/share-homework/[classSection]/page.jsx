"use client";
import dynamic from 'next/dynamic';

const Component = dynamic(() => import('@/views/Homework/ShareHomework'), { ssr: false });

export default function Page() {
  return <Component />;
}
