"use client";
import dynamic from 'next/dynamic';

const Component = dynamic(() => import('@/pages/Fee-Management/TakeFee'), { ssr: false });

export default function Page() {
  return <Component />;
}
