import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { loginSchema } from "@/lib/schemas";
import { createUserSession } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const parsed = loginSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: { code: "VALIDATION_ERROR", message: "Enter a valid email and password." } },
      { status: 400 }
    );
  }
  const user = await db.verifyUserPassword(parsed.data.email, parsed.data.password);
  if (!user) {
    // Generic message — avoids account enumeration.
    return NextResponse.json(
      { success: false, error: { code: "INVALID_CREDENTIALS", message: "Incorrect email or password." } },
      { status: 401 }
    );
  }
  await createUserSession(user.id);
  return NextResponse.json({ success: true, user: { id: user.id, name: user.name, email: user.email } });
}
