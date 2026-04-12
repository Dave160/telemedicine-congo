import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import useAuthStore from './stores/authStore';
import LoadingScreen from './components/common/LoadingScreen';
import Layout from './components/common/Layout';

// Auth
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import VerifyOTP from './pages/auth/VerifyOTP';

// Shared
import Profile from './pages/Profile';
import Notifications from './pages/Notifications';
import Chat from './pages/Chat';
import { ArticlesList, ArticleDetail } from './pages/Articles';
import Conversations from './pages/Conversations';

// Patient
import PatientDashboard from './pages/patient/Dashboard';
import Doctors from './pages/patient/Doctors';
import DoctorProfile from './pages/patient/DoctorProfile';
import DoctorsBySpecialty from './pages/patient/DoctorsBySpecialty';
import BookAppointment from './pages/patient/BookAppointment';
import PatientAppointments from './pages/patient/Appointments';
import Prescriptions from './pages/patient/Prescriptions';
import MedicalRecord from './pages/patient/MedicalRecord';
import Analyses from './pages/patient/Analyses';

// Doctor
import DoctorDashboard from './pages/doctor/Dashboard';
import DoctorAppointments from './pages/doctor/Appointments';
import AppointmentDetail from './pages/doctor/AppointmentDetail';
import DoctorAvailabilities from './pages/doctor/Availabilities';
import DoctorSubscription from './pages/doctor/Subscription';
import DoctorPatients from './pages/doctor/Patients';
import DoctorEarnings from './pages/doctor/Earnings';

// Admin
import AdminDashboard from './pages/admin/Dashboard';
import AdminDoctors from './pages/admin/Doctors';
import AdminArticles from './pages/admin/Articles';
import AdminUsers from './pages/admin/Users';
import AdminPayments from './pages/admin/Payments';

// ─── Protected route ──────────────────────────────────────────────────────────

function Protected({ children, roles }) {
  const { user, isAuthenticated, loading } = useAuthStore();
  if (loading) return <LoadingScreen />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user?.role)) return <Navigate to="/" replace />;
  return children;
}

function ProtectedLayout({ children, roles }) {
  return (
    <Protected roles={roles}>
      <Layout>{children}</Layout>
    </Protected>
  );
}

// ─── Role-based redirect ──────────────────────────────────────────────────────

function HomeRedirect() {
  const { user, isAuthenticated, loading } = useAuthStore();
  if (loading) return <LoadingScreen />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (user?.role === 'ADMIN') return <Navigate to="/admin/dashboard" replace />;
  if (user?.role === 'DOCTOR') return <Navigate to="/doctor/dashboard" replace />;
  return <Navigate to="/dashboard" replace />;
}

// ─── App ─────────────────────────────────────────────────────────────────────

export default function App() {
  const { init } = useAuthStore();
  useEffect(() => { init(); }, []);

  return (
    <BrowserRouter>
      <Routes>
        {/* Root redirect */}
        <Route path="/" element={<HomeRedirect />} />

        {/* Auth (public) */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/verify-otp" element={<VerifyOTP />} />

        {/* Shared */}
        <Route path="/notifications" element={<ProtectedLayout><Notifications /></ProtectedLayout>} />
        <Route path="/chat/:conversationId" element={<Protected><Chat /></Protected>} />
        <Route path="/conversations" element={<ProtectedLayout><Conversations /></ProtectedLayout>} />
        <Route path="/profile" element={<ProtectedLayout><Profile /></ProtectedLayout>} />
        <Route path="/articles" element={<ProtectedLayout><ArticlesList /></ProtectedLayout>} />
        <Route path="/articles/:id" element={<ProtectedLayout><ArticleDetail /></ProtectedLayout>} />

        {/* Patient */}
        <Route path="/dashboard" element={<ProtectedLayout roles={['PATIENT']}><PatientDashboard /></ProtectedLayout>} />
        <Route path="/doctors" element={<ProtectedLayout roles={['PATIENT']}><Doctors /></ProtectedLayout>} />
        <Route path="/doctors/specialty/:specialite" element={<ProtectedLayout roles={['PATIENT']}><DoctorsBySpecialty /></ProtectedLayout>} />
        <Route path="/doctors/:id" element={<ProtectedLayout roles={['PATIENT']}><DoctorProfile /></ProtectedLayout>} />
        <Route path="/book/:doctorId" element={<Protected roles={['PATIENT']}><BookAppointment /></Protected>} />
        <Route path="/appointments" element={<ProtectedLayout roles={['PATIENT']}><PatientAppointments /></ProtectedLayout>} />
        <Route path="/prescriptions" element={<ProtectedLayout roles={['PATIENT']}><Prescriptions /></ProtectedLayout>} />
        <Route path="/medical-record" element={<ProtectedLayout roles={['PATIENT']}><MedicalRecord /></ProtectedLayout>} />
        <Route path="/analyses" element={<ProtectedLayout roles={['PATIENT']}><Analyses /></ProtectedLayout>} />

        {/* Doctor */}
        <Route path="/doctor/dashboard" element={<ProtectedLayout roles={['DOCTOR']}><DoctorDashboard /></ProtectedLayout>} />
        <Route path="/doctor/appointments" element={<ProtectedLayout roles={['DOCTOR']}><DoctorAppointments /></ProtectedLayout>} />
        <Route path="/appointments/:id" element={<ProtectedLayout><AppointmentDetail /></ProtectedLayout>} />
        <Route path="/doctor/patients" element={<ProtectedLayout roles={['DOCTOR']}><DoctorPatients /></ProtectedLayout>} />
        <Route path="/doctor/earnings" element={<ProtectedLayout roles={['DOCTOR']}><DoctorEarnings /></ProtectedLayout>} />
        <Route path="/doctor/availabilities" element={<ProtectedLayout roles={['DOCTOR']}><DoctorAvailabilities /></ProtectedLayout>} />
        <Route path="/doctor/subscription" element={<ProtectedLayout roles={['DOCTOR']}><DoctorSubscription /></ProtectedLayout>} />
        <Route path="/doctor/profile" element={<ProtectedLayout roles={['DOCTOR']}><Profile /></ProtectedLayout>} />

        {/* Admin */}
        <Route path="/admin/dashboard" element={<ProtectedLayout roles={['ADMIN']}><AdminDashboard /></ProtectedLayout>} />
        <Route path="/admin/doctors" element={<ProtectedLayout roles={['ADMIN']}><AdminDoctors /></ProtectedLayout>} />
        <Route path="/admin/users" element={<ProtectedLayout roles={['ADMIN']}><AdminUsers /></ProtectedLayout>} />
        <Route path="/admin/payments" element={<ProtectedLayout roles={['ADMIN']}><AdminPayments /></ProtectedLayout>} />
        <Route path="/admin/articles" element={<ProtectedLayout roles={['ADMIN']}><AdminArticles /></ProtectedLayout>} />

        {/* Catch all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
