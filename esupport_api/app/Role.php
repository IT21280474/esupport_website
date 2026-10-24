<?php

namespace App;

enum Role: string
{
    /** Full access, including user management and resetting content. */
    case Admin = 'admin';

    /** Can edit content, media and the inbox, but not manage users. */
    case Editor = 'editor';
}
