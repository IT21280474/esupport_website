<?php

namespace App\Policies;

use App\Enums\Permission;
use App\Enums\Role;
use App\Models\User;
use Illuminate\Auth\Access\Response;

/**
 * Guards admin-account management beyond the plain manage_users permission:
 * nobody can delete or lock themselves out, and the last active super admin
 * can never be removed or demoted.
 */
class UserPolicy
{
    public function manage(User $actor): bool
    {
        return $actor->hasPermission(Permission::ManageUsers);
    }

    public function update(User $actor, User $target, ?int $newRoleId = null, ?bool $active = null): Response
    {
        if (! $this->manage($actor)) {
            return Response::deny();
        }

        $losesSuperAdmin = $target->isSuperAdmin()
            && (($newRoleId !== null && $newRoleId !== $target->role_id) || $active === false);

        if ($losesSuperAdmin && $this->isLastSuperAdmin($target)) {
            return Response::deny('At least one active Super Admin account is required.');
        }

        if ($actor->is($target) && $active === false) {
            return Response::deny('You cannot deactivate your own account.');
        }

        return Response::allow();
    }

    public function delete(User $actor, User $target): Response
    {
        if (! $this->manage($actor)) {
            return Response::deny();
        }

        if ($actor->is($target)) {
            return Response::deny('You cannot delete your own account.');
        }

        if ($target->isSuperAdmin() && $this->isLastSuperAdmin($target)) {
            return Response::deny('At least one active Super Admin account is required.');
        }

        return Response::allow();
    }

    private function isLastSuperAdmin(User $target): bool
    {
        return User::where('is_active', true)
            ->whereKeyNot($target->id)
            ->whereRelation('role', 'slug', Role::SuperAdmin->value)
            ->doesntExist();
    }
}
