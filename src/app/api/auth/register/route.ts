import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { registerSchema } from "@/lib/schemas";
import { createUserSession } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const parsed = registerSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: { code: "VALIDATION_ERROR", message: parsed.error.issues[0]?.message } },
      { status: 400 }
    );
  }
  const { name, email, phone, password } = parsed.data;

  if (await db.findUserByEmail(email)) {
    return NextResponse.json(
      { success: false, error: { code: "EMAIL_IN_USE", message: "An account with this email already exists." } },
      { status: 409 }
    );
  }

  const user = await db.createUser(name, email, phone, password);
  await createUserSession(user.id);

  return NextResponse.json({ success: true, user: { id: user.id, name: user.name, email: user.email } });
}
