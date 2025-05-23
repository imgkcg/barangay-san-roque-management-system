import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer, toast } from 'react-toastify';
import defaultAvatar from "../assets/avatar.png";

import '../style/Home.css';
import '@fortawesome/fontawesome-free/css/all.min.css';

const AUTH_API_URL = 'http://localhost:5000/api';

function HomePage() {
  const [user, setUser] = useState(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const checkSession = async () => {
      try {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          const parsedUser = JSON.parse(storedUser);
          const response = await axios.get(`${AUTH_API_URL}/me`, {
            params: { username: parsedUser.username }
          });

          if (response.data) {
            setUser(response.data);
          }
        }
      } catch (error) {
        console.error('Session check failed:', error);
      }
    };

    checkSession();
  }, []);

  const handleLogout = async () => {
    try {
      if (user) {
        await axios.post(`${AUTH_API_URL}/logout`, { username: user.username });
      }
      localStorage.removeItem('user');
      navigate('/');
      toast.success('Logged out successfully');
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Failed to logout properly');
      localStorage.removeItem('user');
      navigate('/');
    }
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const navigateToDashboard = () => {
    if (!user) return;
    
    switch(user.role) {
      case 'admin':
        navigate('/admin-dashboard');
        break;
      case 'moderator':
        navigate('/moderator-dashboard');
        break;
      case 'viewer':
        navigate('/viewer-dashboard');
        break;
      default:
        navigate('/');
    }
  };


  const navigateToRequest = () => {
    if (!user) return;
    
    switch(user.role) {
      case 'admin':
        navigate('/admin-req');
        break;
      case 'moderator':
        navigate('/mod-req');
        break;
      case 'viewer':
        navigate('/v-certificate');
        break;
      default:
        navigate('/');
    }
  };


  const navigateToProfile = () => {
    if (!user) return;
    
    switch(user.role) {
      case 'admin':
        navigate('/profile');
        break;
      case 'moderator':
        navigate('/mod-profile');
        break;
      case 'viewer':
        navigate('/v-profile');
        break;
    }
  };

  return (
    <div className="brgy-container">
      {/* Header */}
      <header className="brgy-header">
        <div className="brgy-header-logo">
          <h1>BRS</h1>
        </div>
        <nav className="brgy-main-nav">
          <ul>
            <li className="brgy-active"><a href="#home">Home</a></li>
            {user && (
              <li><a onClick={navigateToDashboard}>Dashboard</a></li>
            )}
            <li><a href="#about">About</a></li>
            <li><a href="#officials">Officials</a></li>
            <li><a href="#contact">Contact</a></li>
            {user && (
              <li><a onClick={navigateToRequest}>Request Certificate</a></li>
            )}
          </ul>
        </nav>
        
        <div className="brgy-header-right">
          {user && (
            <div className="brgy-user-profile">
              <img 
                src={user?.avatar ? user.avatar : defaultAvatar} 
                alt="User Avatar" 
                className="brgy-avatar" 
                onClick={toggleMenu}
              />
              {isMenuOpen && (
                <div className="brgy-profile-dropdown">
                  <div className="brgy-dropdown-item" onClick={navigateToProfile}>
                    <i className="fas fa-user"></i> Profile
                  </div>

                  <div className="brgy-dropdown-item" onClick={handleLogout}>
                    <i className="fas fa-sign-out-alt"></i> Logout
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </header>


      {/* Navigation */}
      

      {/* Hero Section */}
      <section id="home" className="brgy-hero-section">
        <div className="brgy-hero-content">
          <h1>Welcome to Barangay San Roque</h1>
          
        </div>
        <blockquote class="quote-text">
        Serving our community with pride and dedication
      </blockquote>
      </section>

      {/* About Section */}
      <section id="about" className="brgy-about-section">
        <div className="brgy-container">
          <h2 className="brgy-section-title">About Our Barangay</h2>
          <div className="brgy-about-content">
            <div className="brgy-about-text">
              <p>
              Barangay San Roque is one of the many vibrant and growing barangays in Iligan City, located in the northern part of Mindanao. It has a total land area of approximately 1.82 square kilometers and is home to 5,292 residents as recorded in the 2020 Census.
              </p>
              <p>
              San Roque is primarily a residential and semi-rural community, with several puroks (zones) spread across the barangay. Based on the 2015 data, there were 1,077 households, with an average household size of 4.40 persons. 
              </p>
              <p>
              The barangay government works actively to serve its constituents through programs in health, education, livelihood, and infrastructure development. Residents take pride in their sense of community, and the barangay continues to progress while preserving its local identity and natural surroundings.


              </p>
            </div>
            <div className="brgy-about-stats">
              <div className="brgy-stat-item">
                <i className="fas fa-users"></i>
                <h3>5,000+</h3>
                <p>Residents</p>
              </div>
              <div className="brgy-stat-item">
                <i className="fas fa-home"></i>
                <h3>1,000+</h3>
                <p>Households</p>
              </div>
              <div className="brgy-stat-item">
                <i className="fas fa-map-marked-alt"></i>
                <h3>1.821 km²</h3>
                <p>Land Area</p>
              </div>
              <div className="brgy-stat-item">
                <i className="fas fa-building"></i>
                <h3>4+</h3>
                <p>Establishments</p>
              </div>
            </div>
          </div>
        </div>
      </section>
   {/* Officials Section */}
   <section id="officials" className="officials-section">
        <div className="container">
          <h2 className="section-title">Barangay Officials</h2>
          <div className="officials-grid">
            <div className="official-card">
              <div className="official-photo">
              <img src={user?.avatar ? user.avatar : defaultAvatar} alt="User Avatar" className="avatar" />
              </div>
              <h3>Hon. Juan Dela Cruz</h3>
              <p className="official-title">Barangay Captain</p>
              <p>Serving since 2019</p>
            </div>
            
            <div className="official-card">
              <div className="official-photo">
              <img src={user?.avatar ? user.avatar : defaultAvatar} alt="User Avatar" className="avatar" />
              </div>
              <h3>Maria Santos</h3>
              <p className="official-title">Barangay Secretary</p>
              <p>Serving since 2020</p>
            </div>
            
            <div className="official-card">
              <div className="official-photo">
              <img src={user?.avatar ? user.avatar : defaultAvatar} alt="User Avatar" className="avatar" />
              </div>
              <h3>Pedro Reyes</h3>
              <p className="official-title">Barangay Treasurer</p>
              <p>Serving since 2019</p>
            </div>
            
            <div className="official-card">
              <div className="official-photo">
              <img src={user?.avatar ? user.avatar : defaultAvatar} alt="User Avatar" className="avatar" />
              </div>
              <h3>Ana Lim</h3>
              <p className="official-title">Kagawad - Health</p>
              <p>Serving since 2019</p>
            </div>
            
            <div className="official-card">
              <div className="official-photo">
              <img src={user?.avatar ? user.avatar : defaultAvatar} alt="User Avatar" className="avatar" />
              </div>
              <h3>Carlos Tan</h3>
              <p className="official-title">Kagawad - Peace & Order</p>
              <p>Serving since 2019</p>
            </div>
            
            <div className="official-card">
              <div className="official-photo">
              <img src={user?.avatar ? user.avatar : defaultAvatar} alt="User Avatar" className="avatar" />
              </div>
              <h3>Elena Garcia</h3>
              <p className="official-title">Kagawad - Education</p>
              <p>Serving since 2022</p>
            </div>
          </div>
        </div>
      </section>
      {/* Contact Section */}
      <section id="contact" className="brgy-contact-section">
        <div className="brgy-container">
          <h2 className="brgy-section-title">Contact Us</h2>
          <div className="brgy-contact-content">
            <div className="brgy-contact-info">
              <div className="brgy-contact-item">
                <i className="fas fa-map-marker-alt"></i>
                <div>
            <a href="https://maps.app.goo.gl/AwhEkwEt9SBWmHhM8" target="_blank" rel="noopener noreferrer">
              <h3>Location</h3>
            </a>
            <p>San Roque Barangay Hall<br />7746+XPM<br />Iligan City, Lanao del Norte</p>
              </div>
              </div>
              
              <div className="brgy-contact-item">
                <i className="fas fa-phone-alt"></i>
                <div>
                  <h3>Phone</h3>
                  <p>(063) 224 6711</p>
                </div>
              </div>
              
              <div className="brgy-contact-item">
                <i className="fas fa-envelope"></i>
                <div>
                  <h3>Email</h3>
                  <p>barangaysanroque1992@gmail.com</p>
                </div>
              </div>
              
              <div className="brgy-contact-item">
                <i className="fas fa-clock"></i>
                <div>
                  <h3>Office Hours</h3>
                  <p>Monday to Friday: 8:00 AM - 5:00 PM<br />Saturday: 8:00 AM - 12:00 PM</p>
                </div>
              </div>
            </div>
            
            <div className="brgy-contact-form">
              <h3>Send us a message</h3>
              <form>
                <div className="brgy-form-group">
                  <input type="text" placeholder="Your Name" required />
                </div>
                <div className="brgy-form-group">
                  <input type="email" placeholder="Your Email" required />
                </div>
                <div className="brgy-form-group">
                  <input type="text" placeholder="Subject" required />
                </div>
                <div className="brgy-form-group">
                  <textarea placeholder="Your Message" rows="5" required></textarea>
                </div>
                <button type="submit" className="brgy-btn brgy-btn-primary">Send Message</button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="brgy-footer">
        <div className="brgy-container">
          <div className="brgy-footer-content">
            <div className="brgy-footer-logo">
              <h2>Barangay San Roque</h2>
              <p>Serving with integrity and compassion</p>
            </div>
            
            <div className="brgy-footer-links">
              <h3>Quick Links</h3>
              <ul>
                <li><a href="#home">Home</a></li>
                <li><a href="#about">About</a></li>
                <li><a href="#officials">Officials</a></li>
                <li><a href="#contact">Contact</a></li>
              </ul>
            </div>
            
            <div className="brgy-footer-social">
              <h3>Follow Us</h3>
              <div className="brgy-social-icons">
                <a href="#" className="brgy-social-icon"><i className="fab fa-facebook-f"></i></a>
                <a href="#" className="brgy-social-icon"><i className="fab fa-twitter"></i></a>
                <a href="#" className="brgy-social-icon"><i className="fab fa-instagram"></i></a>
                <a href="#" className="brgy-social-icon"><i className="fab fa-youtube"></i></a>
              </div>
            </div>
          </div>
          
          <div className="brgy-footer-bottom">
            <p>&copy; 2025 Barangay San Roque. All Rights Reserved.</p>
            <p>
              <a href="/privacy-policy">Privacy Policy</a> | 
              <a href="/terms-of-service">Terms of Service</a>
            </p>
          </div>
        </div>
      </footer>

      <ToastContainer />
    </div>
  );
}

export default HomePage;