"use client";
import dynamic from 'next/dynamic';

const Component = dynamic(() => import('@/views/Teachers/AttendenceList'), { ssr: false });

export default function Page() {
  return <Component />;
}
