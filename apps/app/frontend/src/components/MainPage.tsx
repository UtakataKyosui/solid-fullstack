import type { Component } from 'solid-js';
import { createSignal, createEffect, Show, For } from 'solid-js';
import { startRegistration } from "@simplewebauthn/browser";
import { useAuth } from '../lib/auth';
import type { Passkey } from '../lib/types';
import { Button } from './ui/Button';
import Home from './home/Home';
import GenreList from './GenreList';
import LocationList from './LocationList';
import { Trash2, HomeIcon, Tags, MapPin } from 'lucide-solid';

const MainPage: Component = () => {
    const { user, logout, fetchWithAuth } = useAuth();
    const [message, setMessage] = createSignal("");
    const [passkeys, setPasskeys] = createSignal<Passkey[]>([]);
    const [activeTab, setActiveTab] = createSignal<'home' | 'genres' | 'locations'>('home');

    const fetchPasskeys = async () => {
        try {
            console.log("Fetching passkeys...");
            const res = await fetchWithAuth("/api/auth/passkeys/");
            if (res.ok) {
                const data = await res.json();
                console.log("Passkeys fetched:", data);
                setPasskeys(data);
            } else {
                console.error("Failed to fetch passkeys:", res.status, await res.text());
                // Optionally set an error message or leave empty logic
            }
        } catch (err) {
            console.error("Failed to fetch passkeys network error", err);
        }
    };

    // Fetch passkeys on mount
    createEffect(() => {
        fetchPasskeys();
    });

    // Debug user object
    createEffect(() => {
        console.log("Current user state:", user());
    });

    const registerPasskey = async () => {
        try {
            const startRes = await fetchWithAuth("/api/auth/passkeys/register/start", {
                method: "POST",
                headers: { "Content-Type": "application/json" }
            });
            if (!startRes.ok) throw new Error("Failed to start passkey registration");

            const startData = await startRes.json();

            const opts = startData.challenge.publicKey ? startData.challenge.publicKey : startData.challenge;

            const attestationResponse = await startRegistration(opts);

            const finishRes = await fetchWithAuth("/api/auth/passkeys/register/finish", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    register: attestationResponse,
                    state: startData.state
                })
            });

            if (finishRes.ok) {
                setMessage("Passkey registered successfully!");
                fetchPasskeys();
            } else {
                setMessage("Failed to register passkey: " + (await finishRes.text()));
            }

        } catch (err) {
            console.error(err);
            setMessage("Error registering passkey: " + (err as Error).message);
        }
    };

    const deletePasskey = async (id: number) => {
        if (!confirm("Are you sure you want to delete this passkey?")) return;
        try {
            const res = await fetchWithAuth(`/api/auth/passkeys/${id}`, { method: "DELETE" });
            if (res.ok) {
                setMessage("Passkey deleted successfully");
                fetchPasskeys();
            } else {
                setMessage("Failed to delete passkey");
            }
        } catch (err) {
            console.error(err);
        }
    };

    const deleteAccount = async () => {
        if (!confirm("Are you sure you want to delete your account? This action cannot be undone.")) return;
        try {
            const res = await fetchWithAuth("/api/auth/delete", { method: "DELETE" });
            if (res.ok) {
                logout();
            } else {
                setMessage("Failed to delete account");
            }
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div class="p-8">
            <div class="flex justify-between items-center mb-8">
                <h1 class="text-2xl font-bold">Home Organization</h1>
                <div class="flex items-center gap-4">
                    <span>Welcome, {user()?.name}</span>
                    <button
                        onClick={logout}
                        class="px-4 py-2 bg-red-600 rounded text-white hover:bg-red-700"
                    >
                        Logout
                    </button>
                </div>
            </div>

            <div class="flex gap-2 mb-6 border-b border-slate-700">
                <button
                    onClick={() => setActiveTab('home')}
                    class={`px-4 py-2 flex items-center gap-2 transition-colors ${activeTab() === 'home'
                            ? 'border-b-2 border-blue-500 text-blue-500'
                            : 'text-slate-400 hover:text-white'
                        }`}
                >
                    <HomeIcon size={18} />
                    ホーム
                </button>
                <button
                    onClick={() => setActiveTab('genres')}
                    class={`px-4 py-2 flex items-center gap-2 transition-colors ${activeTab() === 'genres'
                            ? 'border-b-2 border-blue-500 text-blue-500'
                            : 'text-slate-400 hover:text-white'
                        }`}
                >
                    <Tags size={18} />
                    ジャンル
                </button>
                <button
                    onClick={() => setActiveTab('locations')}
                    class={`px-4 py-2 flex items-center gap-2 transition-colors ${activeTab() === 'locations'
                            ? 'border-b-2 border-blue-500 text-blue-500'
                            : 'text-slate-400 hover:text-white'
                        }`}
                >
                    <MapPin size={18} />
                    場所
                </button>
            </div>

            <div class="mb-8 p-4 bg-slate-800 rounded-lg">
                <h3 class="text-lg font-medium text-white mb-4">Security</h3>

                <div class="mb-4">
                    <h4 class="text-sm font-medium text-slate-400 mb-2">Registered Passkeys</h4>
                    <div class="space-y-2">
                        <For each={passkeys()}>
                            {(pk) => (
                                <div class="flex items-center justify-between p-3 bg-slate-900 rounded border border-slate-700">
                                    <div>
                                        <div class="font-medium text-white">{pk.name}</div>
                                        <div class="text-xs text-slate-500">Last used: {new Date(pk.last_used_at).toLocaleDateString()}</div>
                                    </div>
                                    <div class="flex items-center gap-4">
                                        <div class="text-xs text-slate-500">
                                            Added: {new Date(pk.created_at).toLocaleDateString()}
                                        </div>
                                        <button
                                            onClick={() => deletePasskey(pk.id)}
                                            class="p-2 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded transition-colors"
                                            title="Delete passkey"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            )}
                        </For>
                        <Show when={passkeys().length === 0}>
                            <div class="text-slate-500 text-sm italic">No passkeys registered</div>
                        </Show>
                    </div>
                </div>

                <div class="mt-4 pt-4 border-t border-slate-700 flex justify-between items-center">
                    <Button onClick={registerPasskey} variant="outline" class="border-dashed w-full sm:w-auto">
                        Register New Passkey
                    </Button>

                    <button
                        onClick={deleteAccount}
                        class="text-xs text-red-500 hover:text-red-400 underline"
                    >
                        Delete Account
                    </button>
                </div>

                <Show when={message()}>
                    <div class={`mt-2 p-2 rounded text-sm ${message().includes("fail") || message().includes("Error") ? "text-red-400" : "text-emerald-400"}`}>
                        {message()}
                    </div>
                </Show>
            </div>

            <Show when={activeTab() === 'home'}>
                <Home />
            </Show>
            <Show when={activeTab() === 'genres'}>
                <GenreList />
            </Show>
            <Show when={activeTab() === 'locations'}>
                <LocationList />
            </Show>
        </div>
    );
};

export default MainPage;
