import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Legend, 
  PieChart, Pie, Cell, ResponsiveContainer, AreaChart, Area 
} from 'recharts';
import { useNavigate } from 'react-router-dom';
import defaultAvatar from "../assets/avatar.png";
import '../style/Admin.css';
import '@fortawesome/fontawesome-free/css/all.min.css';

const RESIDENTS_API_URL = 'http://localhost:5000/residents';
const AUTH_API_URL = 'http://localhost:5000/api';

// Custom color palette for charts
const COLORS = ['#6f1926', '#e0a2a2', '#c08081', '#a05f61', '#804041'];

function AdminDashboard() {
  const [residents, setResidents] = useState([]);
  const [user, setUser] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  
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
          fetchResidents();
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

  // Calculate data for visualizations
  const totalPopulation = residents.length;
  const totalHouseholds = new Set(residents.map(resident => resident.householdId)).size;
  const averageHouseholdSize = totalPopulation / totalHouseholds;
  const seniorCitizens = residents.filter(resident => resident.age >= 60).length;
  const pwdCount = residents.filter(resident => resident.pwdStatus === 'Yes').length;
  const employedCount = residents.filter(resident => resident.occupation !== 'Unemployed').length;
  const employmentRate = (employedCount / totalPopulation) * 100;

  const genderData = [
    { name: 'Male', value: residents.filter(resident => resident.gender === 'Male').length },
    { name: 'Female', value: residents.filter(resident => resident.gender === 'Female').length },
  ];

  const ageData = residents.reduce((acc, resident) => {
    let ageGroup;
    if (resident.age <= 12) ageGroup = '0-12';
    else if (resident.age <= 17) ageGroup = '13-17';
    else if (resident.age <= 59) ageGroup = '18-59';
    else ageGroup = '60+';
    acc[ageGroup] = (acc[ageGroup] || 0) + 1;
    return acc;
  }, {});

  const ageChartData = Object.keys(ageData).map(ageGroup => ({
    name: ageGroup,
    count: ageData[ageGroup],
  }));

  const educationData = residents.reduce((acc, resident) => {
    acc[resident.educationalAttainment] = (acc[resident.educationalAttainment] || 0) + 1;
    return acc;
  }, {});

  const educationChartData = Object.keys(educationData).map(education => ({
    name: education,
    count: educationData[education],
  }));

  // Household size distribution
  const householdSizeData = residents.reduce((acc, resident) => {
    const householdId = resident.householdId;
    acc[householdId] = (acc[householdId] || 0) + 1;
    return acc;
  }, {});

  const householdDistribution = Object.values(householdSizeData).reduce((acc, size) => {
    acc[size] = (acc[size] || 0) + 1;
    return acc;
  }, {});

  const householdSizeChartData = Object.keys(householdDistribution).map(size => ({
    size: `${size} people`,
    households: householdDistribution[size],
  }));

  // Population trend by age (for area chart)
  const populationTrendData = residents.reduce((acc, resident) => {
    const age = resident.age;
    acc[age] = (acc[age] || 0) + 1;
    return acc;
  }, {});

  const populationTrendChartData = Object.keys(populationTrendData)
    .map(age => ({
      age: parseInt(age),
      population: populationTrendData[age],
    }))
    .sort((a, b) => a.age - b.age);



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
        <li><a href="/v-certificate">Request Certificate</a></li>
      </ul>
    </nav>
    </div>
      
      <div className="dashboard-layout">
        {/* Sidebar */}
        <div className="sidebar">
          <div 
            className="sidebar-profile clickable" 
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
            <a href="#" className="sidebar-nav-item active" onClick={() => navigate('/viewer-dashboard')}>
              <i className="fas fa-tachometer-alt"></i> Dashboard
            </a>
            <a href="#" className="sidebar-nav-item " onClick={() => navigate('/v-resident')}>
              <i className="fas fa-users"></i> Residents
            </a>
            <a href="#" className="sidebar-nav-item" onClick={() => navigate('/v-certificate')}>
              <i className="fas fa-file-alt"></i> Request Certificate
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
              <h1 className="dashboard-title">Dashboard Overview</h1>
            </div>

            {/* Statistics Cards - First Row */}
            <div className="stats-row">
              <div className="stat-card">
                <div className="stat-icon"><i className="fas fa-users"></i></div>
                <div className="stat-content">
                  <h3>{totalPopulation}</h3>
                  <p>Total Population</p>
                </div>
              </div>
              
              <div className="stat-card">
                <div className="stat-icon"><i className="fas fa-home"></i></div>
                <div className="stat-content">
                  <h3>{totalHouseholds}</h3>
                  <p>Total Households</p>
                </div>
              </div>
              
              <div className="stat-card">
                <div className="stat-icon"><i className="fas fa-user-tie"></i></div>
                <div className="stat-content">
                  <h3>{seniorCitizens}</h3>
                  <p>Senior Citizens</p>
                </div>
              </div>
              
              <div className="stat-card">
                <div className="stat-icon"><i className="fas fa-wheelchair"></i></div>
                <div className="stat-content">
                  <h3>{pwdCount}</h3>
                  <p>PWD Count</p>
                </div>
              </div>
            </div>

            {/* Second Row of Stats */}
            <div className="stats-row">
              <div className="stat-card">
                <div className="stat-icon"><i className="fas fa-chart-bar"></i></div>
                <div className="stat-content">
                  <h3>{averageHouseholdSize.toFixed(2)}</h3>
                  <p>Avg Household Size</p>
                </div>
              </div>
              
              <div className="stat-card">
                <div className="stat-icon"><i className="fas fa-briefcase"></i></div>
                <div className="stat-content">
                  <h3>{employmentRate.toFixed(2)}%</h3>
                  <p>Employment Rate</p>
                </div>
              </div>
              
              <div className="stat-card">
                <div className="stat-icon"><i className="fas fa-baby"></i></div>
                <div className="stat-content">
                  <h3>{ageData['0-12'] || 0}</h3>
                  <p>Children (0-12)</p>
                </div>
              </div>
            </div>

            {/* Visualization Grid */}
            <div className="visualization-grid">
              {/* Gender Distribution */}
              <div className="chart-container">
                <h3>Population by Gender</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={genderData}
                      dataKey="value"
                      nameKey="name"
                      outerRadius={100}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {genderData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`${value} residents`, 'Count']} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Age Distribution */}
              <div className="chart-container">
                <h3>Age Distribution</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={ageChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`${value} residents`, 'Count']} />
                    <Legend />
                    <Bar dataKey="count" fill="#6f1926" name="Residents" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Educational Attainment */}
              <div className="chart-container">
                <h3>Educational Attainment</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={educationChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`${value} residents`, 'Count']} />
                    <Legend />
                    <Bar dataKey="count" fill="#6f1926" name="Residents" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              
              {/* Household Size Distribution */}
              <div className="chart-container">
                <h3>Household Size Distribution</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={householdSizeChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="size" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`${value} households`, 'Count']} />
                    <Legend />
                    <Bar dataKey="households" fill="#6f1926" name="Households" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Population Trend by Age */}
              <div className="chart-container">
                <h3>Population Trend by Age</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={populationTrendChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="age" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`${value} residents`, 'Count']} />
                    <Legend />
                    <Area 
                      type="monotone" 
                      dataKey="population" 
                      fill="#e0a2a2" 
                      stroke="#6f1926" 
                      name="Residents" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      </div>

      <ToastContainer />
    </div>
  );
}

export default AdminDashboard;