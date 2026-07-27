"use client";
import dynamic from 'next/dynamic';

const Component = dynamic(() => import('@/pages/Admins/ManageAdmins'), { ssr: false });

export default function Page() {
  return <Component />;
}
