"use client";
import dynamic from 'next/dynamic';

const Component = dynamic(() => import('@/views/Lab/LabList'), { ssr: false });

export default function Page() {
  return <Component />;
}
