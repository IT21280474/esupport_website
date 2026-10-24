/* Human-readable activity log lines. */
const VERBS: Record<string, string> = {
    "auth.login": "signed in",
    "auth.logout": "signed out",
    "auth.setup": "set up the admin panel",
    "content.save": "updated",
    "content.reset": "reset to defaults:",
    "content.restore": "restored",
    "content.submit": "sent for approval:",
    "content.approve": "approved changes to",
    "content.reject": "turned down changes to",
    "media.upload": "uploaded",
    "media.capture": "captured a screenshot of",
    "media.delete": "deleted media",
    "user.create": "added user",
    "user.update": "updated user",
    "user.delete": "removed user",
    "account.password": "changed their password",
    "lead.delete": "deleted enquiry",
};

export function describeActivity(action: string, detail: string | null): string {
    const verb = VERBS[action] ?? action;
    return detail ? `${verb} ${detail}` : verb;
}
