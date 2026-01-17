import { clerkPlugin } from '@clerk/vue';
import { VueQueryPlugin, QueryClient } from '@tanstack/vue-query';
import { createApp } from 'vue';

import App from './App.vue';
import './assets/main.css';
import { initAuthState } from './composable/useAuth';
import router from './router';

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;
if (!PUBLISHABLE_KEY) {
  throw new Error('VITE_CLERK_PUBLISHABLE_KEY is required');
}

const app = createApp(App);

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // 30 seconds - shorter than server KV cache (1 hour) to ensure fresher data on navigation
      // This reduces the window where stale profile data (e.g., default 5級 values) can persist
      staleTime: 1000 * 30,
      gcTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
      refetchOnWindowFocus: true, // Enable refetch on window focus to get fresh data
      refetchOnMount: true, // Refetch when component mounts if data is stale
      refetchOnReconnect: true, // Refetch when network reconnects
    },
  },
});

app.use(clerkPlugin, { publishableKey: PUBLISHABLE_KEY });
app.use(VueQueryPlugin, { queryClient });

app.use(router);
(async () => {
  try {
    initAuthState();
    app.mount('#app');
  } catch {
    console.error(new Date().toLocaleTimeString(), 'Failed to initialize app');
  }
})();
