
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './style/Login.css'; 


function Login() {
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();

  // Check if user is already logged in on component mount
  useEffect(() => {
    const loggedInUser = localStorage.getItem('user');
    if (loggedInUser) {
      const userData = JSON.parse(loggedInUser);
      // Redirect based on role
      if (userData.role === 'admin') {
        navigate('/admin-dashboard');
      } else if (userData.role === 'moderator') {
        navigate('/moderator-dashboard');
      } else {
        navigate('/viewer-dashboard');
      }
    }
  }, [navigate]);

  const handleChange = (e) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:5000/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.message || 'Login failed');
        setIsLoading(false);
        return;
      }

      // Store user data in localStorage
      localStorage.setItem('user', JSON.stringify(data.user));
      
      // Show success message
      toast.success('Login successful!');

      // Redirect based on user role
      setTimeout(() => {
        if (data.user.role === 'admin') {
          navigate('/home');
        } else if (data.user.role === 'moderator') {
          navigate('/home');
        } else {
          navigate('/home');
        }
      }, 1000); // Short delay to show toast message
      
    } catch (error) {
      toast.error('Error connecting to server');
      console.error('Login error:', error);
      setIsLoading(false);
    }
  };

  return (
    <div className="body-container">
      {/* Navbar would go here if needed */}
      
      {/* Login Section */}
      <section className="login-section">
        <div className="login-container">
          <div className="login-image">
            <h2>Welcome to Barangay San Roque Portal</h2>
            <p>Login to access the Barangay Management System designed to support community services and information.</p>
            <ul className="features">
              <li><i className="fas fa-calendar-check"></i> Manage barangay records and services</li>
              <li><i className="fas fa-comment-dots"></i> Access community information</li>
              <li><i className="fas fa-file-alt"></i> View and update resident data</li>
              <li><i className="fas fa-book"></i> Access barangay resources</li>
            </ul>
          </div>
          <div className="login-form-container">
            <div className="login-form-header">
              <h3>Sign In</h3>
              <p>Enter your credentials to access your account</p>
            </div>
            <form className="login-form" onSubmit={handleLogin}>
              <div className="form-group">
                <label htmlFor="username">Username</label>
                <input
                  type="text"
                  id="username"
                  name="username"
                  className="form-control"
                  placeholder="Enter your username"
                  value={credentials.username}
                  onChange={handleChange}
                  disabled={isLoading}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="password">Password</label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  className="form-control"
                  placeholder="Enter your password"
                  value={credentials.password}
                  onChange={handleChange}
                  disabled={isLoading}
                  required
                />
              </div>

              <button type="submit" className="btn btn-primary" disabled={isLoading}>
                {isLoading ? 'Signing In...' : 'Sign In'}
              </button>

              <div className="social-login">

              </div>
              <div className="register-link">
                <p>Don't have an account? <Link to="/signup">Register here</Link></p>
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <p>&copy; 2025 Barangay San Roque. All rights reserved.</p>
        </div>
      </footer>

      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </div>
  );
}

export default Login;