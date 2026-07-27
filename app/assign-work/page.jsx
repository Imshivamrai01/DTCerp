"use client";
import dynamic from 'next/dynamic';

const Component = dynamic(() => import('@/pages/Work-Assignment/AssignWork'), { ssr: false });

export default function Page() {
  return <Component />;
}
