import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

// Pages
import HomePage      from './pages/HomePage';
import LoginPage     from './pages/LoginPage';
import RegisterPage  from './pages/RegisterPage';
import DonorDashboard from './pages/DonorDashboard';
import ReceiverDashboard from './pages/ReceiverDashboard';
import AdminDashboard from './pages/AdminDashboard';
import ImpactPage    from './pages/ImpactPage';
import BrowsePage    from './pages/BrowsePage';
import DonationDetailPage from './pages/DonationDetailPage';
import ClaimDetailPage    from './pages/ClaimDetailPage';
import VerifyOtpPage from './pages/VerifyOtpPage';
import PrivacyPage   from './pages/PrivacyPage';
import NotFoundPage  from './pages/NotFoundPage';

// Layout
import Navbar   from './components/shared/Navbar';
import Footer   from './components/shared/Footer';

// Guards
const RequireAuth = ({ role, children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="loading-screen">Loading…</div>;
  if (!user)   return <Navigate to="/login" replace />;
  if (role && user.role !== role && user.role !== 'admin') {
    return <Navigate to="/" replace />;
  }
  return children;
};

export default function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <main>
        <Routes>
          {/* Public */}
          <Route path="/"            element={<HomePage />} />
          <Route path="/login"       element={<LoginPage />} />
          <Route path="/register"    element={<RegisterPage />} />
          <Route path="/verify-otp"  element={
            <RequireAuth>
              <VerifyOtpPage />
            </RequireAuth>
          } />
          <Route path="/impact"      element={<ImpactPage />} />
          <Route path="/browse"      element={<BrowsePage />} />
          <Route path="/donations/:id"    element={<DonationDetailPage />} />
          <Route path="/privacy"     element={<PrivacyPage />} />

          {/* Donor */}
          <Route path="/donor/*" element={
            <RequireAuth role="donor">
              <DonorDashboard />
            </RequireAuth>
          } />

          {/* Receiver */}
          <Route path="/receiver/*" element={
            <RequireAuth role="receiver">
              <ReceiverDashboard />
            </RequireAuth>
          } />
          <Route path="/claims/:id" element={
            <RequireAuth>
              <ClaimDetailPage />
            </RequireAuth>
          } />

          {/* Admin */}
          <Route path="/admin/*" element={
            <RequireAuth role="admin">
              <AdminDashboard />
            </RequireAuth>
          } />

          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>
      <Footer />
    </BrowserRouter>
  );
}
