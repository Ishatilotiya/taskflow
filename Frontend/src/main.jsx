import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import App from './App.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <App />
    <Toaster position="top-right" toastOptions={{
      style: { background: '#1e1e2e', color: '#cdd6f4', border: '1px solid #313244' }
    }} />
  </BrowserRouter>
)