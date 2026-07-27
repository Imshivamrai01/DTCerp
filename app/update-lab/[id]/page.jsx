"use client";
import dynamic from 'next/dynamic';

const Component = dynamic(() => import('@/views/Lab/UpdateLab'), { ssr: false });

export default function Page() {
  return <Component />;
}
