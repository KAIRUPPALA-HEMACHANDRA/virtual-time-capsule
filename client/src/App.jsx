import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import CreateCapsule from './pages/CreateCapsule';
import ViewCapsule from './pages/ViewCapsule';
import EditCapsule from './pages/EditCapsule';

/**
 * Smart Root Redirect
 * 
 * If the user is logged in → go to dashboard
 * If not logged in → show the landing page
 */
function RootRedirect() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="loading-page">
        <div className="spinner" />
      </div>
    );
  }

  return isAuthenticated ? <Navigate to="/dashboard" replace /> : <Landing />;
}

function App() {
  return (
    <Router>
      <AuthProvider>
        {/* Toast notifications */}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#1a1a2e',
              color: '#e0e0e0',
              border: '1px solid #2a2a4a',
            },
            success: {
              iconTheme: { primary: '#4ade80', secondary: '#1a1a2e' },
            },
            error: {
              iconTheme: { primary: '#f87171', secondary: '#1a1a2e' },
            },
          }}
        />

        <Routes>
          {/* Root — landing page or dashboard */}
          <Route path="/" element={<RootRedirect />} />

          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected Routes */}
          <Route path="/dashboard" element={
            <ProtectedRoute><Dashboard /></ProtectedRoute>
          } />
          <Route path="/capsule/new" element={
            <ProtectedRoute><CreateCapsule /></ProtectedRoute>
          } />
          <Route path="/capsule/:id" element={
            <ProtectedRoute><ViewCapsule /></ProtectedRoute>
          } />
          <Route path="/capsule/:id/edit" element={
            <ProtectedRoute><EditCapsule /></ProtectedRoute>
          } />

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
