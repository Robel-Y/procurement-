import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./login.jsx";
import  {ApproverDashboard}  from './dash-board.jsx';


import { Footer } from './login'
import { LoginForm } from './login'
import Accumulator from './login'

createRoot(document.getElementById('root')).render(
  <StrictMode>
{/* <Accumulator />
 <Footer /> */}

 <ApproverDashboard />

  </StrictMode>,
)
