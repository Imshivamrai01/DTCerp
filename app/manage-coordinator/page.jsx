"use client";
import dynamic from 'next/dynamic';

const Component = dynamic(() => import('@/views/Admins/ManageCoordinator'), { ssr: false });

export default function Page() {
  return <Component />;
}
