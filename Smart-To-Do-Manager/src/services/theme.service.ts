import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class ThemeService {
    private isDarkMode = new BehaviorSubject<boolean>(false);
    public isDarkMode$ = this.isDarkMode.asObservable();

    private readonly THEME_KEY = 'smart-todo-theme';

    constructor() {
        this.initializeTheme();
    }

    private initializeTheme(): void {
        const savedTheme = localStorage.getItem(this.THEME_KEY);
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

        const shouldUseDark = savedTheme ? savedTheme === 'dark' : prefersDark;
        this.setTheme(shouldUseDark);
    }

    toggleTheme(): void {
        this.setTheme(!this.isDarkMode.value);
    }

    private setTheme(isDark: boolean): void {
        this.isDarkMode.next(isDark);
        localStorage.setItem(this.THEME_KEY, isDark ? 'dark' : 'light');

        if (isDark) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }
}