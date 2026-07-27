"use client";
import dynamic from 'next/dynamic';

const Component = dynamic(() => import('@/pages/Admins/ManageCoordinator'), { ssr: false });

export default function Page() {
  return <Component />;
}
