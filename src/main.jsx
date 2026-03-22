
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import ErrorBoundary from './components/common/ErrorBoundary'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

// Silence unhandled promise rejections in production to prevent leaking sensitive API/auth info
if (!import.meta.env.DEV) {
  window.addEventListener('unhandledrejection', (event) => {
    // Prevent default logging
    event.preventDefault()
  })
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30 * 1000,          // 30 seconds — data stays fresh
      gcTime: 5 * 60 * 1000,         // 5 minutes — cache kept in memory
      retry: 1,                       // retry once on failure
      refetchOnWindowFocus: false,    // don't refetch when tab regains focus
      refetchOnReconnect: true,       // do refetch when internet reconnects
    },
    mutations: {
      retry: 0,                       // don't retry mutations
    }
  },
})

import { HelmetProvider } from 'react-helmet-async'

createRoot(document.getElementById('root')).render(
  <HelmetProvider>
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    </ErrorBoundary>
  </HelmetProvider>
)
