"use client";
import { usePathname } from 'next/navigation';
import dynamic from 'next/dynamic';
const DashboardLayout = dynamic(() => import('@/components/DashboardLayout'), { ssr: false });

export default function ClientLayoutWrapper({ children }) {
  const pathname = usePathname();
  
  // Do not show sidebar on login page
  if (pathname === '/' || pathname === '/login') {
    return <>{children}</>;
  }
  
  return <DashboardLayout>{children}</DashboardLayout>;
}
