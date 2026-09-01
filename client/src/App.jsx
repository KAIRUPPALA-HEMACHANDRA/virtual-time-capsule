import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import { SocketProvider } from './context/SocketContext';

// Pages
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import CreateCapsule from './pages/CreateCapsule';
import ViewCapsule from './pages/ViewCapsule';
import EditCapsule from './pages/EditCapsule';
import Profile from './pages/Profile';
import NotFound from './pages/NotFound';
import Verify from './pages/Verify';
import PublicWall from './pages/PublicWall';
<Route path="/wall" element={<PublicWall />} />

function RootRedirect() {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <div className="loading-page"><div className="spinner" /></div>;
  return isAuthenticated ? <Navigate to="/dashboard" replace /> : <Landing />;
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <SocketProvider>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: { background: '#1a1a2e', color: '#e0e0e0', border: '1px solid #2a2a4a' },
            success: { iconTheme: { primary: '#4ade80', secondary: '#1a1a2e' } },
            error: { iconTheme: { primary: '#f87171', secondary: '#1a1a2e' } },
          }}
        />

        <Routes>
          <Route path="/" element={<RootRedirect />} />

          {/* Public */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/verify/:id" element={<Verify />} />

          {/* Protected */}
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/capsule/new" element={<ProtectedRoute><CreateCapsule /></ProtectedRoute>} />
          <Route path="/capsule/:id" element={<ProtectedRoute><ViewCapsule /></ProtectedRoute>} />
          <Route path="/capsule/:id/edit" element={<ProtectedRoute><EditCapsule /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />

          {/* 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </SocketProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
