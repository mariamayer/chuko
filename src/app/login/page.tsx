import { redirect } from "next/navigation";

// Login has moved to /admin
export default function LoginRedirect() {
  redirect("/admin");
}
