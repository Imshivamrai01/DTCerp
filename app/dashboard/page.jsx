"use client";
import dynamic from 'next/dynamic';
const Home = dynamic(() => import('@/pages/Home'), { ssr: false });

export default function Dashboard() {
  return <Home />;
}