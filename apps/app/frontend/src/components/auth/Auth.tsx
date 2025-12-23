import { createSignal, Show } from "solid-js";
import { startAuthentication } from "@simplewebauthn/browser";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "../../lib/auth";

export default function Auth() {
    const { login } = useAuth();
    const [email, setEmail] = createSignal("");
    const [password, setPassword] = createSignal("");
    const [name, setName] = createSignal("");
    const [isLogin, setIsLogin] = createSignal(true);
    const [message, setMessage] = createSignal("");

    const toggleMode = () => {
        setIsLogin(!isLogin());
        setMessage("");
    };

    const handleRegister = async (e: Event) => {
        e.preventDefault();
        try {
            const res = await fetch("/api/auth/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: email(), password: password(), name: name() }),
            });
            if (res.ok) {
                setMessage("Registration successful! Please login.");
                setIsLogin(true);
            } else {
                setMessage("Registration failed");
            }
        } catch (err) {
            setMessage("Error registering");
        }
    };

    const handleLogin = async (e: Event) => {
        e.preventDefault();
        try {
            const res = await fetch("/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: email(), password: password() }),
            });
            if (res.ok) {
                const data = await res.json();
                login({ user: data, token: data.token });
                setMessage("Login successful!");
            } else {
                setMessage("Login failed");
            }
        } catch (err) {
            setMessage("Error logging in");
        }
    };



    const loginPasskey = async () => {
        try {
            if (!email()) {
                setMessage("Please enter email for passkey login");
                return;
            }

            const startRes = await fetch("/api/auth/passkeys/login/start", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: email() })
            });

            if (!startRes.ok) {
                const err = await startRes.text();
                throw new Error("Failed to start passkey login: " + err);
            }

            const startData = await startRes.json();

            const opts = startData.challenge.publicKey ? startData.challenge.publicKey : startData.challenge;

            const assertionResponse = await startAuthentication(opts);

            const finishRes = await fetch("/api/auth/passkeys/login/finish", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    login: assertionResponse,
                    state: startData.state
                })
            });

            if (finishRes.ok) {
                const data = await finishRes.json();
                if (data.token) {
                    login({ user: data, token: data.token });
                    setMessage("Passkey Login successful!");
                } else {
                    setMessage("Passkey verified (Token not yet implemented in backend)");
                }
            } else {
                setMessage("Passkey login failed: " + (await finishRes.text()));
            }

        } catch (err) {
            console.error(err);
            setMessage("Error logging in with passkey: " + (err as Error).message);
        }
    };

    return (
        <div class="w-full max-w-md p-8 space-y-6 bg-slate-900/50 backdrop-blur-xl rounded-2xl border border-slate-800 shadow-2xl">
            <h2 class="text-3xl font-bold text-center text-white tracking-tight">
                {isLogin() ? "Welcome Back" : "Create Account"}
            </h2>
            <p class="text-center text-slate-400 text-sm">
                {isLogin() ? "Enter your credentials to access your account" : "Sign up to get started"}
            </p>

            <form onSubmit={(e) => isLogin() ? handleLogin(e) : handleRegister(e)} class="space-y-4">
                <div class="space-y-2">
                    <label class="text-sm font-medium text-slate-200">Email</label>
                    <Input
                        type="email"
                        value={email()}
                        onInput={(e) => setEmail(e.currentTarget.value)}
                        required
                        placeholder="you@example.com"
                    />
                </div>
                <div class="space-y-2">
                    <label class="text-sm font-medium text-slate-200">Password</label>
                    <Input
                        type="password"
                        value={password()}
                        onInput={(e) => setPassword(e.currentTarget.value)}
                        required
                        placeholder="••••••••"
                    />
                </div>
                <Show when={!isLogin()}>
                    <div class="space-y-2">
                        <label class="text-sm font-medium text-slate-200">Name</label>
                        <Input
                            type="text"
                            value={name()}
                            onInput={(e) => setName(e.currentTarget.value)}
                            required
                            placeholder="John Doe"
                        />
                    </div>
                </Show>

                <Button type="submit" class="w-full">
                    {isLogin() ? "Sign In" : "Sign Up"}
                </Button>
            </form>

            <div class="relative">
                <div class="absolute inset-0 flex items-center">
                    <span class="w-full border-t border-slate-700" />
                </div>
                <div class="relative flex justify-center text-xs uppercase">
                    <span class="bg-slate-900 px-2 text-slate-400">Or continue with</span>
                </div>
            </div>

            <Button type="button" variant="outline" class="w-full" onClick={loginPasskey}>
                Sign in with Passkey
            </Button>

            <div class="text-center text-sm">
                <button onClick={toggleMode} class="font-medium text-indigo-400 hover:text-indigo-300 transition-colors">
                    {isLogin() ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
                </button>
            </div>

            <Show when={message()}>
                <div class={`p-3 rounded-md text-sm text-center ${message().includes("success") ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-red-500/10 text-red-400 border border-red-500/20"}`}>
                    {message()}
                </div>
            </Show>
        </div>
    );
}
