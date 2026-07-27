"use client";
import dynamic from 'next/dynamic';

const Component = dynamic(() => import('@/views/Certificates/TCertificate'), { ssr: false });

export default function Page() {
  return <Component />;
}
