"use client";

import { useActionState, useState, useTransition } from "react";
import { createUserAction, deleteUserAction, updateUserAction } from "../../actions";
import { btn, cardCls, formatDate, helpCls, inputCls, labelCls } from "../../_components/ui";

export type UserRow = {
    id: number;
    name: string;
    email: string;
    role: "admin" | "editor";
    is_active: boolean;
    created_at: string;
    last_login_at: string | null;
};

function Message({ state }: { state: { error?: string; ok?: string } | undefined }) {
    if (state?.error) return <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{state.error}</p>;
    if (state?.ok) return <p role="status" className="rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700">{state.ok}</p>;
    return null;
}

function EditUser({ user, isMe, onDone }: { user: UserRow; isMe: boolean; onDone: () => void }) {
    const [state, action, pending] = useActionState(updateUserAction, undefined);
    return (
        <form action={action} className="grid gap-4 border-t border-neutral-200 bg-neutral-50/60 px-5 py-5 sm:grid-cols-2">
            <input type="hidden" name="id" value={user.id} />
            <div>
                <label className={labelCls} htmlFor={`name-${user.id}`}>Name</label>
                <input id={`name-${user.id}`} name="name" defaultValue={user.name} className={inputCls} />
            </div>
            <div>
                <label className={labelCls} htmlFor={`role-${user.id}`}>Role</label>
                <select id={`role-${user.id}`} name="role" defaultValue={user.role} className={inputCls}>
                    <option value="editor">Editor</option>
                    <option value="admin">Admin</option>
                </select>
            </div>
            <div>
                <label className={labelCls} htmlFor={`pw-${user.id}`}>Set a new password</label>
                <input id={`pw-${user.id}`} name="password" type="password" autoComplete="new-password" placeholder="Leave empty to keep current" className={inputCls} />
                <p className={helpCls}>Signs the user out of other devices.</p>
            </div>
            <label className="flex items-center gap-2 self-center text-sm">
                <input type="checkbox" name="active" defaultChecked={user.is_active} disabled={isMe} className="h-4 w-4 accent-neutral-900" />
                Account active {isMe && <span className="text-xs text-neutral-400">(you)</span>}
                {isMe && <input type="hidden" name="active" value="on" />}
            </label>
            <div className="flex flex-wrap items-center gap-2 sm:col-span-2">
                <button type="submit" disabled={pending} className={btn.primary}>{pending ? "Saving…" : "Save changes"}</button>
                <button type="button" onClick={onDone} className={btn.ghost}>Close</button>
                <div className="flex-1"><Message state={state} /></div>
            </div>
        </form>
    );
}

export default function UserManager({ users, meId }: { users: UserRow[]; meId: number }) {
    const [createState, createAction, creating] = useActionState(createUserAction, undefined);
    const [editing, setEditing] = useState<number | null>(null);
    const [error, setError] = useState("");
    const [pending, start] = useTransition();

    const remove = (u: UserRow) => {
        if (!confirm(`Remove ${u.name}? They will lose access immediately.`)) return;
        start(async () => {
            const res = await deleteUserAction(u.id);
            setError(res.error ?? "");
        });
    };

    return (
        <div className="space-y-8">
            <div className={`${cardCls} overflow-hidden`}>
                {error && <p className="border-b border-red-100 bg-red-50 px-5 py-2 text-sm text-red-700">{error}</p>}
                <ul className="divide-y divide-neutral-100">
                    {users.map(u => (
                        <li key={u.id}>
                            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 px-5 py-3">
                                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-neutral-900 text-sm font-bold text-white">
                                    {u.name.charAt(0).toUpperCase()}
                                </span>
                                <div className="min-w-0 flex-1">
                                    <p className="truncate text-sm font-medium">
                                        {u.name} {u.id === meId && <span className="text-xs font-normal text-neutral-400">(you)</span>}
                                    </p>
                                    <p className="truncate text-xs text-neutral-500">{u.email}</p>
                                </div>
                                <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wider ${u.role === "admin" ? "bg-neutral-900 text-white" : "bg-neutral-100 text-neutral-600"}`}>
                                    {u.role}
                                </span>
                                {!u.is_active && <span className="rounded-full bg-red-50 px-2 py-0.5 text-[11px] font-semibold uppercase text-red-600">Disabled</span>}
                                <span className="hidden w-44 text-right text-xs text-neutral-400 md:block">
                                    {u.last_login_at ? `Last seen ${formatDate(u.last_login_at)}` : "Never signed in"}
                                </span>
                                <button type="button" onClick={() => setEditing(editing === u.id ? null : u.id)} className={btn.small}>Edit</button>
                                {u.id !== meId && (
                                    <button type="button" onClick={() => remove(u)} disabled={pending} className={`${btn.small} hover:text-red-600`}>Remove</button>
                                )}
                            </div>
                            {editing === u.id && <EditUser user={u} isMe={u.id === meId} onDone={() => setEditing(null)} />}
                        </li>
                    ))}
                </ul>
            </div>

            <section className={`${cardCls} p-5 sm:p-6`}>
                <h2 className="text-base font-semibold">Add a team member</h2>
                <p className="mb-5 mt-1 text-sm text-neutral-500">Share the email and password with them privately — they can change the password under “My account”.</p>
                <form action={createAction} className="grid gap-4 sm:grid-cols-2">
                    <div>
                        <label className={labelCls} htmlFor="new-name">Name</label>
                        <input id="new-name" name="name" required className={inputCls} />
                    </div>
                    <div>
                        <label className={labelCls} htmlFor="new-email">Email</label>
                        <input id="new-email" name="email" type="email" required className={inputCls} />
                    </div>
                    <div>
                        <label className={labelCls} htmlFor="new-password">Temporary password</label>
                        <input id="new-password" name="password" type="password" autoComplete="new-password" minLength={8} required className={inputCls} />
                    </div>
                    <div>
                        <label className={labelCls} htmlFor="new-role">Role</label>
                        <select id="new-role" name="role" defaultValue="editor" className={inputCls}>
                            <option value="editor">Editor — content, media, inbox</option>
                            <option value="admin">Admin — everything incl. users</option>
                        </select>
                    </div>
                    <div className="flex flex-wrap items-center gap-3 sm:col-span-2">
                        <button type="submit" disabled={creating} className={btn.primary}>{creating ? "Adding…" : "Add user"}</button>
                        <div className="flex-1"><Message state={createState} /></div>
                    </div>
                </form>
            </section>
        </div>
    );
}
