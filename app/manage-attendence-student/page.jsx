"use client";
import dynamic from 'next/dynamic';

const Component = dynamic(() => import('@/views/Students/StudentAttendece'), { ssr: false });

export default function Page() {
  return <Component />;
}
