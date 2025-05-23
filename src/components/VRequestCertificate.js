
import React, { useState, useEffect } from 'react';

import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import defaultAvatar from "../assets/avatar.png";
import '../style/Certificate.css';

const REQUEST_API_URL = 'http://localhost:5000/requests';
const AUTH_API_URL = 'http://localhost:5000/api';

function RequestCertificate() {
  const [certificateType, setCertificateType] = useState('clearance');
  const [purpose, setPurpose] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fullName, setFullName] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const checkSession = async () => {
    try {
        const storedUser = localStorage.getItem('user');
        if (!storedUser) {
        navigate('/');
        return;
        }

        const parsedUser = JSON.parse(storedUser);
        const response = await axios.get(`${AUTH_API_URL}/me`, {
        params: { username: parsedUser.username }
        });

        if (response.data) {
        setUser(response.data);
        
        } else {
        localStorage.removeItem('user');
        navigate('/');
        }
    } catch (error) {
        console.error('Session check failed:', error);
        localStorage.removeItem('user');
        navigate('/');
    }
    };

    checkSession();
}, [navigate]);

const handleLogout = async () => {
    try {
    if (user) {
        await axios.post(`${AUTH_API_URL}/logout`, { username: user.username });
    }
    localStorage.removeItem('user');
    navigate('/');
    } catch (error) {
    console.error('Logout error:', error);
    toast.error('Failed to logout properly');
    localStorage.removeItem('user');
    navigate('/');
    }
};

  const handleSubmitRequest = async () => {
    if (!fullName.trim()) {
      toast.error('Please enter the full name for the certificate');
      return;
    }

    if (!purpose.trim()) {
      toast.error('Please specify the purpose of your request');
      return;
    }

    setIsSubmitting(true);
    try {
      const requestData = {
        fullName,
        contactNumber,
        certificateType,
        purpose,
        status: 'pending' // Optional if your backend expects it
      };

      await axios.post(REQUEST_API_URL, requestData);
      toast.success('Certificate request submitted successfully!');
      setFullName('');
      setContactNumber('');
      setPurpose('');
      setCertificateType('clearance');
    } catch (error) {
      console.error('Error submitting request:', error);
      toast.error('Failed to submit request');
    } finally {
      setIsSubmitting(false);
    }
  };

  const certificateTypes = {
    clearance: {
      name: "Barangay Clearance",
      description: "Certifies that you are a resident in good standing with no pending barangay violations."
    },
    residency: {
      name: "Certificate of Residency",
      description: "Certifies that you are a bona fide resident of the barangay."
    },
    indigency: {
      name: "Certificate of Indigency",
      description: "Certifies that you belong to an indigent family for availing government assistance."
    }
  };

  return (
    <div className="dashboard-container">
      <div className="header">
        <div className="header-logo">
          <h1>Barangay San Roque Management System</h1>
        </div>
        <nav className="all-main-nav">
          <ul>
          <li ><a href="">Management</a></li>
            <li><a href="/home">Home</a></li>
            <li className="brgy-active"><a href="/v-certificate">Request Certificate</a></li>
          </ul>
        </nav>
      </div>

      <div className="dashboard-layout">
        {/* Sidebar */}
        <div className="sidebar">
      <div 
        className="sidebar-profile clickable " 
        onClick={() => navigate('/v-profile')}
        style={{ cursor: 'pointer' }}
      >
        <img src={user?.avatar ? user.avatar : defaultAvatar} alt="User Avatar" className="avatar" />
        <div className="sidebar-profile-text">
<h3>{user?.firstName} {user?.lastName}</h3>
<p>Viewer</p>
</div>
      </div>

      <div className="sidebar-menu">
          <a href="#" className="sidebar-nav-item " onClick={() => navigate('/viewer-dashboard')}>
              <i className="fas fa-tachometer-alt"></i> Dashboard
            </a>
            <a href="#" className="sidebar-nav-item " onClick={() => navigate('/v-resident')}>
              <i className="fas fa-users"></i> Residents
            </a>
            <a href="#" className="sidebar-nav-item active" onClick={() => navigate('/v-certificate')}>
              <i className="fas fa-file-alt"></i> Request Certificate
            </a>
            <a href="#" className="sidebar-nav-item" onClick={handleLogout}>
              <i className="fas fa-sign-out-alt"></i> Logout
            </a>
          </div>
        </div>



        {/* Main content */}
        <div className="resident-content">
          <div className="resident-overview-container">
            <div className="resident-title-section">
              <h1 className="resident-title">Request Barangay Certificate</h1>
              <p className="resident-subtitle">Fill out the form below to request an official barangay certificate</p>
            </div>

            {/* Certificate Recipient Information */}
            <div className="resident-info-card">
              <div className="resident-info-header">
                <h3>Certificate Recipient Information</h3>
              </div>

              <div className="certificate-recipient-form">
                <div className="form-group">
                  <label htmlFor="fullName">Full Name:</label>
                  <input
                    type="text"
                    id="fullName"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Enter full name for certificate"
                    required
                  />
                </div>

                <div className="form-group half">
                  <label htmlFor="contactNumber">Contact Number (Optional):</label>
                  <input
                    type="text"
                    id="contactNumber"
                    value={contactNumber}
                    onChange={(e) => setContactNumber(e.target.value)}
                    placeholder="Enter contact number"
                  />
                </div>
              </div>
            </div>

            {/* Certificate Request Form */}
            <div className="certificate-request-form">
              <h3>Certificate Details</h3>

              <div className="form-group">
                <label>Certificate Type:</label>
                <div className="certificate-type-options">
                  {Object.entries(certificateTypes).map(([type, details]) => (
                    <div
                      key={type}
                      className={`certificate-type-card ${certificateType === type ? 'selected' : ''}`}
                      onClick={() => setCertificateType(type)}
                    >
                      <h4>{details.name}</h4>
                      <p>{details.description}</p>
                      <div className="radio-indicator">
                        <div className={`radio-circle ${certificateType === type ? 'active' : ''}`}></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="purpose">Purpose:</label>
                <textarea
                  id="purpose"
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value)}
                  placeholder="Please specify the purpose for requesting this certificate..."
                  rows="4"
                  required
                ></textarea>
                <p className="form-hint">Be specific about why you need this certificate (e.g., for employment, scholarship application, etc.)</p>
              </div>

              <div className="form-actions">
                <button 
                  className="submit-request-button"
                  onClick={handleSubmitRequest}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <i className="fas fa-spinner fa-spin"></i> Submitting...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-paper-plane"></i> Submit Request
                    </>
                  )}
                </button>
              </div>

              <div className="request-process-info">
                <h4>Request Process Information</h4>
                <ol>
                  <li>Fill out the form above and submit your request</li>
                  <li>Your request will be reviewed by barangay officials</li>
                  <li>You will receive a notification once your request is approved or rejected</li>
                  <li>If approved, you may claim your certificate at the barangay hall</li>
                </ol>
                <p className="note"><strong>Note:</strong> Processing time may take 1-3 business days.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <ToastContainer position="bottom-right" />
    </div>
  );
}

export default RequestCertificate;
