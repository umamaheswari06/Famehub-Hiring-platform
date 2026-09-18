import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Briefcase, BarChart3, User, LogOut,
  GitPullRequest, FileSpreadsheet, Video, Bell, Code, ClipboardCheck,
  Shield, Zap, ChevronRight, Power, Menu, X as XIcon
} from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

import Welcome from './pages/Welcome';
import Login from './pages/Login';
import Register from './pages/Register';
import CandidateDashboard from './pages/candidate/CandidateDashboard';
import JobSearch from './pages/candidate/JobSearch';
import CandidateProfile from './pages/candidate/CandidateProfile';
import McqRunner from './pages/candidate/McqRunner';
import CodingEditor from './pages/candidate/CodingEditor';
import InterviewRoom from './pages/candidate/InterviewRoom';
import HrDashboard from './pages/hr/HrDashboard';
import JobManagement from './pages/hr/JobManagement';
import PipelineBoard from './pages/hr/PipelineBoard';
import AssessmentManagement from './pages/hr/AssessmentManagement';
import InterviewManagement from './pages/hr/InterviewManagement';
import AdminDashboard from './pages/admin/AdminDashboard';
import UserManagement from './pages/admin/UserManagement';

import PageWrapper from './components/ui/PageWrapper';

// ── Auth Guard ─────────────────────────────────────────────
const ProtectedRoute = ({ children, allowedRoles }) => {
  const token = localStorage.getItem('accessToken');
  const userString = localStorage.getItem('user');

  if (!token || !userString) return <Navigate to="/login" replace />;

  const user = JSON.parse(userString);
  const hasAccess = user.roles.some(role => allowedRoles.includes(role));

  if (!hasAccess) {
    if (user.roles.includes('ROLE_ADMIN')) return <Navigate to="/admin/dashboard" replace />;
    if (user.roles.includes('ROLE_HR')) return <Navigate to="/hr/dashboard" replace />;
    return <Navigate to="/candidate/dashboard" replace />;
  }

  return children;
};

