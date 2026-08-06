import { redirect } from "next/navigation";
import { auth } from "@/auth";
import AuthForm from "@/components/AuthForm";

export default async function SignupPage() {
  const session = await auth();
  if (session?.user) redirect("/");

  return <AuthForm mode="signup" />;
}
