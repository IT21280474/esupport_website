"use client";

import { useActionState } from "react";
import { loginAction } from "../actions";
import { btn, inputCls, labelCls } from "../_components/ui";

export default function LoginForm() {
    const [state, action, pending] = useActionState(loginAction, undefined);
    return (
        <form action={action} className="space-y-4">
            <div>
                <label htmlFor="email" className={labelCls}>Email</label>
                <input id="email" name="email" type="email" autoComplete="username" required autoFocus className={inputCls} />
            </div>
            <div>
                <label htmlFor="password" className={labelCls}>Password</label>
                <input id="password" name="password" type="password" autoComplete="current-password" required className={inputCls} />
            </div>
            {state?.error && <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{state.error}</p>}
            <button type="submit" disabled={pending} className={`${btn.primary} w-full py-2.5`}>
                {pending ? "Signing in…" : "Sign in"}
            </button>
        </form>
    );
}
