import { Link, Outlet, createRootRoute, createRoute, createRouter } from '@tanstack/react-router';
import { Monitor, Moon, Sun } from 'lucide-react';

import { ConfigurationPage } from '@/pages/configuration';
import { HomePage } from '@/pages/home';
import { appRoutes } from '@/shared/config';
import { cn, useI18n, useTheme, type Locale, type ThemePreference } from '@/shared/lib';
import { Button } from '@/shared/ui/button';

const themeOptions: Array<{
  value: ThemePreference;
  icon: typeof Sun;
  labelKey: 'theme.light' | 'theme.dark' | 'theme.system';
}> = [
  { value: 'light', icon: Sun, labelKey: 'theme.light' },
  { value: 'dark', icon: Moon, labelKey: 'theme.dark' },
  { value: 'system', icon: Monitor, labelKey: 'theme.system' },
];

const localeOptions: Array<{
  value: Locale;
  shortLabel: string;
  labelKey: 'language.enUS' | 'language.ptBR';
}> = [
  { value: 'en-US', shortLabel: 'EN', labelKey: 'language.enUS' },
  { value: 'pt-BR', shortLabel: 'PT', labelKey: 'language.ptBR' },
];

function AppLayout() {
  const { locale, setLocale, t } = useI18n();
  const { themePreference, setThemePreference } = useTheme();
  const navLinkClassName =
    'rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground';
  const activeNavLinkClassName =
    'rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground';

  return (
    <div className="min-h-svh bg-background text-foreground">
      <header className="border-b border-border bg-card/85 backdrop-blur">
        <nav className="mx-auto flex w-full max-w-[1180px] flex-wrap items-center justify-between gap-3 px-6 py-4 max-[720px]:px-4">
          <Link to={appRoutes.home} className="text-sm font-bold uppercase text-primary">
            {t('app.brand')}
          </Link>
          <div className="flex flex-wrap items-center justify-end gap-3">
            <div className="flex items-center gap-2">
              <Link
                to={appRoutes.home}
                className={navLinkClassName}
                activeProps={{
                  className: activeNavLinkClassName,
                }}
                activeOptions={{ exact: true }}
              >
                {t('nav.transactions')}
              </Link>
              <Link
                to={appRoutes.configuration}
                className={navLinkClassName}
                activeProps={{
                  className: activeNavLinkClassName,
                }}
              >
                {t('nav.configuration')}
              </Link>
            </div>
            <div className="flex items-center gap-1 rounded-md border border-border bg-background p-1">
              {localeOptions.map((option) => (
                <Button
                  key={option.value}
                  type="button"
                  size="sm"
                  variant={locale === option.value ? 'default' : 'ghost'}
                  onClick={() => setLocale(option.value)}
                  aria-label={`${t('language.label')}: ${t(option.labelKey)}`}
                  className="h-7 px-2 text-xs"
                >
                  {option.shortLabel}
                </Button>
              ))}
            </div>
            <div className="flex items-center gap-1 rounded-md border border-border bg-background p-1">
              {themeOptions.map((option) => {
                const Icon = option.icon;

                return (
                  <Button
                    key={option.value}
                    type="button"
                    size="icon"
                    variant={themePreference === option.value ? 'default' : 'ghost'}
                    onClick={() => setThemePreference(option.value)}
                    aria-label={`${t('theme.label')}: ${t(option.labelKey)}`}
                    title={t(option.labelKey)}
                    className={cn(
                      'size-7',
                      themePreference !== option.value && 'text-muted-foreground',
                    )}
                  >
                    <Icon />
                  </Button>
                );
              })}
            </div>
          </div>
        </nav>
      </header>
      <Outlet />
    </div>
  );
}

const rootRoute = createRootRoute({
  component: AppLayout,
});

const homeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: appRoutes.home,
  component: HomePage,
});

const configurationRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: appRoutes.configuration,
  component: ConfigurationPage,
});

const routeTree = rootRoute.addChildren([homeRoute, configurationRoute]);

export const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}
