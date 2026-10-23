<?php

namespace Database\Seeders;

use App\Enums\Role as RoleEnum;
use App\Models\Role;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

/**
 * Creates the first Super Admin from ADMIN_NAME / ADMIN_EMAIL / ADMIN_PASSWORD.
 * If no password is configured a strong random one is generated and printed once.
 */
class AdminUserSeeder extends Seeder
{
    public function run(): void
    {
        $email = config('muthumala.admin.email');

        if (User::withTrashed()->where('email', $email)->exists()) {
            $this->command?->info("Admin user {$email} already exists — skipped.");

            return;
        }

        $password = config('muthumala.admin.password') ?: Str::password(16, symbols: false);

        User::create([
            'name' => config('muthumala.admin.name'),
            'email' => $email,
            'password' => $password,
            'role_id' => Role::where('slug', RoleEnum::SuperAdmin->value)->value('id'),
            'is_active' => true,
        ])->forceFill(['email_verified_at' => now()])->save();

        $this->command?->warn("Super Admin created: {$email}".(config('muthumala.admin.password') ? '' : " / password: {$password}"));
        $this->command?->warn('Change this password after the first sign-in.');
    }
}
