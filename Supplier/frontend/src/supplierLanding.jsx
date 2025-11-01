import React, { useState } from 'react';
import './supplierLanding.css';
import RegistrationForm from './RegistrationForm';

const SupplierLanding = () => {
  const [showRegistration, setShowRegistration] = useState(false);

  return (
 <>

  <div className="all-container">

    <div className="supplier-landing">
      {/* Header */}
      <header className="supplier-header">
        <div className="header-content">
          <h1>Supplier Portal</h1>
          <div className="header-actions">
          <button 
              className="register-btn"
              onClick={() => setShowRegistration(true)}
            >
              Register as Supplier
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}

      
      <section className="hero-section">
        <div className="hero-content">
          <h2>Join Our Network of Trusted Suppliers</h2>
          <p>Connect with leading organizations and grow your business through our transparent procurement platform</p>
          <div className="hero-stats">
            <div className="stat">
              <h3>500+</h3>
              <p>Active Suppliers</p>
            </div>
            <div className="stat">
              <h3>$50M+</h3>
              <p>Annual Procurement</p>
            </div>
            <div className="stat">
              <h3>98%</h3>
              <p>Satisfaction Rate</p>
            </div>
          </div>
        </div>
      </section>



      {/* Benefits Section */}


      
      <section className="benefits-section">
        <h2>Why Join Our Supplier Network?</h2>
        <div className="benefits-grid">
          <div className="benefit-card">
            <div className="benefit-icon">📋</div>
            <h3>Access to Tenders</h3>
            <p>Get notified about new procurement opportunities matching your business</p>
          </div>
          <div className="benefit-card">
            <div className="benefit-icon">⚡</div>
            <h3>Quick Response</h3>
            <p>Streamlined bidding process with instant submission and tracking</p>
          </div>
          <div className="benefit-card">
            <div className="benefit-icon">🤝</div>
            <h3>Fair Evaluation</h3>
            <p>Transparent and objective evaluation process for all suppliers</p>
          </div>
          <div className="benefit-card">
            <div className="benefit-icon">💼</div>
            <h3>Business Growth</h3>
            <p>Expand your client base with reputable organizations</p>
          </div>
        </div>
      </section>



      {/* Process Section */}


      
      <section className="process-section">
        <h2>How It Works</h2>
        <div className="process-steps">
          <div className="step">
            <div className="step-number">1</div>
            <h3>Register</h3>
            <p>Complete your supplier profile and submit required documents</p>
          </div>
          <div className="step">
            <div className="step-number">2</div>
            <h3>Get Approved</h3>
            <p>Our team reviews your application within 3-5 business days</p>
          </div>
          <div className="step">
            <div className="step-number">3</div>
            <h3>Receive Tenders</h3>
            <p>Get matched with relevant procurement opportunities</p>
          </div>
          <div className="step">
            <div className="step-number">4</div>
            <h3>Submit Bids</h3>
            <p>Participate in tenders and grow your business</p>
          </div>
        </div>
      </section>



      {/* CTA Section */}


      
      <section className="cta-section">
        <h2>Ready to Get Started?</h2>
        <p>Join hundreds of successful suppliers already on our platform</p>
        <button 
          className="cta-button"
          onClick={() => setShowRegistration(true)}
        >
          Register Now
        </button>
      </section>



      {/* Footer */}



      <footer className="supplier-footer">
        <p>Need help? Contact our supplier support team at suppliers@procurement.com</p>
      </footer>



      {/* Registration Form Popup */}

      
      {showRegistration && (
        <RegistrationForm onClose={() => setShowRegistration(false)} />
      )}
      
    </div>
    </div>
   </>
  );
};

export default SupplierLanding;