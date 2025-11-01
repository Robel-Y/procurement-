import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { NavigationBar } from './login'
import { BodyDisplay } from './login'
import { Footer } from './login'
import { RequesterDashboard } from './requester'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <NavigationBar />
    {/* <NavigationBar /> */}
    <BodyDisplay />
<RequesterDashboard />

    <Footer />
  </StrictMode>,
)
