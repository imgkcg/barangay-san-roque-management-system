    import React, { useState, useEffect } from 'react';
    import axios from 'axios';
    import { ToastContainer, toast } from 'react-toastify';
    import 'react-toastify/dist/ReactToastify.css';
    import { useNavigate } from 'react-router-dom';
    import defaultAvatar from "../assets/avatar.png";
    import '../style/Admin.css';
    import '@fortawesome/fontawesome-free/css/all.min.css';

    const AUTH_API_URL = 'http://localhost:5000/api';
    const USERS_API_URL = 'http://localhost:5000/users';

    function Profile() {
    const [user, setUser] = useState(null);
    const [isEditMode, setIsEditMode] = useState(false);
    const [editedUser, setEditedUser] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const navigate = useNavigate();

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
            setEditedUser(response.data);
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

    const handleEditSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        
        try {
        const response = await axios.put(`${USERS_API_URL}/${editedUser._id}`, editedUser);
        toast.success("Profile updated successfully!");
        setUser(response.data);
        setEditedUser(response.data);
        setIsEditMode(false);
        
        // Update localStorage with new user data
        localStorage.setItem('user', JSON.stringify({
            username: response.data.username,
            token: JSON.parse(localStorage.getItem('user')).token
        }));
        } catch (error) {
        console.error('Error updating profile:', error);
        toast.error("Error updating profile!");
        } finally {
        setIsSubmitting(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setEditedUser(prev => ({
        ...prev,
        [name]: value
        }));
    };

    if (!user) return <div>Loading...</div>;

    return (
        <div className="dashboard-container">
        <div className="header">
        <div className="header-logo">
          <h1>Barangay San Roque Management System</h1>
        </div>
        <nav className="all-main-nav">
          <ul>
            <li className="brgy-active"><a href="">Management</a></li>
            <li ><a href="/home">Home</a></li>
            <li><a href="/admin-req">Request Certificate</a></li>
          </ul>
        </nav>
        </div>
          
        
        <div className="dashboard-layout">
        {/* Sidebar */}
        <div className="sidebar">
          <div 
            className="sidebar-profile clickable" 
            onClick={() => navigate('/profile')}
            style={{ cursor: 'pointer' }}
          >
            <img src={user?.avatar ? user.avatar : defaultAvatar} alt="User Avatar" className="avatar" />
            <div className="sidebar-profile-text">
  <h3>{user?.firstName} {user?.lastName}</h3>
  <p>
    {user?.role === 'admin' && 'Administrator'}
    {user?.role === 'moderator' && 'Moderator'}
    {user?.role === 'viewer' && 'Viewer'}
    {user?.role && !['admin', 'moderator', 'viewer'].includes(user.role) && user.role}
  </p>
</div>
          </div>
          
            
            <div className="sidebar-menu">
                <a href="#" className="sidebar-nav-item" onClick={() => navigate('/admin-dashboard')}>
                <i className="fas fa-tachometer-alt"></i> Dashboard
                </a>
                <a href="#" className="sidebar-nav-item" onClick={() => navigate('/admin-resident')}>
                <i className="fas fa-users"></i> Residents
                </a>
                <a href="#" className="sidebar-nav-item" onClick={() => navigate('/certificate')}>
                <i className="fas fa-file-alt"></i> Certificate
                </a>
                <a href="#" className="sidebar-nav-item" onClick={() => navigate('/admin-user')}>
                <i className="fas fa-user-friends"></i> Users
                </a>
                <a href="#" className="sidebar-nav-item" onClick={handleLogout}>
                <i className="fas fa-sign-out-alt"></i> Logout
                </a>
            </div>
            </div>

            {/* Main content */}
            <div className="profile-content">
            <div className="profile-overview-container">
                <div className="profile-title-section">
                <h1 className="dashboard-title">My Profile</h1>
              
                </div>

                {isEditMode ? (
                <form className="uprofile-form" onSubmit={handleEditSubmit}>
                    <div className="form-row">
                    <div className="form-group">
                        <label>Username</label>
                        <input
                        type="text"
                        name="username"
                        value={editedUser.username || ''}
                        onChange={handleInputChange}
                        required
                        />
                    </div>
                    <div className="form-group">
                        <label>Role</label>
                        <input
                        type="text"
                        value={editedUser.role || ''}
                        disabled
                        />
                    </div>
                    </div>

                    <div className="form-row">
                    <div className="form-group">
                        <label>First Name</label>
                        <input
                        type="text"
                        name="firstName"
                        value={editedUser.firstName || ''}
                        onChange={handleInputChange}
                        required
                        />
                    </div>
                    <div className="form-group">
                        <label>Last Name</label>
                        <input
                        type="text"
                        name="lastName"
                        value={editedUser.lastName || ''}
                        onChange={handleInputChange}
                        required
                        />
                    </div>
                    </div>

                    <div className="form-row">
                    <div className="form-group">
                        <label>Email</label>
                        <input
                        type="email"
                        name="email"
                        value={editedUser.email || ''}
                        onChange={handleInputChange}
                        required
                        />
                    </div>
                    <div className="form-group">
                        <label>Phone Number</label>
                        <input
                        type="text"
                        name="phoneNumber"
                        value={editedUser.phoneNumber || ''}
                        onChange={handleInputChange}
                        required
                        />
                    </div>
                    </div>

                    <div className="form-row">
                    <div className="form-group">
                        <label>Age</label>
                        <input
                        type="number"
                        name="age"
                        value={editedUser.age || ''}
                        onChange={handleInputChange}
                        required
                        />
                    </div>
                    <div className="form-group">
                        <label>Gender</label>
                        <select
                        name="gender"
                        value={editedUser.gender || ''}
                        onChange={handleInputChange}
                        required
                        >
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        </select>
                    </div>
                    </div>

                    <div className="form-group">
                    <label>Address</label>
                    <input
                        type="text"
                        name="address"
                        value={editedUser.address || ''}
                        onChange={handleInputChange}
                        required
                    />
                    </div>

                    <div className="form-actions">
                    <button
                        type="button"
                        className="cancel-btn"
                        onClick={() => {
                        setIsEditMode(false);
                        setEditedUser(user);
                        }}
                        disabled={isSubmitting}
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        className="save-btn"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? 'Saving...' : 'Save Changes'}
                    </button>
                    </div>
                </form>
                ) : (
                <div className="profile-details">
                    <div className="profile-info">
                    <div className="pinfo-row">
                        <span className="pinfo-label">Username:</span>
                        <span className="pinfo-value">{user.username}</span>
                    </div>
                    <div className="pinfo-row">
                        <span className="pinfo-label">Name:</span>
                        <span className="pinfo-value">{user.firstName} {user.lastName}</span>
                    </div>
                    <div className="pinfo-row">
                        <span className="pinfo-label">Role:</span>
                        <span className="pinfo-value">{user.role}</span>
                    </div>
                    <div className="pinfo-row">
                        <span className="pinfo-label">Email:</span>
                        <span className="pinfo-value">{user.email}</span>
                    </div>
                    <div className="pinfo-row">
                        <span className="pinfo-label">Phone:</span>
                        <span className="pinfo-value">{user.phoneNumber}</span>
                    </div>
                    <div className="pinfo-row">
                        <span className="pinfo-label">Age:</span>
                        <span className="pinfo-value">{user.age}</span>
                    </div>
                    <div className="pinfo-row">
                        <span className="pinfo-label">Gender:</span>
                        <span className="pinfo-value">{user.gender}</span>
                    </div>
                    <div className="pinfo-row">
                        <span className="pinfo-label">Address:</span>
                        <span className="pinfo-value">{user.address}</span>
                    </div>
                    </div>
                </div>
                )}
            </div>
            </div>
        </div>

        <ToastContainer />
        </div>
    );
    }

    export default Profile;