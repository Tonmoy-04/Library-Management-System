<x-app-layout>
    <div class="min-h-screen bg-[#0f172a] text-slate-200 font-sans pb-16">
        
        <div class="max-w-7xl mx-auto px-4 py-8">
            <div class="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <div class="lg:col-span-8 relative rounded-[2.5rem] overflow-hidden bg-[#1e293b] h-[450px] shadow-2xl border border-slate-800">
                    <img src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=1470" class="w-full h-full object-cover opacity-40">
                    <div class="absolute inset-0 flex flex-col justify-center items-center text-center p-6">
                        <h2 class="text-white text-4xl font-black mb-6 tracking-tighter">AUST Semester <span class="text-yellow-400">Survival</span> Kit</h2>
                        <button class="bg-gradient-to-r from-indigo-600 to-blue-500 text-white px-10 py-4 rounded-2xl font-black text-xl shadow-xl hover:scale-105 transition-all">
                            POST AN AD FOR FREE →
                        </button>
                    </div>
                </div>

                <div class="lg:col-span-4 bg-[#1e293b] rounded-[2.5rem] p-8 border border-slate-800 shadow-xl">
                    <div class="flex justify-between items-center mb-8">
                        <h3 class="text-2xl font-bold text-white">Top Deals</h3>
                        <span class="bg-red-500 text-white text-[10px] px-2 py-1 rounded-lg font-bold">LIVE</span>
                    </div>
                    <div class="space-y-4">
                        @php
                            $deals = [
                                ['name' => 'Akash PYQ Set', 'off' => '60% Off', 'icon' => '📚', 'color' => 'text-blue-400'],
                                ['name' => 'Drafting Board', 'off' => '৳500 Off', 'icon' => '📐', 'color' => 'text-emerald-400'],
                                ['name' => 'Scientific Calc', 'off' => 'Used 1yr', 'icon' => '🧮', 'color' => 'text-purple-400']
                            ];
                        @endphp
                        @foreach($deals as $deal)
                        <div class="flex items-center gap-4 p-4 bg-slate-800/40 rounded-2xl border border-slate-700/50 hover:border-yellow-500/30 transition-all cursor-pointer">
                            <div class="w-12 h-12 bg-slate-700 rounded-xl flex items-center justify-center text-xl">
                                {{ $deal['icon'] }}
                            </div>
                            <div>
                                <p class="font-bold text-slate-100 text-sm">{{ $deal['name'] }}</p>
                                <p class="text-[11px] {{ $deal['color'] }} font-black uppercase">{{ $deal['off'] }}</p>
                            </div>
                        </div>
                        @endforeach
                    </div>
                    <button class="w-full mt-8 py-4 bg-yellow-400 text-black rounded-2xl font-black hover:bg-white transition-all shadow-lg shadow-yellow-500/10">
                        View All Items
                    </button>
                </div>
            </div>
        </div>

        <div class="max-w-7xl mx-auto px-4 py-10">
            <div class="bg-gradient-to-r from-blue-900/40 to-indigo-900/40 rounded-[2.5rem] p-8 border border-indigo-500/20 flex flex-col md:flex-row items-center justify-between gap-6">
                <div class="flex items-center gap-6">
                    <div class="w-16 h-16 bg-yellow-400 rounded-2xl flex items-center justify-center text-3xl animate-pulse">📢</div>
                    <div>
                        <h4 class="text-xl font-black text-white">Campus Buzz</h4>
                        <p class="text-slate-400 text-sm italic">"Final Year Design Project (FYDP) fair starts this Thursday at the auditorium!"</p>
                    </div>
                </div>
                <button class="bg-white/10 hover:bg-white/20 text-white px-6 py-3 rounded-xl font-bold border border-white/10 transition-all text-sm whitespace-nowrap">
                    See All News
                </button>
            </div>
        </div>

        <div class="max-w-7xl mx-auto px-4 py-20 text-center">
            <h2 class="text-4xl font-black text-white mb-2">Real Student Conversations</h2>
            <p class="text-slate-500 mb-12 font-medium">See how AUSTians are closing deals everyday</p>
            <div class="bg-[#1e293b] rounded-[3rem] p-10 grid grid-cols-1 md:grid-cols-3 gap-8 border border-slate-800">
                <div class="rounded-3xl overflow-hidden shadow-2xl border-4 border-slate-700 transform hover:scale-105 transition-transform cursor-pointer">
                    <img src="https://via.placeholder.com/400x650?text=WhatsApp+Deal+1" class="w-full">
                </div>
                <div class="rounded-3xl overflow-hidden shadow-2xl border-4 border-slate-700 transform hover:-rotate-2 transition-transform cursor-pointer">
                    <img src="https://via.placeholder.com/400x650?text=WhatsApp+Deal+2" class="w-full">
                </div>
                <div class="rounded-3xl overflow-hidden shadow-2xl border-4 border-slate-700 transform hover:rotate-2 transition-transform cursor-pointer">
                    <img src="https://via.placeholder.com/400x650?text=WhatsApp+Deal+3" class="w-full">
                </div>
            </div>
        </div>

        <div class="max-w-7xl mx-auto px-4 py-16">
            <div class="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center bg-white rounded-[3rem] py-12 shadow-2xl">
                <div>
                    <h2 class="text-4xl font-black text-slate-900 italic">1,600</h2>
                    <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2">Verified Students</p>
                </div>
                <div>
                    <h2 class="text-4xl font-black text-slate-900 italic">150+</h2>
                    <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2">Active Listings</p>
                </div>
                <div>
                    <h2 class="text-4xl font-black text-slate-900 italic">৳18k</h2>
                    <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2">Saved by Students</p>
                </div>
                <div>
                    <h2 class="text-4xl font-black text-slate-900 italic">4.9</h2>
                    <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2">User Trust Score</p>
                </div>
            </div>
        </div>

        <div class="max-w-4xl mx-auto px-4 py-12">
            <div class="text-center">
                <h2 class="text-3xl font-black text-white mb-8 italic">Ready to make your first trade?</h2>
                <div class="flex flex-col sm:flex-row justify-center gap-6">
                    <button class="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-12 py-5 rounded-2xl font-black shadow-xl hover:shadow-blue-500/20">I want to Buy</button>
                    <button class="bg-white text-slate-900 px-12 py-5 rounded-2xl font-black shadow-xl hover:bg-slate-100">I want to Sell</button>
                </div>
            </div>
        </div>

    </div>
</x-app-layout>