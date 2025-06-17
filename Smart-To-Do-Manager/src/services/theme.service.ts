import { Injectable, signal, effect } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class ThemeService {
    private isDarkModeSignal = signal<boolean>(false);

    private isDarkMode = new BehaviorSubject<boolean>(false);

    public isDarkMode$ = this.isDarkMode.asObservable();

    private readonly THEME_KEY = 'smart-todo-theme-v2';

    constructor() {
        this.initializeTheme();

        effect(() => {
            const isDark = this.isDarkModeSignal();

            this.isDarkMode.next(isDark);

            this.applyTheme(isDark);
        });
    }

    private initializeTheme(): void {
        const savedTheme = localStorage.getItem(this.THEME_KEY);

        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

        const shouldUseDark = savedTheme ? savedTheme === 'dark' : prefersDark;

        this.isDarkModeSignal.set(shouldUseDark);

        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
            if (!localStorage.getItem(this.THEME_KEY)) {
                this.isDarkModeSignal.set(e.matches);
            }
        });
    }

    toggleTheme(): void {
        const newTheme = !this.isDarkModeSignal();

        this.isDarkModeSignal.set(newTheme);

        localStorage.setItem(this.THEME_KEY, newTheme ? 'dark' : 'light');
    }

    setTheme(isDark: boolean): void {
        this.isDarkModeSignal.set(isDark);

        localStorage.setItem(this.THEME_KEY, isDark ? 'dark' : 'light');
    }

    private applyTheme(isDark: boolean): void {
        const root = document.documentElement;

        if (isDark) {
            root.classList.add('dark');
        } else {
            root.classList.remove('dark');
        }

        const metaThemeColor = document.querySelector('meta[name="theme-color"]');

        if (metaThemeColor) {
            metaThemeColor.setAttribute('content', isDark ? '#1e293b' : '#ffffff');
        }
    }

    get isDarkModeValue(): boolean {
        return this.isDarkModeSignal();
    }

    getThemePreference(): 'light' | 'dark' | 'system' {
        const saved = localStorage.getItem(this.THEME_KEY);

        return saved as 'light' | 'dark' || 'system';
    }

    resetToSystemTheme(): void {
        localStorage.removeItem(this.THEME_KEY);

        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

        this.isDarkModeSignal.set(prefersDark);
    }

    getThemeColors() {
        const isDark = this.isDarkModeSignal();

        return {
            primary: '#3b82f6',
            background: isDark ? '#0f172a' : '#f8fafc',
            surface: isDark ? '#1e293b' : '#ffffff',
            text: isDark ? '#f1f5f9' : '#1e293b',
            textMuted: isDark ? '#94a3b8' : '#64748b',
            border: isDark ? '#475569' : '#e2e8f0'
        };
    }
}