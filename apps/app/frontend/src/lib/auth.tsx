import { createSignal, createContext, useContext } from "solid-js";
import type { JSX } from "solid-js";

interface User {
    id: number;
    pid: string;
    name: string;
    email: string;
    has_passkey: boolean;
}

interface AuthContextType {
    user: () => User | null;
    token: () => string | null;
    login: (data: { user: User; token: string }) => void;
    logout: () => void;
    fetchWithAuth: (url: string, options?: RequestInit) => Promise<Response>;
}

const AuthContext = createContext<AuthContextType>();

export function AuthProvider(props: { children: JSX.Element }) {
    const [user, setUser] = createSignal<User | null>(null);
    const [token, setToken] = createSignal<string | null>(null);

    // Load from local storage on mount
    const storedToken = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");
    if (storedToken && storedToken !== "undefined") setToken(storedToken);
    if (storedUser && storedUser !== "undefined") {
        try {
            setUser(JSON.parse(storedUser));
        } catch (e) {
            console.error("Failed to parse stored user:", e);
            localStorage.removeItem("user");
        }
    }

    const login = (data: { user: User; token: string }) => {
        setUser(data.user);
        setToken(data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        localStorage.setItem("token", data.token);
    };

    const logout = () => {
        setUser(null);
        setToken(null);
        localStorage.removeItem("user");
        localStorage.removeItem("token");
    };

    const fetchWithAuth = async (url: string, options: RequestInit = {}) => {
        const headers = new Headers(options.headers);
        const t = token();
        if (t) {
            headers.set("Authorization", `Bearer ${t}`);
        }

        const res = await fetch(url, { ...options, headers });
        if (res.status === 401) {
            logout();
        }
        return res;
    };

    return (
        <AuthContext.Provider value={{ user, token, login, logout, fetchWithAuth }}>
            {props.children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}