// ── Main Layout ────────────────────────────────────────────
const MainLayout = ({ children, sidebarItems }) => {
  const [showNotif, setShowNotif] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => { setSidebarOpen(false); }, [location.pathname]);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  const roleConfig = {
    ADMIN:     { color: { background: 'var(--primary)', color: '#fff' }, icon: <Shield size={10} />, label: 'Admin' },
    HR:        { color: { background: 'var(--accent)', color: '#fff' }, icon: <Zap size={10} />, label: 'Recruiter' },
    CANDIDATE: { color: { background: 'var(--surface)', color: 'var(--primary)' }, icon: <User size={10} />, label: 'Candidate' },
  };
  const role = user.roles?.[0]?.replace('ROLE_', '') || 'CANDIDATE';
  const cfg = roleConfig[role] || roleConfig.CANDIDATE;

  const SidebarContent = () => (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'space-between', padding: '1.5rem' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div className="sidebar-logo-mark">F</div>
          <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-dark)' }}>
            Fame<span style={{ color: 'var(--accent)' }}>hub</span>
          </span>
          {/* Close on mobile */}
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden"
            style={{
              marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer',
              color: 'var(--text-muted)', padding: '0.25rem', display: 'flex', alignItems: 'center',
            }}
          >
            <XIcon size={18} />
          </button>
        </div>

        {/* Nav Links */}
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
          {sidebarItems.map((item, idx) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={idx}
                to={item.path}
                className="sidebar-nav-item"
                style={{
                  background: isActive ? 'var(--primary)' : undefined,
                  color: isActive ? '#fff' : undefined,
                  boxShadow: isActive ? '0 4px 12px rgba(26, 60, 110, 0.25)' : 'none',
                }}
              >
                <span style={{ color: isActive ? '#fff' : 'var(--text-muted)', transition: 'color 150ms' }}>
                  {item.icon}
                </span>
                <span style={{ flex: 1 }}>{item.label}</span>
                {isActive && <ChevronRight size={14} style={{ color: 'rgba(255,255,255,0.6)' }} />}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Identity Card */}
      <div style={{
        borderRadius: 'var(--radius-lg)', border: '1.5px solid var(--border)',
        background: 'var(--off-white)', padding: '1rem',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
          <div style={{ position: 'relative', flexShrink: 0 }}>
            <div style={{
              width: 38, height: 38, borderRadius: '50%',
              background: 'rgba(26,60,110,0.1)', display: 'flex', alignItems: 'center',
              justifyContent: 'center', fontWeight: 700, color: 'var(--primary)',
              fontSize: '0.95rem', border: '1.5px solid rgba(26,60,110,0.15)',
            }}>
              {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <span style={{
              position: 'absolute', bottom: -1, right: -1,
              width: 10, height: 10, borderRadius: '50%',
              background: '#22c55e', border: '2px solid #fff',
            }} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.85rem', color: 'var(--text-dark)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', margin: 0 }}>
              {user.name || 'User'}
            </p>
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: 4,
              fontSize: '0.68rem', fontWeight: 700, padding: '1px 6px',
              borderRadius: '4px', marginTop: 2, ...cfg.color,
            }}>
              {cfg.icon} {cfg.label}
            </span>
          </div>
        </div>

        <div style={{ height: 1, background: 'var(--border)', marginBottom: '0.75rem' }} />

        <button
          onClick={handleLogout}
          style={{
            width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center',
            gap: '0.5rem', padding: '0.5rem 0.75rem', borderRadius: 'var(--radius-md)',
            background: '#fff', border: '1.5px solid var(--border)', cursor: 'pointer',
            color: 'var(--text-body)', fontWeight: 600, fontSize: '0.8rem',
            transition: 'all 150ms ease', fontFamily: 'var(--font-body)',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = '#fef2f2'; e.currentTarget.style.borderColor = '#fca5a5'; e.currentTarget.style.color = '#dc2626'; }}
          onMouseLeave={e => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-body)'; }}
        >
          <Power size={13} />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );

  return (
    <div style={{
      display: 'flex', height: '100vh', overflow: 'hidden',
      background: 'var(--off-white)', color: 'var(--text-body)', fontFamily: 'var(--font-body)',
    }}>
      {/* Mobile overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(false)}
            style={{
              position: 'fixed', inset: 0, zIndex: 40,
              background: 'rgba(13,27,54,0.4)', backdropFilter: 'blur(4px)',
            }}
            className="lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex sidebar-th" style={{ width: '256px', flexDirection: 'column', zIndex: 30 }}>
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar Drawer */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.aside
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="sidebar-th lg:hidden"
            style={{
              position: 'fixed', inset: '0 auto 0 0', zIndex: 50,
              width: '280px', flexDirection: 'column', display: 'flex',
              boxShadow: 'var(--shadow-xl)',
            }}
          >
            <SidebarContent />
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>
        {/* Header */}
        <header style={{
          height: '64px', borderBottom: '1px solid var(--border)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0 1.5rem', gap: '0.75rem', background: '#fff', zIndex: 20,
          flexShrink: 0, boxShadow: 'var(--shadow-sm)',
        }}>
          {/* Hamburger — mobile */}
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden"
            aria-label="Open menu"
            style={{
              padding: '0.5rem', borderRadius: 'var(--radius-md)',
              background: 'var(--surface)', border: 'none', cursor: 'pointer',
              color: 'var(--text-body)', display: 'flex', alignItems: 'center',
            }}
          >
            <Menu size={18} />
          </button>

          {/* Logo — mobile */}
          <div className="lg:hidden" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div className="sidebar-logo-mark" style={{ width: 30, height: 30, fontSize: '0.85rem' }}>F</div>
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-dark)' }}>
              Fame<span style={{ color: 'var(--accent)' }}>hub</span>
            </span>
          </div>

          {/* Right controls */}
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            {/* Notification */}
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setShowNotif(!showNotif)}
                style={{
                  width: 38, height: 38, borderRadius: '50%',
                  background: 'var(--surface)', border: 'none', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'var(--text-body)', position: 'relative', transition: 'background 150ms',
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--border)'}
                onMouseLeave={e => e.currentTarget.style.background = 'var(--surface)'}
              >
                <Bell size={17} />
                <span style={{
                  position: 'absolute', top: 8, right: 8,
                  width: 8, height: 8, borderRadius: '50%',
                  background: 'var(--accent)', border: '2px solid #fff',
                }} />
              </button>

              {showNotif && (
                <div style={{
                  position: 'absolute', right: 0, top: '110%',
                  width: '320px', borderRadius: 'var(--radius-lg)',
                  border: '1.5px solid var(--border)', background: '#fff',
                  boxShadow: 'var(--shadow-xl)', padding: '1rem', zIndex: 30,
                }}>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-dark)', borderBottom: '1px solid var(--border)', paddingBottom: '0.75rem', marginBottom: '0.75rem' }}>
                    Notifications
                  </div>
                  <div style={{ padding: '0.75rem', background: 'var(--surface)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
                    <span style={{ display: 'block', fontWeight: 700, color: 'var(--primary)', marginBottom: '0.25rem', fontSize: '0.85rem' }}>
                      Welcome to Famehub 🎉
                    </span>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      Complete your profile to apply for active openings.
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* User avatar */}
            <div style={{
              width: 36, height: 36, borderRadius: '50%',
              background: 'rgba(26,60,110,0.1)', display: 'flex', alignItems: 'center',
              justifyContent: 'center', fontFamily: 'var(--font-display)', fontWeight: 700,
              fontSize: '0.85rem', color: 'var(--primary)', border: '1.5px solid rgba(26,60,110,0.15)',
              cursor: 'default',
            }}>
              {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
          </div>
        </header>

        {/* Content */}
        <main style={{ flex: 1, overflowY: 'auto', padding: '1.5rem 2rem', background: 'var(--off-white)' }}>
          {children}
        </main>
      </div>
    </div>
  );
};

// ── Animated Routes ────────────────────────────────────────
function AnimatedRoutes() {
  const location = useLocation();

  const candidateSidebar = [
    { label: 'Overview',   path: '/candidate/dashboard', icon: <LayoutDashboard size={16} /> },
    { label: 'Job Search', path: '/candidate/jobs',      icon: <Briefcase size={16} /> },
    { label: 'My Profile', path: '/candidate/profile',   icon: <User size={16} /> },
  ];

  const hrSidebar = [
    { label: 'Dashboard',          path: '/hr/dashboard',    icon: <LayoutDashboard size={16} /> },
    { label: 'Job Openings',       path: '/hr/jobs',         icon: <Briefcase size={16} /> },
    { label: 'Pipeline Board',     path: '/hr/pipeline',     icon: <GitPullRequest size={16} /> },
    { label: 'Assessments Builder',path: '/hr/assessments',  icon: <FileSpreadsheet size={16} /> },
    { label: 'Interview Room',     path: '/hr/interviews',   icon: <Video size={16} /> },
  ];

  const adminSidebar = [
    { label: 'Admin Panel',     path: '/admin/dashboard', icon: <LayoutDashboard size={16} /> },
    { label: 'Users Management',path: '/admin/users',     icon: <User size={16} /> },
  ];

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {/* Public */}
        <Route path="/"        element={<PageWrapper><Welcome /></PageWrapper>} />
        <Route path="/login"   element={<PageWrapper><Login /></PageWrapper>} />
        <Route path="/register"element={<PageWrapper><Register /></PageWrapper>} />

        {/* Candidate */}
        <Route path="/candidate/*" element={
          <ProtectedRoute allowedRoles={['ROLE_CANDIDATE']}>
            <MainLayout sidebarItems={candidateSidebar}>
              <AnimatePresence mode="wait">
                <Routes location={location} key={location.pathname}>
                  <Route path="dashboard"           element={<PageWrapper><CandidateDashboard /></PageWrapper>} />
                  <Route path="jobs"                element={<PageWrapper><JobSearch /></PageWrapper>} />
                  <Route path="profile"             element={<PageWrapper><CandidateProfile /></PageWrapper>} />
                  <Route path="assessment/:id"      element={<PageWrapper><McqRunner /></PageWrapper>} />
                  <Route path="coding/:id"          element={<PageWrapper><CodingEditor /></PageWrapper>} />
                  <Route path="interview/:roomName" element={<PageWrapper><InterviewRoom /></PageWrapper>} />
                </Routes>
              </AnimatePresence>
            </MainLayout>
          </ProtectedRoute>
        } />

        {/* HR */}
        <Route path="/hr/*" element={
          <ProtectedRoute allowedRoles={['ROLE_HR']}>
            <MainLayout sidebarItems={hrSidebar}>
              <AnimatePresence mode="wait">
                <Routes location={location} key={location.pathname}>
                  <Route path="dashboard"                element={<PageWrapper><HrDashboard /></PageWrapper>} />
                  <Route path="jobs"                     element={<PageWrapper><JobManagement /></PageWrapper>} />
                  <Route path="pipeline"                 element={<PageWrapper><PipelineBoard /></PageWrapper>} />
                  <Route path="assessments"              element={<PageWrapper><AssessmentManagement /></PageWrapper>} />
                  <Route path="coding/:id"               element={<PageWrapper><CodingEditor /></PageWrapper>} />
                  <Route path="interviews"               element={<PageWrapper><InterviewManagement /></PageWrapper>} />
                  <Route path="interviews/room/:roomName"element={<PageWrapper><InterviewRoom /></PageWrapper>} />
                </Routes>
              </AnimatePresence>
            </MainLayout>
          </ProtectedRoute>
        } />

        {/* Admin */}
        <Route path="/admin/*" element={
          <ProtectedRoute allowedRoles={['ROLE_ADMIN']}>
            <MainLayout sidebarItems={adminSidebar}>
              <AnimatePresence mode="wait">
                <Routes location={location} key={location.pathname}>
                  <Route path="dashboard" element={<PageWrapper><AdminDashboard /></PageWrapper>} />
                  <Route path="users"     element={<PageWrapper><UserManagement /></PageWrapper>} />
                </Routes>
              </AnimatePresence>
            </MainLayout>
          </ProtectedRoute>
        } />

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AnimatePresence>
  );
}

export default function App() {
  return (
    <Router>
      <AnimatedRoutes />
    </Router>
  );
}
