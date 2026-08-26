import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import capsuleService from '../services/capsuleService';
import Navbar from '../components/Navbar';
import toast from 'react-hot-toast';

function CreateCapsule() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    unlockAt: '',
    isPublic: false,
  });

  function handleChange(e) {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  }

  // Calculate minimum date (tomorrow)
  function getMinDate() {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().slice(0, 16); // Format: YYYY-MM-DDTHH:MM
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Convert local datetime to ISO string
      const unlockDate = new Date(formData.unlockAt).toISOString();

      await capsuleService.createCapsule({
        title: formData.title,
        content: formData.content,
        unlockAt: unlockDate,
        isPublic: formData.isPublic,
      });

      toast.success('Time capsule created and sealed! 🔒');
      navigate('/dashboard');
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to create capsule';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div style={{ background: 'var(--bg-primary)', minHeight: '100vh' }}>
      <Navbar />

      <div className="container page">
        <div style={{
          maxWidth: '600px',
          margin: '0 auto',
        }}>
          {/* Header */}
          <div style={{ marginBottom: '2rem' }}>
            <h1 style={{ fontSize: '1.8rem', fontWeight: 700, marginBottom: '0.25rem' }}>
              🕰️ Create a Time Capsule
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              Write a message, pick a future date, and seal it away.
            </p>
          </div>

          {/* Form Card */}
          <form
            onSubmit={handleSubmit}
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-lg)',
              padding: '2rem',
            }}
          >
            <div className="form-group">
              <label className="form-label">Title</label>
              <input
                type="text"
                name="title"
                className="form-input"
                placeholder="What's this capsule about?"
                value={formData.title}
                onChange={handleChange}
                required
                maxLength={200}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Message</label>
              <textarea
                name="content"
                className="form-input"
                placeholder="Write a message to your future self, a friend, or the world..."
                value={formData.content}
                onChange={handleChange}
                rows={6}
                maxLength={10000}
              />
              <p style={{
                fontSize: '0.75rem',
                color: 'var(--text-muted)',
                textAlign: 'right',
                marginTop: '0.3rem',
              }}>
                {formData.content.length} / 10,000
              </p>
            </div>

            <div className="form-group">
              <label className="form-label">Unlock Date & Time</label>
              <input
                type="datetime-local"
                name="unlockAt"
                className="form-input"
                value={formData.unlockAt}
                onChange={handleChange}
                min={getMinDate()}
                required
                style={{ colorScheme: 'dark' }}
              />
              <p style={{
                fontSize: '0.75rem',
                color: 'var(--text-muted)',
                marginTop: '0.3rem',
              }}>
                The capsule will be sealed until this date. Nobody can read it before then.
              </p>
            </div>

            <div className="form-group">
              <label style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.6rem',
                cursor: 'pointer',
                fontSize: '0.9rem',
                color: 'var(--text-secondary)',
              }}>
                <input
                  type="checkbox"
                  name="isPublic"
                  checked={formData.isPublic}
                  onChange={handleChange}
                  style={{
                    width: '18px',
                    height: '18px',
                    accentColor: 'var(--accent-purple)',
                  }}
                />
                Make this capsule public (visible on the public wall after it opens)
              </label>
            </div>

            {/* Buttons */}
            <div style={{
              display: 'flex',
              gap: '1rem',
              marginTop: '1.5rem',
            }}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => navigate('/dashboard')}
                style={{ flex: 1 }}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={isLoading}
                style={{ flex: 2 }}
              >
                {isLoading ? (
                  <>
                    <div className="spinner" style={{ width: '18px', height: '18px', borderWidth: '2px' }} />
                    Sealing...
                  </>
                ) : (
                  '🔒 Seal Capsule'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default CreateCapsule;
