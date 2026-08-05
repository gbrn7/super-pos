<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Support\Enums\RoleEnums;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;

class RecoveryController extends Controller
{
    public function verifyCode(Request $request): JsonResponse
    {
        $request->validate([
            'recovery_code' => ['required', 'string'],
        ]);

        $validCode = config('auth.recovery_code');

        if (! $validCode || $request->input('recovery_code') !== $validCode) {
            return response()->json([
                'message' => __('auth.recovery_code_invalid'),
                'errors' => [
                    'recovery_code' => [__('auth.recovery_code_invalid')],
                ],
            ], 422);
        }

        session(['recovery_verified' => true]);

        return response()->json([
            'success' => true,
            'message' => __('auth.recovery_code_verified'),
        ]);
    }

    public function createSuperadmin(Request $request): JsonResponse
    {
        if (! session('recovery_verified')) {
            return response()->json([
                'message' => __('auth.recovery_unauthorized'),
            ], 403);
        }

        $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users,email'],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
        ]);

        $user = User::create([
            'name' => $request->input('name'),
            'email' => $request->input('email'),
            'password' => Hash::make($request->input('password')),
        ]);

        if (class_exists(RoleEnums::class)) {
            $user->assignRole(RoleEnums::SUPER_ADMIN->value);
        } else {
            $user->assignRole('superadmin');
        }

        Auth::login($user);
        session()->forget('recovery_verified');

        return response()->json([
            'success' => true,
            'message' => __('auth.superadmin_created'),
            'redirect' => route('dashboard'),
        ]);
    }
}
