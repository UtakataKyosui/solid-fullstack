import type { Component } from 'solid-js';
import { createSignal, createEffect, Show } from 'solid-js';
// import { For } from 'solid-js'; // Commented out with passkey features
// import { startRegistration } from "@simplewebauthn/browser";
import { useAuth } from '../lib/auth';
// import type { Passkey } from '../lib/types';
import { Button } from '@/components/ui/button';
import Home from './home/Home';
import GenreList from './GenreList';
import LocationList from './LocationList';
import { HomeIcon, Tags, MapPin } from 'lucide-solid';
// import { Trash2 } from 'lucide-solid'; // Commented out with passkey features
import { css } from 'styled-system/css';
import { Box, Flex } from 'styled-system/jsx';
// import { Stack } from 'styled-system/jsx'; // Commented out with passkey features

const MainPage: Component = () => {
    const { user, logout } = useAuth();
    // const { fetchWithAuth } = useAuth(); //Commented out with passkey features
    // const [message, setMessage] = createSignal("");
    // const [passkeys, setPasskeys] = createSignal<Passkey[]>([]);
    const [activeTab, setActiveTab] = createSignal<'home' | 'genres' | 'locations'>('home');

    // TODO: Re-enable authentication features in separate branch
    /*
    const fetchPasskeys = async () => {
        try {
            console.log("Fetching passkeys...");
            const res = await fetchWithAuth("/api/auth/passkeys");
            if (res.ok) {
                const data = await res.json();
                console.log("Passkeys fetched:", data);
                setPasskeys(data);
            } else {
                console.error("Failed to fetch passkeys:", res.status, await res.text());
            }
        } catch (err) {
            console.error("Failed to fetch passkeys network error", err);
        }
    };

    createEffect(() => {
        fetchPasskeys();
    });
    */

    createEffect(() => {
        console.log("Current user state:", user());
    });

    /*
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
    */

    const tabButtonClass = (isActive: boolean) => css({
        px: { base: '3', sm: '4' },
        py: '2',
        display: 'flex',
        alignItems: 'center',
        gap: { base: '1', sm: '2' },
        transition: 'colors',
        whiteSpace: 'nowrap',
        borderBottom: isActive ? '2px solid' : 'none',
        borderColor: isActive ? 'blue.500' : 'transparent',
        color: isActive ? 'blue.500' : 'slate.400',
        _hover: { color: isActive ? 'blue.500' : 'white' }
    });

    return (
        <Box p={{ base: '4', sm: '8' }}>
            <Flex
                direction={{ base: 'column', sm: 'row' }}
                justify="space-between"
                align={{ base: 'start', sm: 'center' }}
                mb={{ base: '6', sm: '8' }}
                gap="4">
                <h1 class={css({ fontSize: { base: 'xl', sm: '2xl' }, fontWeight: 'bold' })}>
                    Home Organization
                </h1>
                <Flex align="center" gap={{ base: '2', sm: '4' }} w={{ base: 'full', sm: 'auto' }}>
                    <span class={css({ fontSize: { base: 'sm', sm: 'base' }, truncate: true })}>
                        Welcome, {user()?.name}
                    </span>
                    <Button
                        onClick={logout}
                        size={{ base: 'sm', sm: 'md' }}
                        variant="outline"
                        class={css({ bg: 'red.600!', color: 'white!', whiteSpace: 'nowrap', _hover: { bg: 'red.700!' } })}
                    >
                        Logout
                    </Button>
                </Flex>
            </Flex>

            <Flex
                gap={{ base: '1', sm: '2' }}
                mb={{ base: '4', sm: '6' }}
                borderBottomWidth="1px"
                borderColor="slate.700"
                overflowX="auto"
            >
                <button onClick={() => setActiveTab('home')} class={tabButtonClass(activeTab() === 'home')}>
                    <HomeIcon size={18} />
                    <span class={css({ display: { base: 'none', sm: 'inline' } })}>ホーム</span>
                </button>
                <button onClick={() => setActiveTab('genres')} class={tabButtonClass(activeTab() === 'genres')}>
                    <Tags size={18} />
                    <span class={css({ display: { base: 'none', sm: 'inline' } })}>ジャンル</span>
                </button>
                <button onClick={() => setActiveTab('locations')} class={tabButtonClass(activeTab() === 'locations')}>
                    <MapPin size={18} />
                    <span class={css({ display: { base: 'none', sm: 'inline' } })}>場所</span>
                </button>
            </Flex>

            {/* TODO: Re-enable Security section in separate authentication branch
            <Show when={activeTab() === 'home'}>
                <Box mb={{ base: '6', sm: '8' }} p={{ base: '3', sm: '4' }} bg="slate.800" rounded="lg">
                    <h3 class={css({ fontSize: 'lg', fontWeight: 'medium', color: 'white', mb: '4' })}>
                        Security
                    </h3>

                    <Stack gap="4" mb="4">
                        <Box>
                            <h4 class={css({ fontSize: 'sm', fontWeight: 'medium', color: 'slate.400', mb: '2' })}>
                                Registered Passkeys
                            </h4>
                            <Stack gap="2">
                                <For each={passkeys()}>
                                    {(pk) => (
                                        <Flex
                                            align="center"
                                            justify="space-between"
                                            p="3"
                                            bg="slate.900"
                                            rounded="md"
                                            borderWidth="1px"
                                            borderColor="slate.700"
                                        >
                                            <Box>
                                                <div class={css({ fontWeight: 'medium', color: 'white' })}>
                                                    {pk.name}
                                                </div>
                                                <div class={css({ fontSize: 'xs', color: 'slate.500' })}>
                                                    Last used: {new Date(pk.last_used_at).toLocaleDateString()}
                                                </div>
                                            </Box>
                                            <Flex align="center" gap="4">
                                                <div class={css({ fontSize: 'xs', color: 'slate.500' })}>
                                                    Added: {new Date(pk.created_at).toLocaleDateString()}
                                                </div>
                                                <button
                                                    onClick={() => deletePasskey(pk.id)}
                                                    class={css({
                                                        p: '2',
                                                        color: 'slate.400',
                                                        _hover: { color: 'red.400', bg: 'slate.800' },
                                                        rounded: 'md',
                                                        transition: 'colors'
                                                    })}
                                                    title="Delete passkey"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </Flex>
                                        </Flex>
                                    )}
                                </For>
                                <Show when={passkeys().length === 0}>
                                    <div class={css({ color: 'slate.500', fontSize: 'sm', fontStyle: 'italic' })}>
                                        No passkeys registered
                                    </div>
                                </Show>
                            </Stack>
                        </Box>
                    </Stack>

                    <Flex
                        mt="4"
                        pt="4"
                        borderTopWidth="1px"
                        borderColor="slate.700"
                        justify="space-between"
                        align="center"
                    >
                        <Button
                            onClick={registerPasskey}
                            variant="outline"
                            class={css({ borderStyle: 'dashed', w: { base: 'full', sm: 'auto' } })}
                        >
                            Register New Passkey
                        </Button>

                        <button
                            onClick={deleteAccount}
                            class={css({
                                fontSize: 'xs',
                                color: 'red.500',
                                _hover: { color: 'red.400' },
                                textDecoration: 'underline'
                            })}
                        >
                            Delete Account
                        </button>
                    </Flex>

                    <Show when={message()}>
                        <div class={css({
                            mt: '2',
                            p: '2',
                            rounded: 'md',
                            fontSize: 'sm',
                            color: message().includes("fail") || message().includes("Error") ? 'red.400' : 'emerald.400'
                        })}>
                            {message()}
                        </div>
                    </Show>
                </Box>
            </Show>
            */}


            <Show when={activeTab() === 'home'}>
                <Home />
            </Show>
            <Show when={activeTab() === 'genres'}>
                <GenreList />
            </Show>
            <Show when={activeTab() === 'locations'}>
                <LocationList />
            </Show>
        </Box>
    );
};

export default MainPage;
