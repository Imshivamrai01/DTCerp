"use client";
import dynamic from 'next/dynamic';

const Component = dynamic(() => import('@/views/Manage-Copies/ManageCopies'), { ssr: false });

export default function Page() {
  return <Component />;
}
