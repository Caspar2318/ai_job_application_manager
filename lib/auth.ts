import jwt, { JwtPayload } from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET as string;

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET is not defined");
}

type TokenPayload = JwtPayload & {
  userId: string;
};

export function signToken(userId: string): string {
  return jwt.sign({ userId }, JWT_SECRET, {
    expiresIn: "7d",
  });
}

export function verifyToken(token: string): string | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as TokenPayload;

    if (!decoded.userId) {
      return null;
    }

    return decoded.userId;
  } catch {
    return null;
  }
}
