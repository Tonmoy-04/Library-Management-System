<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\ValidationException;
use Tymon\JWTAuth\Facades\JWTAuth;

class AuthController extends Controller
{
    /**
     * Create a new AuthController instance.
     *
     * @return void
     */
    public function __construct()
    {
        // No middleware in constructor, web routes will handle it.
    }

    /**
     * Show the application's login form.
     *
     * @return \Illuminate\View\View
     */
    public function showLoginForm()
    {
        return view('auth.login');
    }

    /**
     * Show the application's registration form.
     *
     * @return \Illuminate\View\View
     */
    public function showRegistrationForm()
    {
        return view('auth.register');
    }

    /**
     * Handle a login request to the application.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        $credentials = $request->only('email', 'password');

        // Try to get JWT token using credentials
        if (!$token = auth('api')->attempt($credentials)) {
            return response()->json(['message' => 'Invalid email or password'], 401);
        }

        // Get the authenticated user
        $user = auth('api')->user();

        return response()->json([
            'message' => 'Login successful',
            'token' => $token,
            'user' => $user
        ], 200);
    }

    /**
     * Handle a registration request for the application.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function register(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => [
                'required', 
                'string', 
                'email', 
                'max:255', 
                'unique:users', 
                'regex:/^[A-Za-z0-9._%+-]+@aust\.edu$/i'
            ],
            'password' => 'required|string|min:8|confirmed',
        ], [
            'email.regex' => 'The email must be a valid @aust.edu address.',
            'password.min' => 'The password must be at least 8 characters.'
        ]);

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
        ]);

        return response()->json([
            'message' => 'Registration successful! Please login.',
            'user' => $user
        ], 201);
    }

    /**
     * Log the user out of the application.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\RedirectResponse|\Illuminate\Http\JsonResponse
     */
    public function logout(Request $request)
    {
        auth('api')->logout();

        if ($request->expectsJson()) {
            return response()->json(['message' => 'Logout successful'], 200);
        }

        return redirect('/');
    }

    /**
     * Get the authenticated user.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function me()
    {
        return response()->json(auth('api')->user());
    }

    /**
     * Refresh the JWT token.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function refresh()
    {
        $token = auth('api')->refresh();
        
        return response()->json([
            'message' => 'Token refreshed',
            'token' => $token,
            'user' => auth('api')->user()
        ]);
    }
}