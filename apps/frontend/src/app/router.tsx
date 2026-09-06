import { Link, Outlet, createRootRoute, createRoute, createRouter } from '@tanstack/react-router';

import { ConfigurationPage } from '@/pages/configuration';
import { HomePage } from '@/pages/home';
import { appRoutes } from '@/shared/config';

function AppLayout() {
  return (
    <div className="min-h-svh bg-[#f4f6f0] text-[#172026]">
      <header className="border-b border-[#172026]/10 bg-white/85 backdrop-blur">
        <nav className="mx-auto flex w-full max-w-[1180px] flex-wrap items-center justify-between gap-3 px-6 py-4 max-[720px]:px-4">
          <Link to={appRoutes.home} className="text-sm font-bold uppercase text-[#346657]">
            cofrin.io
          </Link>
          <div className="flex items-center gap-2">
            <Link
              to={appRoutes.home}
              className="rounded-md px-3 py-2 text-sm font-medium text-[#43514d] transition-colors hover:bg-[#eef3ec] hover:text-[#172026]"
              activeProps={{
                className: 'rounded-md bg-[#172026] px-3 py-2 text-sm font-medium text-white',
              }}
              activeOptions={{ exact: true }}
            >
              Transactions
            </Link>
            <Link
              to={appRoutes.configuration}
              className="rounded-md px-3 py-2 text-sm font-medium text-[#43514d] transition-colors hover:bg-[#eef3ec] hover:text-[#172026]"
              activeProps={{
                className: 'rounded-md bg-[#172026] px-3 py-2 text-sm font-medium text-white',
              }}
            >
              Configuration
            </Link>
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
