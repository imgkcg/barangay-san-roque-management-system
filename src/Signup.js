import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import styles from './Signup.css'; // Import the CSS Module

function Signup() {
  const [formData, setFormData] = useState({
    username: '',
    firstName: '',
    lastName: '',
    age: '',
    address: '',
    gender: '',
    phoneNumber: '',
    email: '',
    password: '',
    role: 'viewer',
    registryCode: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const validateForm = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^\d{11}$/;
    
    if (!formData.username || !formData.firstName || !formData.lastName || 
        !formData.email || !formData.password || !formData.age || 
        !formData.address || !formData.gender || !formData.phoneNumber) {
      toast.error('All fields are required');
      return false;
    }
    
    if (!emailRegex.test(formData.email)) {
      toast.error('Please enter a valid email address');
      return false;
    }

    if (formData.password.length < 8) {
      toast.error('Password should be at least 8 characters long');
      return false;
    }

    if (!phoneRegex.test(formData.phoneNumber)) {
      toast.error('Phone number should be exactly 11 digits');
      return false;
    }

    if (isNaN(formData.age) || formData.age < 1 || formData.age > 120) {
      toast.error('Please enter a valid age');
      return false;
    }

    if ((formData.role === 'admin' || formData.role === 'moderator') && !formData.registryCode) {
      toast.error('Registry code is required for Admin and Moderator roles');
      return false;
    }

    return true;
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    try {
      setIsSubmitting(true);
      
      const dataToSend = {
        ...formData,
        age: Number(formData.age)
      };
      
      const response = await fetch('http://localhost:5000/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataToSend),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Signup failed');
      }

      toast.success('Signup successful! Please log in.');
      setTimeout(() => {
        navigate('/');
      }, 2000);

    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (

    <div className="signup-container">
      <h1 className="signup-title">Register</h1>
      <div className="signup-form-container">
        <form onSubmit={handleSignup} className="signup-form">
          <div className="signup-form-row">
            <div className="signup-form-group">
              <label>First Name:</label>
              <input 
                type="text" 
                name="firstName" 
                value={formData.firstName}
                onChange={handleChange} 
                required 
              />
            </div>
            <div className="signup-form-group">
              <label>Last Name:</label>
              <input 
                type="text" 
                name="lastName" 
                value={formData.lastName}
                onChange={handleChange} 
                required 
              />
            </div>
          </div>
          <div className="signup-form-row">
            <div className="signup-form-group">
              <label>Age:</label>
              <input 
                type="number" 
                name="age" 
                value={formData.age}
                onChange={handleChange} 
                required 
                min="1"
                max="120"
              />
            </div>
            <div className="signup-form-group">
              <label>Gender:</label>
              <select 
                name="gender" 
                value={formData.gender}
                onChange={handleChange} 
                required
              >
                <option value="">Select Gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>
          <div className="signup-form-row">
            <div className="signup-form-group">
              <label>Email:</label>
              <input 
                type="email" 
                name="email" 
                value={formData.email}
                onChange={handleChange} 
                required 
              />
            </div>
            <div className="signup-form-group">
              <label>Phone Number:</label>
              <input 
                type="text" 
                name="phoneNumber" 
                value={formData.phoneNumber}
                onChange={handleChange} 
                required 
                placeholder="Enter 11-digit number" 
              />
            </div>
          </div>
          <div className="signup-form-group">
            <label>Address:</label>
            <input 
              type="text" 
              name="address" 
              value={formData.address}
              onChange={handleChange} 
              required 
            />
          </div>
          <div className="signup-form-group">
            <label>Username:</label>
            <input 
              type="text" 
              name="username" 
              value={formData.username}
              onChange={handleChange} 
              required 
            />
          </div>
          <div className="signup-form-group">
            <label>Password:</label>
            <input 
              type="password" 
              name="password" 
              value={formData.password}
              onChange={handleChange} 
              required 
              placeholder="Enter at least 8 characters" 
            />
          </div>
          <div className="signup-form-group">
            <label>Role:</label>
            <select 
              name="role" 
              value={formData.role}
              onChange={handleChange} 
              required
            >
              <option value="viewer">Viewer</option>
              <option value="moderator">Moderator</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          {(formData.role === 'admin' || formData.role === 'moderator') && (
            <div className="signup-form-group">
              <label>Registry Code:</label>
              <input 
                type="password" 
                name="registryCode" 
                value={formData.registryCode}
                onChange={handleChange} 
                required 
                placeholder="Enter registry code"
              />
            </div>
          )}
          <div className="signup-button-container">
            <button 
              type="submit" 
              className="signup-submit-button"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Creating Account...' : 'Create Account'}
            </button>
          </div>
        </form>
        <button className="signup-login-link">
          <Link to="/">Already have an account? Log In</Link>
        </button>
      </div>
      <ToastContainer position="top-right" autoClose={3000} />
    </div>
    
    
  );
}

export default Signup;