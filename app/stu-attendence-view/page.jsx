"use client";
import dynamic from 'next/dynamic';

const Component = dynamic(() => import('@/pages/Admins/ManageStuAtten'), { ssr: false });

export default function Page() {
  return <Component />;
}
