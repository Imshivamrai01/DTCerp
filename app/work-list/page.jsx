"use client";
import dynamic from 'next/dynamic';

const Component = dynamic(() => import('@/views/Work-Assignment/WorkList'), { ssr: false });

export default function Page() {
  return <Component />;
}
