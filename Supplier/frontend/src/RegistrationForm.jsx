import React, { useState } from 'react';
import './supplierLanding.css';

const RegistrationForm = ({ onClose }) => {
  const [formData, setFormData] = useState({
    companyName: '',
    businessType: '',
    registrationNumber: '',
    taxId: '',
    contactPerson: '',
    email: '',
    phone: '',
    address: '',
    productsServices: ''
  });

  const [currentStep, setCurrentStep] = useState(1);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Supplier Registration:', formData);
    alert('Registration submitted successfully! We will review your application.');
    onClose();
  };

  const nextStep = () => setCurrentStep(prev => prev + 1);
  const prevStep = () => setCurrentStep(prev => prev - 1);

  return (
    <div className="registration-overlay">
      <div className="registration-form">
        <div className="form-header">
          <h2>Supplier Registration</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <div className="form-progress">
          <div className={`progress-step ${currentStep >= 1 ? 'active' : ''}`}>1</div>
          <div className={`progress-step ${currentStep >= 2 ? 'active' : ''}`}>2</div>
          <div className={`progress-step ${currentStep >= 3 ? 'active' : ''}`}>3</div>
        </div>

        <form onSubmit={handleSubmit}>
          {currentStep === 1 && (
            <div className="form-step">
              <h3>Company Information</h3>
              <div className="form-grid">
                <div className="form-group">
                  <label>Company Name *</label>
                  <input
                    type="text"
                    name="companyName"
                    value={formData.companyName}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Business Type *</label>
                  <select name="businessType" value={formData.businessType} onChange={handleChange} required>
                    <option value="">Select Business Type</option>
                    <option value="Manufacturer">Manufacturer</option>
                    <option value="Distributor">Distributor</option>
                    <option value="Service Provider">Service Provider</option>
                    <option value="Consultant">Consultant</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Registration Number *</label>
                  <input
                    type="text"
                    name="registrationNumber"
                    value={formData.registrationNumber}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Tax ID *</label>
                  <input
                    type="text"
                    name="taxId"
                    value={formData.taxId}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
              <div className="form-actions">
                <button type="button" onClick={nextStep} className="next-btn">Next</button>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="form-step">
              <h3>Contact Information</h3>
              <div className="form-grid">
                <div className="form-group">
                  <label>Contact Person *</label>
                  <input
                    type="text"
                    name="contactPerson"
                    value={formData.contactPerson}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Email *</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Phone *</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Address *</label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
              <div className="form-actions">
                <button type="button" onClick={prevStep} className="prev-btn">Back</button>
                <button type="button" onClick={nextStep} className="next-btn">Next</button>
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="form-step">
              <h3>Business Details</h3>
              <div className="form-grid">
                <div className="form-group full-width">
                  <label>Products/Services Offered *</label>
                  <textarea
                    name="productsServices"
                    value={formData.productsServices}
                    onChange={handleChange}
                    rows="4"
                    required
                  />
                </div>
              </div>
              <div className="form-actions">
                <button type="button" onClick={prevStep} className="prev-btn">Back</button>
                <button type="submit" className="submit-btn">Submit Registration</button>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default RegistrationForm;