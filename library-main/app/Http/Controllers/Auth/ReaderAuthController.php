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

        $credentials = $request->only('email', 'password');

        if (! $token = auth('reader')->attempt($credentials)) {
            return response()->json(['message' => 'Invalid email or password'], 401);
        }

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
}