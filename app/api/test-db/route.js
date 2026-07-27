export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';

export async function GET() {
  try {
    const conn = await connectDB();
    const User = (await import('@/models/userModel')).default;
    const teachers = await User.find({ role: "Teacher" }).sort({ createdAt: -1 }).limit(10).lean();
    return NextResponse.json({ message: "Teachers found", teachers }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: "Failed to connect to MongoDB", error: error.message, stack: error.stack }, { status: 200 });
  }
}
