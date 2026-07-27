"use client";
import dynamic from 'next/dynamic';

const Component = dynamic(() => import('@/views/Fee-Management/ViewFees'), { ssr: false });

export default function Page() {
  return <Component />;
}
