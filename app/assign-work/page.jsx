"use client";
import dynamic from 'next/dynamic';

const Component = dynamic(() => import('@/views/Work-Assignment/AssignWork'), { ssr: false });

export default function Page() {
  return <Component />;
}
