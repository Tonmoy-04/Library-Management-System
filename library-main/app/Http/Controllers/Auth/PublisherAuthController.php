<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\Publisher;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class PublisherAuthController extends Controller
{
    public function register(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255|unique:publishers,email',
            'description' => 'required|string|max:500',
            'city' => 'required|string|max:255',
            'country' => 'required|string|max:255',
            'password' => 'required|string|min:8|confirmed',
        ]);

        $publisher = Publisher::create([
            'name' => $validated['name'] ?? $validated['email'],
            'email' => $validated['email'],
            'description' => $validated['description'],
            'city' => $validated['city'],
            'country' => $validated['country'],
            'password' => Hash::make($validated['password']),
            'is_suspended' => false,
        ]);

        return response()->json([
            'message' => 'Registration successful! Please login.',
            'user' => $publisher,
            'role' => 'publisher',
        ], 201);
    }

    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        $publisher = Publisher::query()->where('email', $request->input('email'))->first();

        if ($publisher && isset($publisher->is_suspended) && (bool) $publisher->is_suspended) {
            return response()->json(['message' => 'Your account has been suspended. Please contact admin.'], 403);
        }

        $credentials = $request->only('email', 'password');

        if (! $token = auth('publisher')->attempt($credentials)) {
            return response()->json(['message' => 'Invalid email or password'], 401);
        }

        return response()->json([
            'message' => 'Login successful',
            'token' => $token,
            'user' => auth('publisher')->user(),
            'role' => 'publisher',
        ], 200);
    }

    public function me()
    {
        return response()->json(auth('publisher')->user());
    }

    public function logout(Request $request)
    {
        auth('publisher')->logout();

        if ($request->expectsJson()) {
            return response()->json(['message' => 'Logout successful'], 200);
        }

        return redirect('/');
    }

    public function forgotPasswordReset(Request $request)
    {
        $validated = $request->validate([
            'email' => 'required|email|exists:publishers,email',
            'new_password' => 'required|string|min:8',
        ]);

        $publisher = Publisher::query()->where('email', $validated['email'])->firstOrFail();
        $publisher->password = Hash::make($validated['new_password']);
        $publisher->save();

        return response()->json(['message' => 'Password reset successful. You can now log in with your new password.']);
    }

    public function updateProfile(Request $request)
    {
        $publisher = auth('publisher')->user();

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255|unique:publishers,email,' . $publisher->id,
            'phone' => 'nullable|string|max:50',
        ]);

        $publisher->update([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'phone' => $validated['phone'] ?? $publisher->phone,
        ]);

        return response()->json([
            'message' => 'Profile updated successfully.',
            'user' => $publisher->fresh(),
        ]);
    }

    public function changePassword(Request $request)
    {
        $validated = $request->validate([
            'current_password' => 'required|string',
            'new_password' => 'required|string|min:8',
        ]);

        $publisher = auth('publisher')->user();

        if (! Hash::check($validated['current_password'], $publisher->password)) {
            return response()->json(['message' => 'Current password is incorrect.'], 422);
        }

        $publisher->password = Hash::make($validated['new_password']);
        $publisher->save();

        return response()->json(['message' => 'Password changed successfully.']);
    }
}
