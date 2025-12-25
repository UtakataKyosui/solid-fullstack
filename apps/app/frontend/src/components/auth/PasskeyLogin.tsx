import type { Component } from 'solid-js';
import { createSignal, Show } from 'solid-js';
import { useNavigate } from '@solidjs/router';
import { useAuth } from '../../lib/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Box, Stack, Flex } from 'styled-system/jsx';
import { css } from 'styled-system/css';
import { addToast } from '@/components/ui/toast';
import type { RegisterParams, LoginParams, RegisterStartResponse, LoginStartResponse } from '@/types';
import { convertCredentialCreationOptions, convertCredentialRequestOptions, arrayBufferToBase64Url } from '@/lib/webauthn';


const PasskeyLogin: Component = () => {
    const navigate = useNavigate();
    const [email, setEmail] = createSignal('');
    const [loading, setLoading] = createSignal(false);
    const { login } = useAuth();

    const handleRegister = async () => {
        const emailValue = email();
        if (!emailValue) {
            addToast({ title: 'Error', description: 'Please enter your email', type: 'error' });
            return;
        }

        setLoading(true);
        try {
            // Step 1: Register new user with email and password
            const registerParams: RegisterParams = {
                email: emailValue,
                password: 'passkey-user', // Temporary password for passkey users
                name: emailValue.split('@')[0]
            };

            const registerRes = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(registerParams),
            });

            if (!registerRes.ok) {
                const errorText = await registerRes.text();
                throw new Error(errorText || 'Failed to register user');
            }

            // Step 2: Login to get token
            const loginParams: LoginParams = {
                email: emailValue,
                password: 'passkey-user'
            };

            const loginRes = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(loginParams),
            });

            if (!loginRes.ok) {
                throw new Error('Failed to login after registration');
            }

            const loginData = await loginRes.json();
            login(loginData); // Auto-login

            addToast({ title: 'Success', description: 'Account created! Registering your passkey...', type: 'success' });

            // Step 3: Start Passkey registration (now authenticated)
            const startRes = await fetch('/api/auth/passkeys/register/start', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${loginData.token}`,
                },
            });

            if (!startRes.ok) {
                throw new Error('Failed to start passkey registration');
            }

            const responseData: RegisterStartResponse = await startRes.json();

            // Debug: Log the full response structure
            console.log('=== Register Start Response ===');
            console.log('Full response:', JSON.stringify(responseData, null, 2));
            console.log('Challenge:', responseData.challenge);
            console.log('Challenge keys:', Object.keys(responseData.challenge));
            if (responseData.challenge && typeof responseData.challenge === 'object') {
                console.log('Challenge.public_key exists?', 'public_key' in responseData.challenge);
                console.log('Challenge properties:', Object.keys(responseData.challenge));
            }
            console.log('===============================');

            // Step 4: Create credential
            // Convert Base64 strings to ArrayBuffers for WebAuthn API
            const publicKeyOptions = convertCredentialCreationOptions(responseData.challenge.publicKey);
            console.log('Converted publicKey options:', publicKeyOptions);

            const credential = await navigator.credentials.create({
                publicKey: publicKeyOptions
            }) as PublicKeyCredential;

            if (!credential) {
                throw new Error('Failed to create passkey');
            }

            // Step 5: Finish registration
            const finishRes = await fetch('/api/auth/passkeys/register/finish', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${loginData.token}`,
                },
                body: JSON.stringify({
                    state: responseData.state,
                    register: {
                        id: credential.id,
                        rawId: arrayBufferToBase64Url(credential.rawId),
                        response: {
                            clientDataJSON: arrayBufferToBase64Url((credential.response as AuthenticatorAttestationResponse).clientDataJSON),
                            attestationObject: arrayBufferToBase64Url((credential.response as AuthenticatorAttestationResponse).attestationObject),
                        },
                        type: credential.type,
                    },
                }),
            });

            if (!finishRes.ok) {
                throw new Error('Failed to complete passkey registration');
            }

            addToast({ title: 'Success', description: 'Passkey registered successfully!', type: 'success' });

            // User is already logged in (we used their token to register the passkey)
            // The auth context will automatically show the main page
        } catch (error) {
            console.error('Registration error:', error);
            addToast({ title: 'Error', description: error instanceof Error ? error.message : 'Failed to register', type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const handleLogin = async () => {
        const emailValue = email();
        if (!emailValue) {
            addToast({ title: 'Error', description: 'Please enter your email', type: 'error' });
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

            const responseData: LoginStartResponse = await startRes.json();
            console.log('Login challenge response:', responseData);

            // Step 2: Get credential
            // Convert Base64 strings to ArrayBuffers for WebAuthn API
            const publicKeyOptions = convertCredentialRequestOptions(responseData.challenge.publicKey);

            const credential = await navigator.credentials.get({
                publicKey: publicKeyOptions
            }) as PublicKeyCredential;

            if (!credential) {
                throw new Error('Failed to authenticate with passkey');
            }

            // Step 3: Finish authentication
            const finishRes = await fetch('/api/auth/passkeys/login/finish', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    state: responseData.state,
                    login: {
                        id: credential.id,
                        rawId: arrayBufferToBase64Url(credential.rawId),
                        response: {
                            clientDataJSON: arrayBufferToBase64Url((credential.response as AuthenticatorAssertionResponse).clientDataJSON),
                            authenticatorData: arrayBufferToBase64Url((credential.response as AuthenticatorAssertionResponse).authenticatorData),
                            signature: arrayBufferToBase64Url((credential.response as AuthenticatorAssertionResponse).signature),
                            userHandle: (credential.response as AuthenticatorAssertionResponse).userHandle
                                ? arrayBufferToBase64Url((credential.response as AuthenticatorAssertionResponse).userHandle!)
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
            console.log('Login response data:', loginData);

            // Check the structure of loginData
            if (loginData.user && loginData.token) {
                login(loginData);
                console.log('Login called with:', loginData);
            } else if (loginData.token) {
                // If the response structure is different, adapt it
                login({ user: loginData, token: loginData.token });
                console.log('Login called with adapted data');
            } else {
                console.error('Unexpected login data structure:', loginData);
            }

            addToast({ title: 'Success', description: 'Logged in successfully!', type: 'success' });

            // Navigate to home page after successful login
            navigate('/');
        } catch (error) {
            console.error('Login error:', error);
            addToast({ title: 'Error', description: error instanceof Error ? error.message : 'Failed to login with passkey', type: 'error' });
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
