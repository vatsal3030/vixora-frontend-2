
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
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})

createRoot(document.getElementById('root')).render(
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </ErrorBoundary>
)
