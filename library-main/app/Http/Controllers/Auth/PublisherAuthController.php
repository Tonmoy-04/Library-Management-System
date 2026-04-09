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
}
