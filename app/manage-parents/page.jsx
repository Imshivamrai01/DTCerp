"use client";
import dynamic from 'next/dynamic';

const Component = dynamic(() => import('@/pages/Manage-Parents/ManageParents'), { ssr: false });

export default function Page() {
  return <Component />;
}
