"use client";
import dynamic from 'next/dynamic';

const Component = dynamic(() => import('@/pages/Manage-Copies/ManageCopies'), { ssr: false });

export default function Page() {
  return <Component />;
}
