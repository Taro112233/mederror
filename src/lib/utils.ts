import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 10)
}

export async function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash)
}

export function verifyJwtToken(token: string): unknown {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET is not set in environment variables");
  }
  try {
    return jwt.verify(token, secret);
  } catch {
    throw new Error("Invalid or expired JWT token");
  }
}
