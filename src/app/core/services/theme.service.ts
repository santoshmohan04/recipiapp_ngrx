import { Injectable, signal, effect } from '@angular/core';

export type Theme = 'light' | 'dark';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private readonly THEME_STORAGE_KEY = 'app-theme';
  private readonly DARK_THEME_CLASS = 'dark-theme';
  
  // Signal to track current theme
  currentTheme = signal<Theme>(this.getStoredTheme());

  constructor() {
    // Effect to apply theme changes to document body
    effect(() => {
      const theme = this.currentTheme();
      this.applyTheme(theme);
    });
  }

  /**
   * Toggle between light and dark themes
   */
  toggleTheme(): void {
    const newTheme: Theme = this.currentTheme() === 'light' ? 'dark' : 'light';
    this.setTheme(newTheme);
  }

  /**
   * Set a specific theme
   */
  setTheme(theme: Theme): void {
    this.currentTheme.set(theme);
    this.saveTheme(theme);
  }

  /**
   * Check if current theme is dark
   */
  isDarkMode(): boolean {
    return this.currentTheme() === 'dark';
  }

  /**
   * Apply theme to document body
   */
  private applyTheme(theme: Theme): void {
    const body = document.body;
    
    if (theme === 'dark') {
      body.classList.add(this.DARK_THEME_CLASS);
    } else {
      body.classList.remove(this.DARK_THEME_CLASS);
    }
  }

  /**
   * Get theme from localStorage or default to light
   */
  private getStoredTheme(): Theme {
    try {
      const stored = localStorage.getItem(this.THEME_STORAGE_KEY);
      return (stored === 'dark' || stored === 'light') ? stored : 'light';
    } catch (error) {
      console.warn('Failed to read theme from localStorage:', error);
      return 'light';
    }
  }

  /**
   * Save theme preference to localStorage
   */
  private saveTheme(theme: Theme): void {
    try {
      localStorage.setItem(this.THEME_STORAGE_KEY, theme);
    } catch (error) {
      console.warn('Failed to save theme to localStorage:', error);
    }
  }
}
