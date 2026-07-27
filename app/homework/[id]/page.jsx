"use client";
import dynamic from 'next/dynamic';

const Component = dynamic(() => import('@/pages/Homework/EditHomework'), { ssr: false });

export default function Page() {
  return <Component />;
}
