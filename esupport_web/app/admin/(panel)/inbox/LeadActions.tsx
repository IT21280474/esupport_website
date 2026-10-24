"use client";

import { useTransition } from "react";
import { deleteLeadAction, markLeadAction } from "../../actions";
import { btn } from "../../_components/ui";

export default function LeadActions({ id, read, email }: { id: number; read: boolean; email: string }) {
    const [pending, start] = useTransition();
    return (
        <span className="flex gap-1">
            <a href={`mailto:${email}?subject=${encodeURIComponent("Your enquiry to eSupport Technologies")}`} className={btn.small}>Reply</a>
            <button type="button" disabled={pending} onClick={() => start(() => markLeadAction(id, !read))} className={btn.small}>
                {read ? "Mark unread" : "Mark read"}
            </button>
            <button
                type="button"
                disabled={pending}
                onClick={() => confirm(`Delete the enquiry from ${email}?`) && start(() => deleteLeadAction(id))}
                className={`${btn.small} hover:text-red-600`}
            >
                Delete
            </button>
        </span>
    );
}
