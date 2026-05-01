import { db } from "@/lib/db";
import { signToken } from "@/lib/auth";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isValidPassword(password: string) {
  return (
    password.length >= 8 &&
    /[A-Z]/.test(password) &&
    /[a-z]/.test(password) &&
    /[0-9]/.test(password)
  );
}

export async function POST(req: Request) {
  try {
    const { email, password, type } = await req.json();

    if (!email || !password || !type) {
      return NextResponse.json(
        { error: "Email, password and type are required" },
        { status: 400 },
      );
    }

    if (type !== "login" && type !== "register") {
      return NextResponse.json({ error: "Invalid auth type" }, { status: 400 });
    }

    if (!isValidEmail(email)) {
      return NextResponse.json({ error: "Invalid email" }, { status: 400 });
    }

    if (!isValidPassword(password)) {
      return NextResponse.json(
        { error: "Password does not meet requirements" },
        { status: 400 },
      );
    }

    if (type === "register") {
      const existingUser = await db.user.findUnique({
        where: { email },
      });

      if (existingUser) {
        return NextResponse.json(
          { error: "User already exists" },
          { status: 400 },
        );
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const user = await db.user.create({
        data: {
          email,
          password: hashedPassword,
        },
      });

      const token = signToken(user.id);

      const res = NextResponse.json({ success: true });

      res.cookies.set("token", token, {
        httpOnly: true,
        path: "/",
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        maxAge: 60 * 60 * 24 * 7,
      });

      return res;
    }

    const user = await db.user.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 400 },
      );
    }

    const valid = await bcrypt.compare(password, user.password);

    if (!valid) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 400 },
      );
    }

    const token = signToken(user.id);

    const res = NextResponse.json({ success: true });

    res.cookies.set("token", token, {
      httpOnly: true,
      path: "/",
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7,
    });

    return res;
  } catch (error) {
    console.error("AUTH_ERROR:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
