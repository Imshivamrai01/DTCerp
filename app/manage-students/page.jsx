"use client";
import dynamic from 'next/dynamic';

const Component = dynamic(() => import('@/views/Students/ManageStudents'), { ssr: false });

export default function Page() {
  return <Component />;
}
