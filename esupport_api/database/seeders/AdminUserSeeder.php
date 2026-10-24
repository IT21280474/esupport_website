<?php

namespace Database\Seeders;

use App\Models\User;
use App\Role;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

/**
 * Creates the first administrator from ADMIN_EMAIL / ADMIN_PASSWORD (or a random password).
 */
class AdminUserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $email = Str::lower((string) env('ADMIN_EMAIL', 'admin@esupport.live'));

        if (User::query()->where('email', $email)->exists()) {
            $this->command?->info("Administrator {$email} already exists — left unchanged.");

            return;
        }

        $password = (string) env('ADMIN_PASSWORD') ?: Str::password(16, symbols: false);

        User::query()->create([
            'name' => (string) env('ADMIN_NAME', 'eSupport Admin'),
            'email' => $email,
            'password' => $password,
            'role' => Role::Admin,
        ]);

        $this->command?->info("Administrator created: {$email} / {$password}");
    }
}
