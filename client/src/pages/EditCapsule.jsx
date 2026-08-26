import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import capsuleService from '../services/capsuleService';
import Navbar from '../components/Navbar';
import toast from 'react-hot-toast';

/**
 * Edit Capsule Page
 * 
 * Loads the existing capsule data and pre-fills the form.
 * Only LOCKED capsules can be edited — once unlocked, they're sealed forever.
 * If someone tries to access this page for an unlocked capsule,
 * they get redirected to the view page.
 */

function EditCapsule() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    unlockAt: '',
    isPublic: false,
  });

  useEffect(() => {
    fetchCapsule();
  }, [id]);

  async function fetchCapsule() {
    try {
      const response = await capsuleService.getCapsule(id);
      const capsule = response.data.capsule;

      // Only locked capsules can be edited
      if (capsule.status !== 'LOCKED') {
        toast.error('Cannot edit a capsule that has already been opened');
        navigate(`/capsule/${id}`);
        return;
      }

      // Convert ISO date to datetime-local format for the input
      const unlockDate = new Date(capsule.unlockAt);
      const localDateTime = unlockDate.toISOString().slice(0, 16);

      setFormData({
        title: capsule.title || '',
        content: capsule.content || '',
        unlockAt: localDateTime,
        isPublic: capsule.isPublic || false,
      });
    } catch (error) {
      toast.error('Capsule not found');
      navigate('/dashboard');
    } finally {
      setFetching(false);
    }
  }

  function handleChange(e) {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  }

  function getMinDate() {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().slice(0, 16);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setIsLoading(true);

    try {
      const unlockDate = new Date(formData.unlockAt).toISOString();

      await capsuleService.updateCapsule(id, {
        title: formData.title,
        content: formData.content,
        unlockAt: unlockDate,
        isPublic: formData.isPublic,
      });

      toast.success('Capsule updated successfully! ✏️');
      navigate(`/capsule/${id}`);
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to update capsule';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  }

  if (fetching) {
    return (
      <div style={{ background: 'var(--bg-primary)', minHeight: '100vh' }}>
        <Navbar />
        <div className="loading-page">
          <div className="spinner" />
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: 'var(--bg-primary)', minHeight: '100vh' }}>
      <Navbar />

      <div className="container page">
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
          {/* Header */}
          <div style={{ marginBottom: '2rem' }}>
            <h1 style={{ fontSize: '1.8rem', fontWeight: 700, marginBottom: '0.25rem' }}>
              ✏️ Edit Capsule
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              Modify your capsule before it gets sealed forever.
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
                placeholder="Write a message to your future self..."
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
                  style={{ width: '18px', height: '18px', accentColor: 'var(--accent-purple)' }}
                />
                Make this capsule public
              </label>
            </div>

            {/* Buttons */}
            <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => navigate(`/capsule/${id}`)}
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
                    Saving...
                  </>
                ) : (
                  '💾 Save Changes'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default EditCapsule;
