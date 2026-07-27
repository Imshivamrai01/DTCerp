"use client";
import dynamic from 'next/dynamic';

const Component = dynamic(() => import('@/views/Parent-Dashboard/Attendance'), { ssr: false });

export default function Page() {
  return <Component />;
}
