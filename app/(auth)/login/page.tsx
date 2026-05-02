import { redirect } from "next/navigation";

export default function LoginPage() {
  redirect("/authenticate?mode=login");
}
