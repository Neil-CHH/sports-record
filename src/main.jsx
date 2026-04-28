import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import PassphraseGate from './components/PassphraseGate.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <PassphraseGate>
      <App />
    </PassphraseGate>
  </React.StrictMode>
)
