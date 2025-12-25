import type { Component } from 'solid-js';
import { createSignal, Show } from 'solid-js';
import { useAuth } from '../../lib/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Box, Stack, Flex } from 'styled-system/jsx';
import { css } from 'styled-system/css';
import { addToast } from '@/components/ui/toast';

const PasskeyLogin: Component = () => {
    const [email, setEmail] = createSignal('');
    const [loading, setLoading] = createSignal(false);
    const { login } = useAuth();

    const handleRegister = async () => {
        const emailValue = email();
        if (!emailValue) {
            addToast('error', 'Please enter your email');
            return;
        }

        setLoading(true);
        try {
            // Step 1: Start registration
            const startRes = await fetch('/api/auth/passkeys/register/start', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
            });

            if (!startRes.ok) {
                throw new Error('Failed to start passkey registration');
            }

            const { challenge, state } = await startRes.json();

            // Step 2: Create credential
            const credential = await navigator.credentials.create({
                publicKey: challenge.publicKey,
            }) as PublicKeyCredential;

            if (!credential) {
                throw new Error('Failed to create passkey');
            }

            // Step 3: Finish registration
            const finishRes = await fetch('/api/auth/passkeys/register/finish', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    state,
                    register: {
                        id: credential.id,
                        rawId: Array.from(new Uint8Array(credential.rawId)),
                        response: {
                            clientDataJSON: Array.from(new Uint8Array((credential.response as AuthenticatorAttestationResponse).clientDataJSON)),
                            attestationObject: Array.from(new Uint8Array((credential.response as AuthenticatorAttestationResponse).attestationObject)),
                        },
                        type: credential.type,
                    },
                }),
            });

            if (!finishRes.ok) {
                throw new Error('Failed to complete passkey registration');
            }

            addToast('success', 'Passkey registered successfully! Please login.');
        } catch (error) {
            console.error('Registration error:', error);
            addToast('error', error instanceof Error ? error.message : 'Failed to register passkey');
        } finally {
            setLoading(false);
        }
    };

    const handleLogin = async () => {
        const emailValue = email();
        if (!emailValue) {
            addToast('error', 'Please enter your email');
            return;
        }

        setLoading(true);
        try {
            // Step 1: Start authentication
            const startRes = await fetch('/api/auth/passkeys/login/start', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: emailValue }),
            });

            if (!startRes.ok) {
                const errorText = await startRes.text();
                throw new Error(errorText || 'Failed to start passkey login');
            }

            const { challenge, state } = await startRes.json();

            // Step 2: Get credential
            const credential = await navigator.credentials.get({
                publicKey: challenge.publicKey,
            }) as PublicKeyCredential;

            if (!credential) {
                throw new Error('Failed to authenticate with passkey');
            }

            // Step 3: Finish authentication
            const finishRes = await fetch('/api/auth/passkeys/login/finish', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    state,
                    login: {
                        id: credential.id,
                        rawId: Array.from(new Uint8Array(credential.rawId)),
                        response: {
                            clientDataJSON: Array.from(new Uint8Array((credential.response as AuthenticatorAssertionResponse).clientDataJSON)),
                            authenticatorData: Array.from(new Uint8Array((credential.response as AuthenticatorAssertionResponse).authenticatorData)),
                            signature: Array.from(new Uint8Array((credential.response as AuthenticatorAssertionResponse).signature)),
                            userHandle: (credential.response as AuthenticatorAssertionResponse).userHandle
                                ? Array.from(new Uint8Array((credential.response as AuthenticatorAssertionResponse).userHandle!))
                                : null,
                        },
                        type: credential.type,
                    },
                }),
            });

            if (!finishRes.ok) {
                throw new Error('Failed to complete passkey login');
            }

            const loginData = await finishRes.json();
            login(loginData);
            addToast('success', 'Logged in successfully!');
        } catch (error) {
            console.error('Login error:', error);
            addToast('error', error instanceof Error ? error.message : 'Failed to login with passkey');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Flex
            justify="center"
            align="center"
            minH="100vh"
            bg="bg.canvas"
        >
            <Box
                w="full"
                maxW="md"
                p="8"
                bg="bg.default"
                rounded="xl"
                borderWidth="1px"
                borderColor="border.default"
                boxShadow="lg"
            >
                <Stack gap="6">
                    <Box textAlign="center">
                        <h1 class={css({ fontSize: '2xl', fontWeight: 'bold', mb: '2' })}>
                            Home Organization
                        </h1>
                        <p class={css({ color: 'fg.muted', fontSize: 'sm' })}>
                            Sign in with your passkey
                        </p>
                    </Box>

                    <Stack gap="4">
                        <Box>
                            <label class={css({ display: 'block', mb: '2', fontSize: 'sm', fontWeight: 'medium' })}>
                                Email
                            </label>
                            <Input
                                type="email"
                                value={email()}
                                onInput={(e) => setEmail(e.currentTarget.value)}
                                placeholder="your.email@example.com"
                                disabled={loading()}
                            />
                        </Box>

                        <Stack gap="3">
                            <Button
                                onClick={handleLogin}
                                disabled={loading()}
                                w="full"
                            >
                                <Show when={!loading()} fallback="Processing...">
                                    Login with Passkey
                                </Show>
                            </Button>

                            <Box textAlign="center">
                                <span class={css({ color: 'fg.muted', fontSize: 'sm' })}>
                                    Don't have a passkey?
                                </span>
                            </Box>

                            <Button
                                variant="outline"
                                onClick={handleRegister}
                                disabled={loading()}
                                w="full"
                            >
                                <Show when={!loading()} fallback="Processing...">
                                    Register Passkey
                                </Show>
                            </Button>
                        </Stack>
                    </Stack>

                    <Box
                        pt="4"
                        borderTopWidth="1px"
                        borderColor="border.default"
                        textAlign="center"
                    >
                        <p class={css({ fontSize: 'xs', color: 'fg.muted' })}>
                            Passkeys use your device's built-in security (fingerprint, face recognition, or PIN)
                        </p>
                    </Box>
                </Stack>
            </Box>
        </Flex>
    );
};

export default PasskeyLogin;
