{{-- Temporary Debug Line --}}
<div class="bg-black text-green-400 p-4 font-mono text-xs">
    Debug: Student ID in DB is: "{{ $profile->student_id }}"
</div>

<x-app-layout>
    <div class="py-12 bg-blue-50/50 min-h-screen">
        <div class="max-w-5xl mx-auto sm:px-6 lg:px-8">
            <form method="POST" action="{{ route('profile.update') }}" enctype="multipart/form-data" autocomplete="off">
                @csrf
                @method('patch')

                <div class="p-8 bg-white shadow-sm ring-1 ring-blue-100 sm:rounded-2xl flex flex-col md:flex-row items-center gap-8 mb-6">
                    <div class="relative">
                        <img id="preview" src="{{ $profile->profile_picture ? asset('storage/' . $profile->profile_picture) : 'https://ui-avatars.com/api/?name='.urlencode($user->name).'&background=EBF4FF&color=2563EB' }}" 
                             class="h-32 w-32 rounded-full object-cover border-4 border-white shadow-md">
                        <label for="profile_picture" class="absolute bottom-0 right-0 bg-blue-600 p-2 rounded-full text-white cursor-pointer hover:bg-blue-700 shadow-lg transition">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                        </label>
                        <input type="file" id="profile_picture" name="profile_picture" class="hidden" onchange="previewImage(event)">
                    </div>
                    
                    <div class="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label class="text-xs font-bold text-blue-600 uppercase">Full Name</label>
                            <input type="text" name="name" value="{{ old('name', $user->name) }}" class="mt-1 block w-full rounded-xl border-blue-100 focus:ring-blue-200">
                        </div>
                        <div>
                            <label class="text-xs font-bold text-blue-600 uppercase">Email Address</label>
                            <input type="email" name="email" value="{{ old('email', $user->email) }}" class="mt-1 block w-full rounded-xl border-blue-100 focus:ring-blue-200">
                        </div>
                    </div>
                </div>

                <div class="p-8 bg-white shadow-sm ring-1 ring-blue-100 sm:rounded-2xl mb-6">
                    <h4 class="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
                        <span class="w-1 h-6 bg-blue-600 rounded-full"></span> ACADEMIC INFORMATION
                    </h4>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label class="block text-sm font-semibold text-gray-700">Student ID</label>
                            <input type="text" name="student_id" value="{{ old('student_id', $profile->student_id) }}" autocomplete="none" class="mt-1 block w-full rounded-xl border-gray-200">
                        </div>
                        <div>
                            <label class="block text-sm font-semibold text-gray-700">Department</label>
                            <input type="text" name="department" value="{{ old('department', $profile->department) }}" class="mt-1 block w-full rounded-xl border-gray-200">
                        </div>
                        <div class="grid grid-cols-2 gap-4">
                            <div>
                                <label class="block text-sm font-semibold text-gray-700">Year</label>
                                <input type="text" name="year" value="{{ old('year', $profile->year) }}" class="mt-1 block w-full rounded-xl border-gray-200">
                            </div>
                            <div>
                                <label class="block text-sm font-semibold text-gray-700">Semester</label>
                                <input type="text" name="semester" value="{{ old('semester', $profile->semester) }}" class="mt-1 block w-full rounded-xl border-gray-200">
                            </div>
                        </div>
                        <div>
                            <label class="block text-sm font-semibold text-gray-700">Batch Number</label>
                            <input type="text" name="batch" value="{{ old('batch', $profile->batch) }}" class="mt-1 block w-full rounded-xl border-gray-200">
                        </div>
                    </div>
                </div>

                <div class="p-8 bg-white shadow-sm ring-1 ring-blue-100 sm:rounded-2xl">
                    <h4 class="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
                        <span class="w-1 h-6 bg-red-400 rounded-full"></span> SECURITY SETTINGS
                    </h4>
                    <div class="space-y-6">
                        <div>
                            <label class="block text-sm font-semibold text-gray-700">Current Password (Required to change password)</label>
                            <input type="password" name="current_password" autocomplete="new-password" placeholder="Enter old password" class="mt-1 block w-full rounded-xl border-gray-200">
                        </div>
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label class="block text-sm font-semibold text-gray-700">New Password</label>
                                <input type="password" name="password" autocomplete="new-password" placeholder="Min 8 characters" class="mt-1 block w-full rounded-xl border-gray-200">
                            </div>
                            <div>
                                <label class="block text-sm font-semibold text-gray-700">Confirm New Password</label>
                                <input type="password" name="password_confirmation" autocomplete="new-password" class="mt-1 block w-full rounded-xl border-gray-200">
                            </div>
                        </div>
                    </div>

                    <div class="mt-8 flex justify-end">
                        <button type="submit" class="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold shadow-lg hover:bg-blue-700 transition active:scale-95">
                            Update My Profile
                        </button>
                    </div>
                </div>
            </form>
        </div>
    </div>
</x-app-layout>