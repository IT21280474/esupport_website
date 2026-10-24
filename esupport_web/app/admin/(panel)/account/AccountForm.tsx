"use client";

import { useActionState } from "react";
import { updateAccountAction } from "../../actions";
import { btn, cardCls, helpCls, inputCls, labelCls } from "../../_components/ui";

export default function AccountForm({ name }: { name: string }) {
    const [state, action, pending] = useActionState(updateAccountAction, undefined);
    return (
        <form action={action} className={`${cardCls} space-y-5 p-5 sm:p-6`}>
            <div>
                <label className={labelCls} htmlFor="name">Display name</label>
                <input id="name" name="name" defaultValue={name} required className={inputCls} />
            </div>
            <fieldset className="space-y-4 border-t border-neutral-200 pt-5">
                <legend className="text-sm font-semibold">Change password</legend>
                <p className={helpCls}>Leave these empty to keep your current password.</p>
                <div>
                    <label className={labelCls} htmlFor="current">Current password</label>
                    <input id="current" name="current" type="password" autoComplete="current-password" className={inputCls} />
                </div>
                <div>
                    <label className={labelCls} htmlFor="password">New password</label>
                    <input id="password" name="password" type="password" autoComplete="new-password" minLength={8} className={inputCls} />
                </div>
                <div>
                    <label className={labelCls} htmlFor="confirm">Confirm new password</label>
                    <input id="confirm" name="confirm" type="password" autoComplete="new-password" minLength={8} className={inputCls} />
                </div>
            </fieldset>
            {state?.error && <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{state.error}</p>}
            {state?.ok && <p role="status" className="rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700">{state.ok}</p>}
            <button type="submit" disabled={pending} className={btn.primary}>{pending ? "Saving…" : "Save"}</button>
        </form>
    );
}
