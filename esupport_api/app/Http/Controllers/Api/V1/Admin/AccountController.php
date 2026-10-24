<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\UpdateAccountRequest;
use App\Http\Resources\UserResource;
use App\Models\ActivityLog;

class AccountController extends Controller
{
    /**
     * Update the signed-in user's name and (optionally) password.
     */
    public function update(UpdateAccountRequest $request): UserResource
    {
        $user = $request->user();
        $user->name = $request->string('name')->toString();

        if ($request->filled('password')) {
            $user->password = $request->string('password')->toString();
            /* Other devices are signed out; this session stays. */
            $user->tokens()->whereKeyNot($user->currentAccessToken()->getKey())->delete();
            ActivityLog::record($user, 'account.password');
        }

        $user->save();

        return new UserResource($user);
    }
}
