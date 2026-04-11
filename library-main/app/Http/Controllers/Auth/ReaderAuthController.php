<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\Reader;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class ReaderAuthController extends Controller
{
    public function register(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255|unique:readers,email',
            'phone' => 'required|string|max:50',
            'address' => 'required|string|max:1000',
            'password' => 'required|string|min:8|confirmed',
        ]);

        $reader = Reader::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'phone' => $validated['phone'],
            'address' => $validated['address'],
            'password' => Hash::make($validated['password']),
            'is_online_registered' => true,
            'is_suspended' => false,
            'suspended_at' => null,
        ]);

        return response()->json([
            'message' => 'Registration successful! Please login.',
            'user' => $reader,
            'role' => 'reader',
        ], 201);
    }

    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        $reader = Reader::query()->where('email', $request->input('email'))->first();

        if (! $reader || ! Hash::check($request->input('password'), $reader->password)) {
            return response()->json(['message' => 'Invalid email or password'], 401);
        }

        if ((bool) $reader->is_suspended) {
            return response()->json(['message' => 'Your account has been suspended. Please contact admin.'], 403);
        }

        $token = auth('reader')->login($reader);

        return response()->json([
            'message' => 'Login successful',
            'token' => $token,
            'user' => auth('reader')->user(),
            'role' => 'reader',
        ], 200);
    }

    public function me()
    {
        return response()->json(auth('reader')->user());
    }

    public function logout(Request $request)
    {
        auth('reader')->logout();

        if ($request->expectsJson()) {
            return response()->json(['message' => 'Logout successful'], 200);
        }

        return redirect('/');
    }

    public function forgotPasswordReset(Request $request)
    {
        $validated = $request->validate([
            'email' => 'required|email|exists:readers,email',
            'new_password' => 'required|string|min:8',
        ]);

        $reader = Reader::query()->where('email', $validated['email'])->firstOrFail();
        $reader->password = Hash::make($validated['new_password']);
        $reader->save();

        return response()->json(['message' => 'Password reset successful. You can now log in with your new password.']);
    }

    public function updateProfile(Request $request)
    {
        $reader = auth('reader')->user();

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255|unique:readers,email,' . $reader->id,
            'phone' => 'nullable|string|max:50',
        ]);

        $reader->update([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'phone' => $validated['phone'] ?? $reader->phone,
        ]);

        return response()->json([
            'message' => 'Profile updated successfully.',
            'user' => $reader->fresh(),
        ]);
    }

    public function changePassword(Request $request)
    {
        $validated = $request->validate([
            'current_password' => 'required|string',
            'new_password' => 'required|string|min:8',
        ]);

        $reader = auth('reader')->user();

        if (! Hash::check($validated['current_password'], $reader->password)) {
            return response()->json(['message' => 'Current password is incorrect.'], 422);
        }

        $reader->password = Hash::make($validated['new_password']);
        $reader->save();

        return response()->json(['message' => 'Password changed successfully.']);
    }
}