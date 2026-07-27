"use client";
import dynamic from 'next/dynamic';

const Component = dynamic(() => import('@/pages/Manage-exam-copies/ManageExamCopies'), { ssr: false });

export default function Page() {
  return <Component />;
}
