"use client";
import dynamic from 'next/dynamic';

const Component = dynamic(() => import('@/pages/Admins/ManageStructure'), { ssr: false });

export default function Page() {
  return <Component />;
}
