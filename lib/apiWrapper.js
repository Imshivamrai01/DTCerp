import { NextResponse } from 'next/server';
import dbConnect from './dbConnect';

export function apiWrapper(handler) {
  return async (req, ...args) => {
    try {
      await dbConnect();
      return await handler(req, ...args);
    } catch (err) {
      console.error("API Error:", err);
      const statusCode = err.statusCode || 500;
      return NextResponse.json(
        {
          message: err.message || "Internal Server Error",
          stack: process.env.NODE_ENV === "production" ? null : err.stack,
        },
        { status: statusCode }
      );
    }
  };
}
