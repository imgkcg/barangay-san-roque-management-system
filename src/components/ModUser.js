import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from 'react-router-dom';
import defaultAvatar from "../assets/avatar.png";
import '../style/Admin.css';
import '@fortawesome/fontawesome-free/css/all.min.css';

const RESIDENTS_API_URL = 'http://localhost:5000/residents';
const AUTH_API_URL = 'http://localhost:5000/api';
const USERS_API_URL = 'http://localhost:5000/users';

function AdminDashboard() {
  const [residents, setResidents] = useState([]);
  const [showUserDetails, setShowUserDetails] = useState(false);
  const [isUserDetailsModalVisible, setIsUserDetailsModalVisible] = useState(false);
  const [user, setUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [isUserEditModalVisible, setIsUserEditModalVisible] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  const navigate = useNavigate();

  // Fetch users from the API
  const fetchUsers = async () => {
    try {
      const response = await axios.get(USERS_API_URL);
      setUsers(response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Error fetching users!');
    }
  };

  // Edit a user
  const handleEditUser = (user) => {
    setSelectedUser(user);
    setIsUserEditModalVisible(true);
  };


  const handleUserEditSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`${USERS_API_URL}/${selectedUser._id}`, selectedUser);
      toast.success("User updated successfully!");
      fetchUsers();
      setIsUserEditModalVisible(false);
    } catch (error) {
      console.error('Error updating user:', error);
      toast.error("Error updating user!");
    }
  };

  // Delete a user
  const handleDeleteUser = async (id) => {
    try {
      await axios.delete(`${USERS_API_URL}/${id}`);
      toast.success("User deleted!");
      fetchUsers();
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error("Error deleting user!");
    }
  };



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
          fetchResidents();
          fetchUsers();
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

  const fetchResidents = async () => {
    try {
      const response = await axios.get(RESIDENTS_API_URL);
      setResidents(response.data);
    } catch (error) {
      console.error('Error fetching residents:', error);
      toast.error('Failed to fetch residents');
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
        <li className="brgy-active"><a href="">Management</a></li>
        <li ><a href="/home">Home</a></li>
        <li><a href="/mod-req">Request Certificate</a></li>
      </ul>
    </nav>
    </div>
      
      
    <div className="dashboard-layout">
        {/* Sidebar */}
        <div className="sidebar">
          <div 
            className="sidebar-profile clickable" 
            onClick={() => navigate('/mod-profile')}
            style={{ cursor: 'pointer' }}
          >
            <img src={user?.avatar ? user.avatar : defaultAvatar} alt="User Avatar" className="avatar" />
            <div className="sidebar-profile-text">
              <h3>{user?.firstName} {user?.lastName}</h3>
              <p>Moderator</p>
            </div>
          </div>
          
          <div className="sidebar-menu">
            <a href="#" className="sidebar-nav-item " onClick={() => navigate('/moderator-dashboard')}>
              <i className="fas fa-tachometer-alt"></i> Dashboard
            </a>
            <a href="#" className="sidebar-nav-item " onClick={() => navigate('/mod-resident')}>
              <i className="fas fa-users"></i> Residents
            </a>
            <a href="#" className="sidebar-nav-item" onClick={() => navigate('/mod-certificate')}>
              <i className="fas fa-file-alt"></i> Certificate
            </a>
            <a href="#" className="sidebar-nav-item active" onClick={() => navigate('/mod-user')}>
              <i className="fas fa-user-friends"></i> Users
            </a>
            <a href="#" className="sidebar-nav-item" onClick={handleLogout}>
              <i className="fas fa-sign-out-alt"></i> Logout
            </a>
          </div>
        </div>

        {/* Main content */}
        <div className="main-content">
          <div className="dashboard-overview-container">
            <div className="dashboard-title-section">
              <h1 className="dashboard-title">User Management</h1>
              </div>

            {/* User Management Table */}
            <div className="user-management-container">
              <table className="user-table">
                <thead>
                  <tr>
                    <th>Username</th>
                    <th>Name</th>
                    <th>Age</th>
                    <th>Address</th>
                    <th>Gender</th>
                    <th>Phone No</th>
                    <th>Email</th>
                    <th>Role</th>

                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user._id}>
                      <td>{user.username}</td>
                      <td>{user.firstName} {user.lastName}</td>
                      <td>{user.age}</td>
                      <td>{user.address}</td>
                      <td>{user.gender}</td>
                      <td>{user.phoneNumber}</td>
                      <td>{user.email}</td>
                      <td>{user.role}</td>
                      <td>
                        
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Edit User Modal */}
      {isUserEditModalVisible && selectedUser && (
        <div className="umodal-overlay">
          <div className="umodal">
            <div className="umodal-header">
              <h3>Edit User</h3>
              <button 
                className="close-btn"
                onClick={() => {
                  console.log("Closing modal");
                  setIsUserEditModalVisible(false);
                }}
              >
                &times;
              </button>
            </div>
            <div className="uprofile-form">
              <form onSubmit={handleUserEditSubmit}>
            
                <div className="form-group">
                  <label>Username</label>
                  <input 
                    type="text" 
                    value={selectedUser.username || ''}
                    onChange={(e) => setSelectedUser({
                      ...selectedUser,
                      username: e.target.value
                    })}
                    required
                  />
                </div>
                <div className="form-row">
                <div className="form-group">
                  <label>First Name</label>
                  <input 
                    type="text" 
                    value={selectedUser.firstName || ''}
                    onChange={(e) => setSelectedUser({
                      ...selectedUser,
                      firstName: e.target.value
                    })}
                    required
                  />
                </div>
          
            
                <div className="form-group">
                  <label>Last Name</label>
                  <input 
                    type="text" 
                    value={selectedUser.lastName || ''}
                    onChange={(e) => setSelectedUser({
                      ...selectedUser,
                      lastName: e.target.value
                    })}
                    required
                  />
                </div>
                </div>
                <div className="form-row">
                <div className="form-group">
                  <label>Age</label>
                  <input 
                    type="number" 
                    value={selectedUser.age || ''}
                    onChange={(e) => setSelectedUser({
                      ...selectedUser,
                      age: e.target.value
                    })}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label>Gender</label>
                  <select
                    type="text" 
                    value={selectedUser.gender || ''}
                    onChange={(e) => setSelectedUser({
                      ...selectedUser,
                      gender: e.target.value
                    })}
                    required
                    >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                  </select>
                </div>
                </div>
                <div className="form-row">
                <div className="form-group">
                  <label>Address</label>
                  <input 
                    type="text" 
                    value={selectedUser.address || ''}
                    onChange={(e) => setSelectedUser({
                      ...selectedUser,
                      address: e.target.value
                    })}
                    required
                  />
              
                </div>
                <div className="form-group">
                  <label>Phone Number</label>
                  <input 
                    type="text" 
                    value={selectedUser.phoneNumber || ''}
                    onChange={(e) => setSelectedUser({
                      ...selectedUser,
                      phoneNumber: e.target.value
                    })}
                    required
                  />
                </div>
                </div>
                <div className="form-group">
                  <label>Email</label>
                  <input 
                    type="text" 
                    value={selectedUser.email || ''}
                    onChange={(e) => setSelectedUser({
                      ...selectedUser,
                      email: e.target.value
                    })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Role</label>
                  <select
                    value={selectedUser.role || 'user'}
                    onChange={(e) => setSelectedUser({
                      ...selectedUser,
                      role: e.target.value
                    })}
                    required
                  >
                    <option value="admin">Admin</option>
                    <option value="moderator">Moderator</option>
                    <option value="viewer">Viewer</option>
                  </select>
                </div>
                <div className="uform-actions">
                  <button type="submit" className="save-btn">
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}


      <ToastContainer />
    </div>
  );
}

export default AdminDashboard; 