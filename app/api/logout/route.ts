import { NextResponse } from "next/server";

export async function POST() {
  const res = NextResponse.json({ success: true });

  res.cookies.set("token", "", {
    httpOnly: true,
    path: "/",
    maxAge: 0, // 立即删除
  });

  return res;
}
