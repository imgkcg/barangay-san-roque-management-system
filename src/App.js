import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './Login';
import Signup from './Signup';
import AdminDashboard from './components/AdminDashboard';
import AdminResident from './components/AdminResident';
import AdminUser from './components/AdminUser';
import Certificate from './components/Cerficate';
import UserProfile from './components/UserProfile';
import AdminCertificateRequest from './components/AdminRequestCertificate';
import Home from './components/Home';
import ModeratorDashboard from './components/ModeratorDashboard';
import ModResident from './components/ModResident';
import ModCertificate from './components/ModCertificate';
import ModUser from './components/ModUser';
import ModCertificateRequest from './components/ModCertificateRequest';
import ModProfile from './components/ModProfile';
import ViewerDashboard from './components/ViewerDashboard';
import VResident from './components/VResident';
import VRequestCertificate from './components/VRequestCertificate';
import VProfile from './components/Vprofile';




function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/admin-dashboard" element={<AdminDashboard />} />
        <Route path="/moderator-dashboard" element={<ModeratorDashboard />} />
        <Route path="/admin-resident" element={<AdminResident />} />
        <Route path="/admin-user" element={<AdminUser />} />
        <Route path="/certificate" element={<Certificate />} />
        <Route path="/profile" element={<UserProfile />} />
        <Route path="/admin-req" element={<AdminCertificateRequest />} />
        <Route path="/home" element={<Home />} />
        <Route path="/mod-resident" element={<ModResident />} />
        <Route path="/mod-certificate" element={<ModCertificate />} />
        <Route path="/mod-user" element={<ModUser />} />
        <Route path="/mod-profile" element={<ModProfile />} />
        <Route path="/mod-req" element={<ModCertificateRequest />} />
        <Route path="/viewer-dashboard" element={<ViewerDashboard />} />
        <Route path="/v-resident" element={<VResident />} />
        <Route path="/v-certificate" element={<VRequestCertificate />} />
        <Route path="/v-profile" element={<VProfile />} />

      </Routes>
    </Router>
  );
}

export default App;
