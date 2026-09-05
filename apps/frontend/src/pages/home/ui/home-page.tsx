import { BackendStatus } from '@/widgets/backend-status';
import { ServiceStatusOverview } from '@/widgets/service-status-overview';

export function HomePage() {
  return (
    <main className="app-shell flex min-h-svh items-center p-8 max-[560px]:items-start max-[560px]:px-5 max-[560px]:py-10">
      <section className="w-full max-w-[840px]" aria-labelledby="app-title">
        <p className="mb-3 text-xs font-bold uppercase text-[#346657]">
          Quarkus + Vite monorepo
        </p>
        <h1
          id="app-title"
          className="mb-7 text-[clamp(3rem,9vw,7.5rem)] leading-[0.95] text-[#172026]"
        >
          cofrin.io
        </h1>
        <BackendStatus />
        <ServiceStatusOverview />
      </section>
    </main>
  );
}
