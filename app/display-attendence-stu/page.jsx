"use client";
import dynamic from 'next/dynamic';

const Component = dynamic(() => import('@/views/Students/StudentList'), { ssr: false });

export default function Page() {
  return <Component />;
}
