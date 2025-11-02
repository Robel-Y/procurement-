<<<<<<< HEAD
import React from 'react';
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./login.jsx";
import  {ApproverDashboard}  from './dash-board.jsx';
import Sidebar from './side-bar.jsx';


import { Footer } from './login'
import { LoginForm } from './login'
import Accumulator from './login'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Sidebar />

 {/* <Accumulator />
 <Footer /> */}

 <ApproverDashboard />

  </StrictMode>,
)
=======
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import { AuthProvider } from "./context/AuthContext";
import "./styles.css";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    
      <AuthProvider>
        <App />
      </AuthProvider>
    
  </React.StrictMode>
);
>>>>>>> 76ee64bd831d7689d1d6e32a4a319ed611540745
