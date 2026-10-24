import { api } from "@/lib/server/api";
import { requireUser } from "@/lib/server/auth";
import UserManager, { type UserRow } from "./UserManager";

export const metadata = { title: "Users & roles" };

export default async function UsersPage() {
    const { user, token } = await requireUser("admin");
    const { data: users } = await api<{ data: UserRow[] }>("/admin/users", { token });

    return (
        <div>
            <h1 className="text-2xl font-bold tracking-tight">Users &amp; roles</h1>
            <p className="mb-6 mt-1 max-w-2xl text-sm text-neutral-500">
                <strong>Admins</strong> can do everything, including managing users and resetting sections.{" "}
                <strong>Editors</strong> can edit all website content, media and the inbox, but can’t manage users.
            </p>
            <UserManager users={users} meId={user.id} />
        </div>
    );
}
