import type { Component } from 'solid-js';
import { Sun, Moon } from 'lucide-solid';
import { useTheme } from '@/lib/theme';
import { Button } from '@/components/ui/button';

export const ThemeToggle: Component = () => {
    const { theme, toggleTheme } = useTheme();

    return (
        <Button
            variant="outline"
            size="sm"
            onClick={toggleTheme}
            aria-label="Toggle theme"
        >
            {theme() === 'light' ? <Moon size={20} /> : <Sun size={20} />}
        </Button>
    );
};
