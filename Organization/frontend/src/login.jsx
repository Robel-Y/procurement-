import React from "react";
import "./login.css";
import { useState } from "react";
import Sidebar from "./side-bar";

export default function Accumulator() {
  const [isLogedIn, setIsLogedIn] = useState(false);
   const [cancel, setCancel] = useState(false);

  return (
    <>
      <NavigationBar isLogedIn={isLogedIn} setLogin={setIsLogedIn} setCancel = {setCancel} cancel={cancel}/>
      <LoginForm isLogedIn={isLogedIn} cancel={cancel} setCancel={setCancel}/>
      <BodyDisplay isLogedIn={isLogedIn} />
      <Sidebar />
    </>
  );
}

export function NavigationBar({ setLogin, setCancel }) {

  function resetStates(){
    setLogin(true);
    setCancel(false);
  }

  return (
    <>
      <div className="body">
        <section className="nav-bar">
          <h1>
            WELCOME TO THE PROCUREMENT{" "}
            <button className="login" onClick={()=>resetStates()}>
              login
            </button>
          </h1>
        </section>
      </div>
    </>
  );
}

export function BodyDisplay() {
  return (
    <>
      <div className="body">
        <p>Organization name and slogan </p>
        <img
          src="https://images.unsplash.com/photo-1614624532983-4ce03382d63d?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Nnx8ZGVza3RvcCUyMGNvbXB1dGVyfGVufDB8fDB8fHww&fm=jpg&q=60&w=3000"
          alt="The companies logo will display here"
          className="company-logo"
        />
        <h2>our objective</h2>
        <p>
          The main objective of our computer organizations is to design,
          develop, and implement efficient and innovative technological
          solutions that enhance productivity, streamline operations, and
          support data-driven decision-making. These organizations strive to
          promote innovation in software, hardware, and networking systems while
          ensuring the security and integrity of data through effective
          information management and cybersecurity measures. They also aim to
          provide reliable technical support, continuous system improvement, and
          user training to enhance technological competence. Ultimately,
          computer organizations seek to contribute to sustainable technological
          advancement and digital transformation that benefits individuals,
          businesses, and society as a whole.
        </p>
      </div>
    </>
  );
}

export const LoginForm = ({ isLogedIn,cancel,setCancel }) => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false,
  });
 
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle login logic here
    console.log("Login attempt:", formData);
    // Add your authentication logic
  };

  return (
      isLogedIn && !cancel && (
              (
       <div className="login-wrapper">
           <Sidebar />

      <div className="login-container">
        <div className="login-card">
          <div className="login-header">
            <h1>Welcome Back</h1>
            <p>Please sign in to your account</p>
          </div>

          <form className="login-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter your password"
                required
              />
            </div>

            <div className="form-options">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="rememberMe"
                  checked={formData.rememberMe}
                  onChange={handleChange}
                />
                <span className="checkmark"></span>
                Remember me
              </label>
              <a href="#forgot" className="forgot-link">
                Forgot password?
              </a>
            </div>

            <button type="submit" className="login-button">
              Sign In
            </button>
          </form>

          <div className="login-footer">
            <p>
              Don't have an account?{" "}
              <a href="#signup" className="signup-link">
                Sign up
              </a>
            </p>
          </div>
          <section>  
            <button onClick={() => setCancel(true)}>Back</button>
          </section>
        </div>
        </div>
      </div>
    )
  )
  );
};

export function Footer() {
  return (
    <>
      <div className="footer">
        <p>
          <a href="privacy.html"> privacy poliy </a>
        </p>
        <p>
          <a href="info.html"> more info </a>
        </p>
        <p>
          <a href="contact.html"> contact us </a>
        </p>
      </div>
    </>
  );
}


