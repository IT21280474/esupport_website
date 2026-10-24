<?php

namespace App;

enum RevisionStatus: string
{
    /** Submitted by an editor; not on the live site until an admin approves it. */
    case Pending = 'pending';

    /** Published to the live site (admin saves are approved straight away). */
    case Approved = 'approved';

    /** Turned down by an admin, with an optional note for the editor. */
    case Rejected = 'rejected';
}
