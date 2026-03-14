<nav
    x-data="lanternNav()"
    x-init="init()"
    class="bg-white border-b border-blue-200"
>

    <div
        x-show="open"
        x-transition.opacity
        @click="open = false"
        class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-40 lg:hidden"
    ></div>

    <div class="w-full px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-16 gap-4">
            <div class="flex items-center gap-3 shrink-0">
                <a href="{{ route('home') }}" class="flex items-center gap-2 group">
                    <img
                        src="{{ asset('images/logo.png') }}"
                        alt="CampusMart Logo"
                        class="h-9 w-auto transition-opacity duration-200 group-hover:opacity-90"
                    />
                    <span class="hidden sm:block font-monsta tracking-[0.3em] text-blue-600">
                        CampusMart
                    </span>
                </a>
            </div>

            <div class="hidden lg:flex flex-1 justify-center">
                <div
                    class="relative flex items-center gap-5 rounded-2xl bg-blue-50 p-2
                        shadow-sm ring-1 ring-blue-100"
                    x-ref="tabWrap"
                >
                    <div
                        class="absolute top-2 bottom-2 rounded-xl bg-blue-200 transition-all duration-300 ease-out"
                        :style="activePillStyle"
                    ></div>

                    <template x-for="item in items" :key="item.key">
                        <a
                            :href="item.href"
                            class="relative z-10 px-6 py-3 rounded-xl text-sm font-semibold
                                   transition-all duration-300 ease-out
                                   text-blue-700 hover:text-blue-900"
                            :class="isActive(item) ? 'bg-white text-blue-600 shadow' : ''"
                            @mouseenter="onEnter($event)"
                            @mouseleave="onLeave($event)"
                            @focus="onEnter($event)"
                            @blur="onLeave($event)"
                        >
                            <span class="relative">
                                <span x-text="item.label"></span>

                                <span
                                    class="absolute left-0 -bottom-1 h-[2px] w-full origin-left scale-x-0 rounded-full
                                           transition-transform duration-300 ease-out"
                                    :class="isActive(item) ? 'scale-x-100 bg-blue-600' : 'bg-blue-300/40'"
                                ></span>
                            </span>
                        </a>
                    </template>
                </div>
            </div>

            <div class="hidden sm:flex items-center gap-3 shrink-0 mr-4">
                <x-dropdown align="right" width="48" content-classes="bg-transparent shadow-none p-0">
                    <x-slot name="trigger">
                        <button
                            class="group inline-flex items-center justify-center h-10 w-10 rounded-full
                                border-2 border-blue-400 text-blue-400 font-semibold
                                hover:border-blue-600 hover:text-blue-600
                                transition-all duration-300"
                        >
                            {{ strtoupper(substr(Auth::user()->name, 0, 1)) }}
                        </button>
                    </x-slot>

                    <x-slot name="content">
                        <div
                            class="rounded-2xl bg-white p-2
                                shadow-xl ring-1 ring-blue-100"
                        >
                            <x-dropdown-link
                                :href="route('profile.edit')"
                                class="block rounded-xl px-4 py-2.5 text-sm font-semibold
                                    text-gray-700 hover:bg-blue-50 transition"
                            >
                                Profile
                            </x-dropdown-link>

                            <form method="POST" action="{{ route('logout') }}">
                                @csrf
                                <x-dropdown-link
                                    :href="route('logout')"
                                    onclick="event.preventDefault(); this.closest('form').submit();"
                                    class="block rounded-xl px-4 py-2.5 text-sm font-semibold
                                        text-gray-700 hover:bg-blue-50 transition"
                                >
                                    Log Out
                                </x-dropdown-link>
                            </form>
                        </div>
                    </x-slot>
                </x-dropdown>
            </div>

            <div class="flex items-center gap-3 lg:hidden">
                <x-dropdown align="right" width="48" content-classes="bg-transparent shadow-none p-0">
                    <x-slot name="trigger">
                        <button
                            class="group inline-flex items-center justify-center h-10 w-10 rounded-full
                                border-2 border-blue-400 text-blue-400 font-semibold
                                hover:border-blue-600 hover:text-blue-600
                                transition-all duration-300"
                            aria-label="Open profile menu"
                        >
                            {{ strtoupper(substr(Auth::user()->name, 0, 1)) }}
                        </button>
                    </x-slot>

                    <x-slot name="content">
                        <div class="rounded-2xl bg-white p-2 shadow-xl ring-1 ring-blue-100">
                            <x-dropdown-link
                                :href="route('profile.edit')"
                                class="block rounded-xl px-4 py-2.5 text-sm font-semibold
                                    text-gray-700 hover:bg-blue-50 transition"
                            >
                                Profile
                            </x-dropdown-link>

                            <form method="POST" action="{{ route('logout') }}">
                                @csrf
                                <x-dropdown-link
                                    :href="route('logout')"
                                    onclick="event.preventDefault(); this.closest('form').submit();"
                                    class="block rounded-xl px-4 py-2.5 text-sm font-semibold
                                        text-gray-700 hover:bg-blue-50 transition"
                                >
                                    Log Out
                                </x-dropdown-link>
                            </form>
                        </div>
                    </x-slot>
                </x-dropdown>

                <button
                    @click="open = !open"
                    class="flex items-center justify-center w-11 h-11 rounded-xl
                        bg-white ring-1 ring-blue-100 shadow-sm
                        hover:bg-blue-50 hover:ring-blue-200
                        transition-all duration-300"
                    aria-label="Toggle menu"
                >
                    <img
                        x-show="!open"
                        src="{{ asset('images/icons/open.svg') }}"
                        alt="Open menu"
                        class="w-6 h-6 select-none"
                    />

                    <img
                        x-show="open"
                        src="{{ asset('images/icons/close.svg') }}"
                        alt="Close menu"
                        class="w-6 h-6 select-none"
                    />
                </button>
            </div>
        </div>
    </div>

    <div
        x-show="open"
        x-transition:enter="transition ease-out duration-250"
        x-transition:enter-start="opacity-0 -translate-y-2"
        x-transition:enter-end="opacity-100 translate-y-0"
        x-transition:leave="transition ease-in duration-200"
        x-transition:leave-start="opacity-100 translate-y-0"
        x-transition:leave-end="opacity-0 -translate-y-2"
        class="lg:hidden border-t border-blue-200 bg-white relative z-50"
    >
        <div class="px-4 py-4 space-y-2">
            <template x-for="item in items" :key="'m-' + item.key">
                <a
                    :href="item.href"
                    class="flex items-center justify-between px-4 py-3 rounded-xl
                        text-sm font-semibold transition-all duration-300
                        text-blue-700 hover:text-blue-900
                        hover:bg-blue-50 ring-1 ring-transparent hover:ring-blue-100"
                    :class="isActive(item) ? 'bg-blue-50 text-blue-600 ring-1 ring-blue-100' : ''"
                >
                    <span x-text="item.label"></span>

                    <span
                        class="h-[2px] w-10 rounded-full transition-transform duration-300 origin-left"
                        :class="isActive(item) ? 'scale-x-100 bg-blue-600' : 'scale-x-0 bg-blue-300/50'"
                    ></span>
                </a>
            </template>
        </div>
    </div>

    <script>
        function lanternNav() {
            return {
                open: false,

                items: [
                    { key: 'home', label: 'Home', href: "{{ route('home') }}" },
                    { key: 'schedule',  label: 'Schedule',  href: "{{ url('/schedule') }}" },
                    { key: 'tasks',     label: 'Tasks',     href: "{{ url('/tasks') }}" },
                    { key: 'progress',  label: 'Progress',  href: "{{ url('/progress') }}" },
                    { key: 'subjects',  label: 'Subjects',  href: "{{ url('/subjects') }}" },
                    { key: 'notes',     label: 'Notes',     href: "{{ url('/notes') }}" },
                    { key: 'habits',    label: 'Habits',    href: "{{ url('/habits') }}" },
                    { key: 'ach',       label: 'Achievements', href: "{{ url('/achievements') }}" },
                    { key: 'resources', label: 'Resources', href: "{{ url('/resources') }}" },
                    // Added Profile here if you want it in the sliding pill menu too
                    { key: 'profile', label: 'Profile', href: "{{ route('profile.edit') }}" },
                ],

                activeKey: 'home',
                activePillStyle: 'left: 8px; width: 0px;',

                init() {
                    const path = window.location.pathname;

                    const map = [
                        ['home', 'home'],
                        ['schedule', 'schedule'],
                        ['tasks', 'tasks'],
                        ['progress', 'progress'],
                        ['subjects', 'subjects'],
                        ['notes', 'notes'],
                        ['habits', 'habits'],
                        ['achievements', 'ach'],
                        ['resources', 'resources'],
                        ['profile', 'profile'], // Added this line to keep pill on Profile
                    ];

                    for (const [segment, key] of map) {
                        if (path.includes(segment)) {
                            this.activeKey = key;
                            break;
                        }
                    }

                    this.$nextTick(() => this.syncPillToActive());
                    window.addEventListener('resize', () => this.syncPillToActive());
                },

                isActive(item) {
                    return item.key === this.activeKey;
                },

                syncPillToActive() {
                    const wrap = this.$refs.tabWrap;
                    if (!wrap) return;

                    const anchors = wrap.querySelectorAll('a');
                    const activeIndex = this.items.findIndex(i => i.key === this.activeKey);
                    
                    // Safety check in case the activeIndex isn't found
                    if (activeIndex === -1) return;
                    
                    const el = anchors[activeIndex];
                    if (!el) return;

                    const wrapRect = wrap.getBoundingClientRect();
                    const elRect = el.getBoundingClientRect();

                    const left = (elRect.left - wrapRect.left);
                    const width = elRect.width;

                    this.activePillStyle = `left:${left}px; width:${width}px;`;
                },

                onEnter(e) {
                    const el = e.currentTarget;
                    const wrap = this.$refs.tabWrap;
                    if (!wrap) return;

                    const wrapRect = wrap.getBoundingClientRect();
                    const elRect = el.getBoundingClientRect();

                    const left = (elRect.left - wrapRect.left);
                    const width = elRect.width;

                    this.activePillStyle = `left:${left}px; width:${width}px;`;
                },

                onLeave() {
                    this.syncPillToActive();
                },
            }
        }
    </script>
</nav>