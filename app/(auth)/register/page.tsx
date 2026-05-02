import { redirect } from "next/navigation";

export default function RegisterPage() {
  redirect("/authenticate?mode=register");
}
