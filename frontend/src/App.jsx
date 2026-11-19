import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { ErrorBoundary } from './components/ErrorBoundary';

// Public Pages
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { BookOpdPage } from './pages/BookOpdPage';
import { DoctorDetailPage } from './pages/DoctorDetailPage';
import { HospitalsListPage } from './pages/HospitalsListPage';
import { HospitalDetailPage } from './pages/HospitalDetailPage';
import { ClinicsListPage } from './pages/ClinicsListPage';
import { ClinicDetailPage } from './pages/ClinicDetailPage';
import { PharmacySearchPage } from './pages/PharmacySearchPage';
import { OffersPage } from './pages/OffersPage';

// Dashboards
import { PatientDashboard } from './pages/patient/PatientDashboard';
import { PatientPortalPage } from './pages/patient/PatientPortalPage';
import { HospitalDashboard } from './pages/hospital/HospitalDashboard';
import { ClinicDashboard } from './pages/clinic/ClinicDashboard';
import { DoctorDashboard } from './pages/doctor/DoctorDashboard';
import { PharmacyDashboard } from './pages/pharmacy/PharmacyDashboard';
import { SuperAdminRouter } from './pages/admin/SuperAdminRouter';

// Role Protected Route Component
const ProtectedDashboardLayout = ({ requiredRole, children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();
  const [mobileSidebarOpen, setMobileSidebarOpen] = React.useState(false);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <p className="text-xs text-slate-500 font-semibold animate-pulse">Authenticating...</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Super Admin can inspect any dashboard
  if (user.role !== requiredRole && user.role !== 'super_admin') {
    // Redirect to user's assigned dashboard
    const map = {
      patient: '/dashboard/patient',
      hospital: '/dashboard/hospital',
      clinic: '/dashboard/clinic',
      doctor: '/dashboard/doctor',
      pharmacy: '/dashboard/pharmacy',
      super_admin: '/dashboard/admin'
    };
    return <Navigate to={map[user.role] || '/'} replace />;
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar
        role={requiredRole}
        isOpen={mobileSidebarOpen}
        onClose={() => setMobileSidebarOpen(false)}
      />
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar onToggleSidebar={() => setMobileSidebarOpen(!mobileSidebarOpen)} />
        <main className="flex-1 overflow-y-auto bg-slate-50 text-slate-900">
          <ErrorBoundary level="page" title={`${requiredRole.replace('_', ' ').toUpperCase()} Dashboard Module Unavailable`}>
            {children}
          </ErrorBoundary>
        </main>
      </div>
    </div>
  );
};

// Public Layout
const PublicLayout = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />
      <main className="flex-1">
        <ErrorBoundary level="page" title="Page Section Unavailable">
          {children}
        </ErrorBoundary>
      </main>
      <footer className="bg-slate-900 text-slate-400 py-8 px-4 text-center text-xs border-t border-slate-800">
        <div className="max-w-7xl mx-auto space-y-2">
          <p className="font-extrabold text-white text-sm">AllConnect Healthcare Ecosystem</p>
          <p className="text-slate-500">Centralized Multi-Hospital Federation & Patient EHR Mesh • Hyderabad, Telangana</p>
          <p className="text-[11px] text-slate-600">Enterprise SaaS Architecture & Healthcare Marketplace Prototype</p>
        </div>
      </footer>
    </div>
  );
};

export default function App() {
  return (
    <ErrorBoundary level="app" title="AllConnect Application Status">
      <AuthProvider>
        <Router>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<PublicLayout><LandingPage /></PublicLayout>} />
            <Route path="/book-opd" element={<PublicLayout><BookOpdPage /></PublicLayout>} />
            <Route path="/doctors/:id" element={<PublicLayout><DoctorDetailPage /></PublicLayout>} />
            <Route path="/profile" element={<PublicLayout><PatientPortalPage /></PublicLayout>} />
            <Route path="/profile/*" element={<PublicLayout><PatientPortalPage /></PublicLayout>} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/hospitals" element={<PublicLayout><HospitalsListPage /></PublicLayout>} />
            <Route path="/hospitals/:id" element={<PublicLayout><HospitalDetailPage /></PublicLayout>} />
            <Route path="/clinics" element={<PublicLayout><ClinicsListPage /></PublicLayout>} />
            <Route path="/clinics/:id" element={<PublicLayout><ClinicDetailPage /></PublicLayout>} />
            <Route path="/pharmacy-search" element={<PublicLayout><PharmacySearchPage /></PublicLayout>} />
            <Route path="/offers" element={<PublicLayout><OffersPage /></PublicLayout>} />

            {/* Patient Consumer Portal (Simple, Modern, Public-Style Web Experience) */}
            <Route
              path="/dashboard/patient/*"
              element={
                <PublicLayout>
                  <PatientPortalPage />
                </PublicLayout>
              }
            />
            <Route
              path="/dashboard/patient"
              element={
                <PublicLayout>
                  <PatientPortalPage />
                </PublicLayout>
              }
            />

            {/* Provider Administrative Dashboards */}
            <Route
              path="/dashboard/hospital/*"
              element={
                <ProtectedDashboardLayout requiredRole="hospital">
                  <HospitalDashboard />
                </ProtectedDashboardLayout>
              }
            />
            <Route
              path="/dashboard/clinic/*"
              element={
                <ProtectedDashboardLayout requiredRole="clinic">
                  <ClinicDashboard />
                </ProtectedDashboardLayout>
              }
            />
            <Route
              path="/dashboard/doctor/*"
              element={
                <ProtectedDashboardLayout requiredRole="doctor">
                  <DoctorDashboard />
                </ProtectedDashboardLayout>
              }
            />
            <Route
              path="/dashboard/pharmacy/*"
              element={
                <ProtectedDashboardLayout requiredRole="pharmacy">
                  <PharmacyDashboard />
                </ProtectedDashboardLayout>
              }
            />
            <Route
              path="/dashboard/admin/*"
              element={
                <ProtectedDashboardLayout requiredRole="super_admin">
                  <SuperAdminRouter />
                </ProtectedDashboardLayout>
              }
            />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ErrorBoundary>
  );
}
