<?php

namespace App\Http\Resources;

use App\Models\User;
use Illuminate\Http\Request;

/** @mixin User */
class UserResource extends BaseResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'email' => $this->email,
            'role' => $this->role ? ['id' => $this->role->id, 'name' => $this->role->name, 'slug' => $this->role->slug] : null,
            'role_id' => $this->role_id,
            'is_active' => $this->is_active,
            'is_super_admin' => $this->isSuperAdmin(),
            'last_login_at' => $this->last_login_at,
            'created_at' => $this->created_at,
            'permissions' => $this->when(
                $request->user()?->is($this->resource),
                fn () => $this->permissionSlugs(),
            ),
        ];
    }
}
