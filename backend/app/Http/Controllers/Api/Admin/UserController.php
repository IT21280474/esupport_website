<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\UserResource;
use App\Models\Role;
use App\Models\User;
use App\Services\ActivityLogger;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Facades\Gate;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;

class UserController extends Controller
{
    public function index(Request $request): AnonymousResourceCollection
    {
        $users = User::with('role')
            ->when($request->string('search')->toString(), fn ($q, $term) => $q->where(
                fn ($w) => $w->where('name', 'like', "%{$term}%")->orWhere('email', 'like', "%{$term}%")
            ))
            ->orderBy('name')
            ->paginate($request->integer('per_page', 25));

        return UserResource::collection($users);
    }

    public function roles(): JsonResponse
    {
        return response()->json(
            Role::with('permissions:id,name,slug')->orderBy('id')->get()
                ->map(fn (Role $role) => [
                    'id' => $role->id,
                    'name' => $role->name,
                    'slug' => $role->slug,
                    'description' => $role->description,
                    'permissions' => $role->permissions->pluck('name'),
                ])
        );
    }

    public function show(User $user): UserResource
    {
        return new UserResource($user->load('role'));
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:120'],
            'email' => ['required', 'email', 'max:190', Rule::unique('users', 'email')],
            'password' => ['required', 'confirmed', Password::defaults()],
            'role_id' => ['required', 'integer', 'exists:roles,id'],
            'is_active' => ['boolean'],
        ]);

        $user = User::create($data + ['is_active' => true]);
        ActivityLogger::log('created', "Created admin user “{$user->name}”", $user);

        return (new UserResource($user->load('role')))->response()->setStatusCode(201);
    }

    public function update(Request $request, User $user): UserResource
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:120'],
            'email' => ['required', 'email', 'max:190', Rule::unique('users', 'email')->ignore($user->id)],
            'password' => ['nullable', 'confirmed', Password::defaults()],
            'role_id' => ['required', 'integer', 'exists:roles,id'],
            'is_active' => ['boolean'],
        ]);

        Gate::authorize('update', [$user, (int) $data['role_id'], $request->has('is_active') ? $request->boolean('is_active') : null]);

        if (empty($data['password'])) {
            unset($data['password']);
        }

        $user->update($data);
        ActivityLogger::log('updated', "Updated admin user “{$user->name}”", $user, ['fields' => array_keys($user->getChanges())]);

        return new UserResource($user->refresh()->load('role'));
    }

    public function destroy(User $user): JsonResponse
    {
        Gate::authorize('delete', $user);

        $user->delete();
        ActivityLogger::log('deleted', "Deleted admin user “{$user->name}”", $user);

        return response()->json(['message' => 'User deleted.']);
    }
}
