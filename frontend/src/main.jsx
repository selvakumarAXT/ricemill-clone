import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import { store } from './store'
import './index.css'
import App from './App.jsx'

// Initialize theme before mount: use saved preference or system
try {
  const root = document.documentElement;
  const saved = localStorage.getItem('theme');
  const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  const theme = saved ? saved : (prefersDark ? 'dark' : 'light');
  root.classList.toggle('dark', theme === 'dark');
  if (!saved) localStorage.setItem('theme', theme);
} catch (e) {
  // no-op
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </StrictMode>,
)
