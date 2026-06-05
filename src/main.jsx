import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import { AuthProvider } from './contexts/AuthContext'
import { ThemeProvider } from './contexts/ThemeContext'
import { ToastProvider } from './contexts/ToastContext'
import { NotificationProvider } from './contexts/NotificationContext'
import { NsfwProvider } from './contexts/NsfwContext'
import './styles/global.css'
import './styles/mobile.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <ToastProvider>
            <NotificationProvider>
              <NsfwProvider>
                <App />
              </NsfwProvider>
            </NotificationProvider>
          </ToastProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  </React.StrictMode>
)

// Signal intro animation that React is mounted
var __ph = document.getElementById('intro-placeholder')
if (__ph) __ph.remove()
window.__introMounted = true
if (window.__introReady) window.__introReady()
