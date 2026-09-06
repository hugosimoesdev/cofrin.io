import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from '@/app/App';
import { QueryProvider } from '@/app/providers/query-client-provider';
import { I18nProvider, ThemeProvider } from '@/shared/lib';
import '@/app/styles/global.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <I18nProvider>
      <ThemeProvider>
        <QueryProvider>
          <App />
        </QueryProvider>
      </ThemeProvider>
    </I18nProvider>
  </StrictMode>,
);
