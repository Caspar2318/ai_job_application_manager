import { db } from "@/lib/db";
import { signToken } from "@/lib/auth";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

// this file is to create cookie for authentication,
// and the cookie will be used in the middleware to verify the user is logged in or not
export async function POST(req: Request) {
  const { email, password, type } = await req.json();

  if (!email || !password) {
    return NextResponse.json(
      { error: "Email and password are required" },
      { status: 400 },
    );
  }

  // register
  if (type === "register") {
    const existingUser = db.findUserByEmail(email);
    if (existingUser) {
      return NextResponse.json(
        { error: "User already exists" },
        { status: 400 },
      );
    }

    const hased = await bcrypt.hash(password, 10);
    const user = db.createUser({
      id: crypto.randomUUID(),
      email,
      password: hased,
    });

    const token = signToken(user.id);
    const res = NextResponse.json({ success: true });
    res.cookies.set("token", token, { httpOnly: true, path: "/" });
    return res;
  }

  // login
  if (type === "login") {
    const user = db.findUserByEmail(email);
    if (!user) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 400 },
      );
    }

    const valie = await bcrypt.compare(password, user.password);
    if (!valie) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 400 },
      );
    }

    const token = signToken(user.id);
    const res = NextResponse.json({ success: true });
    res.cookies.set("token", token, { httpOnly: true, path: "/" });
    return res;
  }
}
