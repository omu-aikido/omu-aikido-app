import { clerkPlugin } from '@clerk/vue'
import { createApp } from 'vue'

import App from './App.vue'
import './assets/main.css'
import { initAuthState } from './composable/useAuth'
import router from './router'

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY
if (!PUBLISHABLE_KEY) {
  throw new Error('VITE_CLERK_PUBLISHABLE_KEY is required')
}

const app = createApp(App)

app.use(clerkPlugin, { publishableKey: PUBLISHABLE_KEY })

app.use(router)

;(async () => {
  try {
    await initAuthState()
    console.log(new Date().toLocaleTimeString(), 'AuthState Initialized')
    await router.isReady()
    console.log(new Date().toLocaleTimeString(), 'router ready')
    app.mount('#app')
  } catch {
    console.error(new Date().toLocaleTimeString(), 'Failed to initialize app')
  }
})()
