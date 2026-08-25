import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// Pages (we'll create these as we build features)
import Home from './pages/Home';

function App() {
  return (
    <Router>
      {/* Toast notifications - appears at top right of screen */}
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
        <Route path="/" element={<Home />} />
        {/* Future routes:
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/capsule/new" element={<CreateCapsule />} />
        <Route path="/capsule/:id" element={<ViewCapsule />} />
        */}
      </Routes>
    </Router>
  );
}

export default App;
