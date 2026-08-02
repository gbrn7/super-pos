<?php

namespace App\Http\Controllers;

use App\Models\User;
use Exception;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;
use Inertia\Response as InertiaResponse;
use Spatie\Permission\Models\Role;

class SetupController extends Controller
{
    public function index(): InertiaResponse
    {
        return Inertia::render('setup/index');
    }

    public function testDatabase(): JsonResponse
    {
        try {
            DB::connection()->getPdo();

            return response()->json([
                'success' => true,
                'message' => 'Database connection successful.',
            ]);
        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Database connection failed: '.$e->getMessage(),
            ], 500);
        }
    }

    public function runMigration(): JsonResponse
    {
        try {
            Artisan::call('migrate:fresh', ['--force' => true]);
            Artisan::call('db:seed', ['--force' => true]);

            return response()->json([
                'success' => true,
                'message' => 'Database migrated and seeded successfully.',
            ]);
        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Migration failed: '.$e->getMessage(),
            ], 500);
        }
    }

    public function complete(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'store_name' => 'required|string|max:255',
            'store_address' => 'nullable|string|max:500',
            'store_phone' => 'nullable|string|max:50',
            'currency' => 'required|string|max:10',
            'timezone' => 'required|string|max:100',
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users,email',
            'password' => 'required|string|min:8|confirmed',
        ]);

        DB::transaction(function () use ($validated) {
            $user = User::create([
                'name' => $validated['name'],
                'email' => $validated['email'],
                'password' => Hash::make($validated['password']),
            ]);

            // Ensure superadmin role exists and assign to user
            if (class_exists(Role::class)) {
                $role = Role::firstOrCreate(['name' => 'superadmin']);
                if (method_exists($user, 'assignRole')) {
                    $user->assignRole($role);
                }
            }

            // Write APP_INSTALLED=true to .env
            $envPath = base_path('.env');
            if (file_exists($envPath)) {
                $envContent = file_get_contents($envPath);
                if (str_contains($envContent, 'APP_INSTALLED=')) {
                    $envContent = preg_replace('/APP_INSTALLED=.*/', 'APP_INSTALLED=true', $envContent);
                } else {
                    $envContent .= "\nAPP_INSTALLED=true\n";
                }
                file_put_contents($envPath, $envContent);
            }

            config(['app.installed' => true]);
            Auth::login($user);
        });

        return redirect()->to('/dashboard');
    }
}
