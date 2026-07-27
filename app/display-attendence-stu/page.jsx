"use client";
import dynamic from 'next/dynamic';

const Component = dynamic(() => import('@/pages/Students/StudentList'), { ssr: false });

export default function Page() {
  return <Component />;
}
