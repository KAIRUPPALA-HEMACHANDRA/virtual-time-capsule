import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import CreateCapsule from './pages/CreateCapsule';
import ViewCapsule from './pages/ViewCapsule';

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
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected Routes — require authentication */}
          <Route path="/dashboard" element={
            <ProtectedRoute><Dashboard /></ProtectedRoute>
          } />
          <Route path="/capsule/new" element={
            <ProtectedRoute><CreateCapsule /></ProtectedRoute>
          } />
          <Route path="/capsule/:id" element={
            <ProtectedRoute><ViewCapsule /></ProtectedRoute>
          } />

          {/* Redirect root to dashboard (or login if not authenticated) */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />

          {/* Catch-all: redirect unknown routes */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
