"use client";
import dynamic from 'next/dynamic';

const Component = dynamic(() => import('@/pages/Admins/ManageAdmin'), { ssr: false });

export default function Page() {
  return <Component />;
}
