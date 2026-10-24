import { redirect } from "next/navigation";
import { getSession } from "@/lib/server/auth";
import AuthShell from "../_components/AuthShell";
import LoginForm from "./LoginForm";

export const metadata = { title: "Sign in" };

export default async function LoginPage() {
    if (await getSession()) redirect("/admin");
    return (
        <AuthShell title="Sign in" subtitle="Use the account your administrator created for you.">
            <LoginForm />
        </AuthShell>
    );
}
