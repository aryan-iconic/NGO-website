import { AuthForm } from "@/components/auth/auth-form";
import { getCurrentUserId } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function LoginPage() {
  if (await getCurrentUserId()) redirect("/user/dashboard");
  return <AuthForm mode="login" />;
}
