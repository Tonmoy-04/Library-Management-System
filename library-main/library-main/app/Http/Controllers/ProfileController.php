<?php

namespace App\Http\Controllers;

use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Redirect;
use Illuminate\Support\Facades\Storage;
use Illuminate\View\View;
use App\Models\Profile;

class ProfileController extends Controller
{
    /**
     * Display the user's profile form.
     */
    public function edit(Request $request): View
    {
        $user = $request->user();
        // Get the profile linked to the user, or an empty model if none exists
        $profile = $user->profile ?? new Profile();

        return view('profile.edit', [
            'user' => $user,
            'profile' => $profile,
        ]);
    }

    /**
     * Update the user's profile information.
     */
    public function update(Request $request): RedirectResponse
{
    $user = $request->user();

    // 1. Validation
    $request->validate([
        'name' => 'required|string|max:255',
        'email' => 'required|email|max:255|unique:users,email,' . $user->id,
        'department' => 'required|string|max:255',
        'student_id' => 'required|string|max:50',
        'batch'      => 'required|string|max:50',
        'number'     => 'required|string|max:20',
        'gender'     => 'required|in:Male,Female,Other',
        'year'       => 'nullable|string', // Changed to string for text box
        'semester'   => 'nullable|string', // Changed to string for text box
        'profile_picture' => 'nullable|image|mimes:jpg,png,jpeg|max:2048',
        'current_password' => 'nullable|required_with:password|current_password',
        'password'   => 'nullable|min:8|confirmed',
    ]);

    // 2. Update User (Name & Email)
    $user->name = $request->name;
    $user->email = $request->email;

    // 3. Update Password only if verified
    if ($request->filled('password')) {
        $user->password = Hash::make($request->password);
    }
    $user->save();

    // 4. Handle Profile Picture & Data
    $profileData = $request->only(['department', 'student_id', 'batch', 'number', 'gender', 'year', 'semester']);

    if ($request->hasFile('profile_picture')) {
        if ($user->profile && $user->profile->profile_picture) {
            Storage::disk('public')->delete($user->profile->profile_picture);
        }
        $path = $request->file('profile_picture')->store('profiles', 'public');
        $profileData['profile_picture'] = $path;
    }

    $user->profile()->updateOrCreate(['user_id' => $user->id], $profileData);

    return Redirect::route('profile.edit')->with('status', 'profile-updated');
}

    /**
     * Delete the user's account.
     */
    public function destroy(Request $request): RedirectResponse
    {
        $request->validateWithBag('userDeletion', [
            'password' => ['required', 'current_password'],
        ]);

        $user = $request->user();

        Auth::logout();

        $user->delete();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return Redirect::to('/');
    }
}