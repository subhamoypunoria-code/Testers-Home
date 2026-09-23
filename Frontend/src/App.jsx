import { BrowserRouter, Navigate, useLocation, useRoutes } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Toaster } from 'react-hot-toast';
import { useEffect, useState } from 'react';

import useAuthStore from './store/authStore';
import useNotificationStore from './store/notificationStore';

import PageLoader from './components/animation/PageLoader';
import LandingPage from './pages/landing/LandingPage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';
import ResetPasswordPage from './pages/auth/ResetPasswordPage';
import DashboardPage from './pages/dashboard/DashboardPage';
import ProjectsPage from './pages/projects/ProjectsPage';
import DefectsPage from './pages/defects/DefectsPage';
import DefectDetailPage from './pages/defects/DefectDetailPage';
import TrashPage from './pages/defects/TrashPage';
import AnalyticsPage from './pages/analytics/AnalyticsPage';
import NotificationsPage from './pages/settings/NotificationsPage';
import SettingsPage from './pages/settings/SettingsPage';
import TeamPage from './pages/projects/TeamPage';

const PrivateRoute = ({ children }) => {
  const { token } = useAuthStore();
  return token ? children : <Navigate to="/login" replace />;
};

const PublicRoute = ({ children }) => {
  const { token } = useAuthStore();
  return token ? <Navigate to="/dashboard" replace /> : children;
};

const routeElements = [
  { path: '/', element: <LandingPage /> },
  { path: '/login', element: <PublicRoute><LoginPage /></PublicRoute> },
  { path: '/register', element: <PublicRoute><RegisterPage /></PublicRoute> },
  { path: '/forgot-password', element: <PublicRoute><ForgotPasswordPage /></PublicRoute> },
  { path: '/reset-password/:token', element: <PublicRoute><ResetPasswordPage /></PublicRoute> },
  { path: '/dashboard', element: <PrivateRoute><DashboardPage /></PrivateRoute> },
  { path: '/projects', element: <PrivateRoute><ProjectsPage /></PrivateRoute> },
  { path: '/projects/:projectId/defects', element: <PrivateRoute><DefectsPage /></PrivateRoute> },
  { path: '/projects/:projectId/defects/:id', element: <PrivateRoute><DefectDetailPage /></PrivateRoute> },
  { path: '/projects/:projectId/analytics', element: <PrivateRoute><AnalyticsPage /></PrivateRoute> },
  { path: '/projects/:projectId/team', element: <PrivateRoute><TeamPage /></PrivateRoute> },
  { path: '/projects/:projectId/trash', element: <PrivateRoute><TrashPage /></PrivateRoute> },
  { path: '/notifications', element: <PrivateRoute><NotificationsPage /></PrivateRoute> },
  { path: '/settings', element: <PrivateRoute><SettingsPage /></PrivateRoute> },
  { path: '*', element: <Navigate to="/" replace /> },
];

const pageTransition = {
  initial: { opacity: 0, scale: 0.98 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.98 },
};

const AnimatedRoutes = () => {
  const location = useLocation();
  const element = useRoutes(routeElements, location);

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        variants={pageTransition}
        initial="initial"
        animate="animate"
        exit="exit"
        transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
        style={{ minHeight: 'inherit' }}
      >
        {element}
      </motion.div>
    </AnimatePresence>
  );
};

const App = () => {
  const { token } = useAuthStore();
  const { fetchNotifications } = useNotificationStore();
  const [booting, setBooting] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setBooting(false), 900);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (token) fetchNotifications();
  }, [token, fetchNotifications]);

  if (booting) return <PageLoader isLoading />;

  return (
    <BrowserRouter>
      <Toaster
        position="bottom-right"
        toastOptions={{
          style: { background: '#0e0e1a', border: '1px solid #2e2e40', color: '#e5e7eb', fontSize: '13px' },
          success: { iconTheme: { primary: '#10b981', secondary: '#0e0e1a' } },
          error: { iconTheme: { primary: '#ef4444', secondary: '#0e0e1a' } },
          loading: { iconTheme: { primary: '#f59e0b', secondary: '#0e0e1a' } },
        }}
      />
      <AnimatedRoutes />
    </BrowserRouter>
  );
};

export default App;
