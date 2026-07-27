"use client";
import dynamic from 'next/dynamic';

const Component = dynamic(() => import('@/pages/Lab/LabForm'), { ssr: false });

export default function Page() {
  return <Component />;
}
