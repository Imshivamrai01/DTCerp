"use client";
import dynamic from 'next/dynamic';

const Component = dynamic(() => import('@/pages/Teachers/TeacherAttendance'), { ssr: false });

export default function Page() {
  return <Component />;
}
