import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './lib/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Feed from './pages/Feed';
import Profile from './pages/Profile';
import Dashboard from './pages/Dashboard';
import Prestamos from './pages/Prestamos';
import SinglePost from './pages/SinglePost';
import JobsPortal from './pages/JobsPortal';
import JobCVBuilder from './pages/JobCVBuilder';
import CompanyPortal from './pages/CompanyPortal';
import CandidateApplications from './pages/CandidateApplications';
import AdminCompanyPortal from './pages/AdminCompanyPortal';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/feed" element={<Feed />} />
          <Route path="/post/:id" element={<SinglePost />} />
          <Route path="/perfil/:userId" element={<Profile />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/prestamos" element={<Prestamos />} />
          {/* Jobs Portal Routes */}
          <Route path="/empleos" element={<JobsPortal />} />
          <Route path="/empleos/cv" element={<JobCVBuilder />} />
          <Route path="/empleos/empresa" element={<CompanyPortal />} />
          <Route path="/empleos/mis-postulaciones" element={<CandidateApplications />} />
          <Route path="/empleos/admin" element={<AdminCompanyPortal />} />
          {/* Redirect old routes */}
          <Route path="/home" element={<Navigate to="/feed" replace />} />
          <Route path="/hall-of-fame" element={<Navigate to="/feed" replace />} />
          <Route path="/admin" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
