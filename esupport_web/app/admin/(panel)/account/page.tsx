import { requireUser } from "@/lib/server/auth";
import AccountForm from "./AccountForm";

export const metadata = { title: "My account" };

export default async function AccountPage() {
    const { user } = await requireUser();
    return (
        <div className="max-w-xl">
            <h1 className="text-2xl font-bold tracking-tight">My account</h1>
            <p className="mb-6 mt-1 text-sm text-neutral-500">
                Signed in as {user.email} · <span className="uppercase tracking-wider">{user.role}</span>
            </p>
            <AccountForm name={user.name} />
        </div>
    );
}
