import { NextResponse } from "next/server";

export async function POST() {
  try {
    const response = NextResponse.json({ success: true });
    
    // ล้าง session_token
    response.cookies.set("session_token", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      expires: new Date(0),
      sameSite: "lax"
    });

    // ล้าง security_token
    response.cookies.set("security_token", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      expires: new Date(0),
      sameSite: "strict"
    });

    return response;

  } catch (error) {
    console.error("Security logout error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
} 