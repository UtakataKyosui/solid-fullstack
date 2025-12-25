import { createContext, useContext, createSignal, onMount, type ParentComponent } from 'solid-js';

type Theme = 'light' | 'dark';

interface ThemeContextValue {
    theme: () => Theme;
    toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue>();

export const ThemeProvider: ParentComponent = (props) => {
    // Cookieからテーマを読み込み（デフォルトはlight）
    const getInitialTheme = (): Theme => {
        const cookies = document.cookie.split('; ');
        const themeCookie = cookies.find(cookie => cookie.startsWith('theme='));
        if (themeCookie) {
            const value = themeCookie.split('=')[1] as Theme;
            return value === 'dark' ? 'dark' : 'light';
        }
        return 'light';
    };

    const [theme, setTheme] = createSignal<Theme>(getInitialTheme());

    // テーマをCookieに保存
    const saveThemeToCookie = (newTheme: Theme) => {
        const expires = new Date();
        expires.setFullYear(expires.getFullYear() + 1); // 1年間有効
        document.cookie = `theme=${newTheme}; expires=${expires.toUTCString()}; path=/`;
    };

    // テーマ切り替え
    const toggleTheme = () => {
        const newTheme = theme() === 'light' ? 'dark' : 'light';
        setTheme(newTheme);
        saveThemeToCookie(newTheme);

        // HTMLルートのクラスを更新
        document.documentElement.classList.remove('light', 'dark');
        document.documentElement.classList.add(newTheme);
    };

    // 初期化時にHTMLルートのクラスを設定
    onMount(() => {
        document.documentElement.classList.add(theme());
    });

    const value: ThemeContextValue = {
        theme,
        toggleTheme,
    };

    return (
        <ThemeContext.Provider value={value}>
            {props.children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within ThemeProvider');
    }
    return context;
};
