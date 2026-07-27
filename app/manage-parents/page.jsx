"use client";
import dynamic from 'next/dynamic';

const Component = dynamic(() => import('@/views/Manage-Parents/ManageParents'), { ssr: false });

export default function Page() {
  return <Component />;
}
