export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/userModel';

export async function GET() {
  try {
    await connectDB();
    const allUsers = await User.find({}).select("email password role isActive name").lean();
    return NextResponse.json({ allUsers, success: true }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: error.message, stack: error.stack }, { status: 500 });
  }
}
