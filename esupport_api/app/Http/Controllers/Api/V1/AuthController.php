<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use App\Http\Resources\UserResource;
use App\Models\ActivityLog;
use App\Models\ContentRevision;
use App\Models\Lead;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    private const MAX_ATTEMPTS = 5;

    private const LOCKOUT_SECONDS = 900;

    /**
     * Exchange email + password for an API token (valid for 7 days).
     */
    public function login(LoginRequest $request): JsonResponse
    {
        $email = Str::lower($request->string('email')->toString());
        $throttleKey = 'login:'.$email.'|'.$request->ip();

        if (RateLimiter::tooManyAttempts($throttleKey, self::MAX_ATTEMPTS)) {
            $minutes = (int) ceil(RateLimiter::availableIn($throttleKey) / 60);

            throw ValidationException::withMessages([
                'email' => "Too many attempts. Try again in {$minutes} minute".($minutes === 1 ? '' : 's').'.',
            ])->status(Response::HTTP_TOO_MANY_REQUESTS);
        }

        $user = User::query()->where('email', $email)->first();

        if ($user === null || ! Hash::check($request->string('password')->toString(), $user->password)) {
            RateLimiter::hit($throttleKey, self::LOCKOUT_SECONDS);

            throw ValidationException::withMessages(['email' => 'Incorrect email or password.']);
        }

        if (! $user->is_active) {
            throw ValidationException::withMessages(['email' => 'This account has been disabled. Contact an administrator.']);
        }

        RateLimiter::clear($throttleKey);

        $token = $user->createToken('admin-panel', expiresAt: now()->addDays(7))->plainTextToken;
        $user->forceFill(['last_login_at' => now()])->save();
        ActivityLog::record($user, 'auth.login');

        return response()->json([
            'token' => $token,
            'user' => new UserResource($user),
        ]);
    }

    /**
     * The signed-in user, plus counts the admin sidebar needs.
     */
    public function me(Request $request): JsonResponse
    {
        return response()->json([
            'user' => new UserResource($request->user()),
            'unread_leads' => Lead::query()->whereNull('read_at')->count(),
            'pending_approvals' => $request->user()->can('approve-content') ? ContentRevision::query()->pending()->count() : 0,
        ]);
    }

    public function logout(Request $request): Response
    {
        ActivityLog::record($request->user(), 'auth.logout');
        $request->user()->currentAccessToken()->delete();

        return response()->noContent();
    }
}
