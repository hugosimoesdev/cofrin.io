import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

export type ThemePreference = 'light' | 'dark' | 'system';
export type ResolvedTheme = 'light' | 'dark';

const themeStorageKey = 'cofrin.theme';

type ThemeContextValue = {
  themePreference: ThemePreference;
  resolvedTheme: ResolvedTheme;
  setThemePreference: (themePreference: ThemePreference) => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function resolveThemePreference(value?: string | null): ThemePreference {
  return value === 'light' || value === 'dark' || value === 'system' ? value : 'system';
}

export function resolveTheme(
  themePreference: ThemePreference,
  systemPrefersDark: boolean,
): ResolvedTheme {
  return themePreference === 'system'
    ? systemPrefersDark
      ? 'dark'
      : 'light'
    : themePreference;
}

function getSystemPrefersDark() {
  if (typeof window === 'undefined' || !window.matchMedia) {
    return false;
  }

  return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

function readStoredThemePreference(): ThemePreference {
  try {
    if (typeof window === 'undefined') {
      return 'system';
    }

    return resolveThemePreference(window.localStorage.getItem(themeStorageKey));
  } catch {
    return 'system';
  }
}

function writeStoredThemePreference(themePreference: ThemePreference) {
  try {
    if (typeof window === 'undefined') {
      return;
    }

    window.localStorage.setItem(themeStorageKey, themePreference);
  } catch {
    // localStorage can be unavailable in private or restricted contexts.
  }
}

function applyResolvedTheme(resolvedTheme: ResolvedTheme) {
  if (typeof document === 'undefined') {
    return;
  }

  document.documentElement.classList.toggle('dark', resolvedTheme === 'dark');
  document.documentElement.style.colorScheme = resolvedTheme;
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [themePreference, setThemePreferenceState] = useState<ThemePreference>(
    readStoredThemePreference,
  );
  const [systemPrefersDark, setSystemPrefersDark] = useState(getSystemPrefersDark);
  const resolvedTheme = resolveTheme(themePreference, systemPrefersDark);

  useEffect(() => {
    if (!window.matchMedia) {
      return;
    }

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    function syncSystemPreference(event: MediaQueryListEvent) {
      setSystemPrefersDark(event.matches);
    }

    mediaQuery.addEventListener('change', syncSystemPreference);

    return () => mediaQuery.removeEventListener('change', syncSystemPreference);
  }, []);

  useEffect(() => {
    applyResolvedTheme(resolvedTheme);
  }, [resolvedTheme]);

  const value = useMemo<ThemeContextValue>(
    () => ({
      themePreference,
      resolvedTheme,
      setThemePreference: (nextThemePreference) => {
        setThemePreferenceState(nextThemePreference);
        writeStoredThemePreference(nextThemePreference);
      },
    }),
    [resolvedTheme, themePreference],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider.');
  }

  return context;
}
