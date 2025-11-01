import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import SupplierLanding from './supplierLanding.jsx';
import { BrowserRouter } from 'react-router-dom';
import RegistrationForm from './RegistrationForm.jsx';

createRoot(document.getElementById('root')).render(
    <StrictMode>

    <SupplierLanding />
    {/* <RegistrationForm /> */}


createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
    </StrictMode>
  </StrictMode>
)
