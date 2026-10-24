<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreUserRequest;
use App\Http\Requests\Admin\UpdateUserRequest;
use App\Http\Resources\UserResource;
use App\Models\ActivityLog;
use App\Models\User;
use App\Role;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Http\Response;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class UserController extends Controller
{
    public function index(): AnonymousResourceCollection
    {
        return UserResource::collection(User::query()->orderBy('role')->orderBy('name')->get());
    }

    public function store(StoreUserRequest $request): JsonResponse
    {
        $user = User::query()->create([
            'name' => $request->string('name')->toString(),
            'email' => Str::lower($request->string('email')->toString()),
            'password' => $request->string('password')->toString(),
            'role' => $request->enum('role', Role::class),
        ]);

        ActivityLog::record($request->user(), 'user.create', "{$user->name} <{$user->email}> as {$user->role->value}");

        return (new UserResource($user))->response()->setStatusCode(Response::HTTP_CREATED);
    }

    public function update(UpdateUserRequest $request, User $user): UserResource
    {
        $role = $request->has('role') ? $request->enum('role', Role::class) : $user->role;
        $isActive = $request->has('is_active') ? $request->boolean('is_active') : $user->is_active;

        if ($request->user()->is($user) && ! $isActive) {
            throw ValidationException::withMessages(['is_active' => "You can't disable your own account."]);
        }

        $losingAdmin = $user->isAdmin() && $user->is_active && ($role !== Role::Admin || ! $isActive);
        if ($losingAdmin && $this->activeAdminCount() <= 1) {
            throw ValidationException::withMessages(['role' => 'There must always be at least one active administrator.']);
        }

        $user->fill([
            'name' => $request->input('name', $user->name),
            'role' => $role,
            'is_active' => $isActive,
        ]);

        $passwordChanged = $request->filled('password');
        if ($passwordChanged) {
            $user->password = $request->string('password')->toString();
        }
        $user->save();

        if (! $isActive || $passwordChanged) {
            /* Sign the user out everywhere (keep the admin's own current session). */
            $user->tokens()
                ->when($request->user()->is($user), fn ($query) => $query->whereKeyNot($request->user()->currentAccessToken()->getKey()))
                ->delete();
        }

        ActivityLog::record($request->user(), 'user.update', sprintf(
            '%s (%s%s%s)',
            $user->name,
            $user->role->value,
            $isActive ? '' : ', disabled',
            $passwordChanged ? ', password reset' : '',
        ));

        return new UserResource($user);
    }

    public function destroy(Request $request, User $user): Response
    {
        if ($request->user()->is($user)) {
            throw ValidationException::withMessages(['user' => "You can't delete your own account."]);
        }
        if ($user->isAdmin() && $user->is_active && $this->activeAdminCount() <= 1) {
            throw ValidationException::withMessages(['user' => 'There must always be at least one active administrator.']);
        }

        $user->tokens()->delete();
        $user->delete();
        ActivityLog::record($request->user(), 'user.delete', $user->name);

        return response()->noContent();
    }

    private function activeAdminCount(): int
    {
        return User::query()->where('role', Role::Admin)->where('is_active', true)->count();
    }
}
