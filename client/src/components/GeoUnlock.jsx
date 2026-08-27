import { useState } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';

/**
 * GeoUnlock
 * 
 * Displayed on the ViewCapsule page for geo-locked capsules.
 * When the user clicks "Check My Location", it gets their GPS
 * coordinates and sends them to the server for verification.
 */

function GeoUnlock({ capsuleId, onUnlock }) {
  const [checking, setChecking] = useState(false);
  const [result, setResult] = useState(null);

  async function checkLocation() {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser');
      return;
    }

    setChecking(true);
    setResult(null);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { data } = await api.post(`/capsules/${capsuleId}/geo-check`, {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });

          const geoResult = data.data.geoCheck;
          setResult(geoResult);

          if (geoResult.unlocked) {
            toast.success('Capsule unlocked! 🔓');
            if (onUnlock) onUnlock();
          }
        } catch (error) {
          toast.error(error.response?.data?.message || 'Failed to check location');
        } finally {
          setChecking(false);
        }
      },
      () => {
        toast.error('Could not get your location. Please allow location access.');
        setChecking(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }

  return (
    <div style={{
      background: 'rgba(251, 191, 36, 0.06)',
      border: '1px solid rgba(251, 191, 36, 0.15)',
      borderRadius: 'var(--radius-md)',
      padding: '1.5rem',
      textAlign: 'center',
      marginTop: '1rem',
    }}>
      <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📍</div>
      <h3 style={{ color: 'var(--accent-amber)', fontSize: '1rem', marginBottom: '0.5rem' }}>
        Geo-Locked Capsule
      </h3>
      <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1rem' }}>
        This capsule can only be opened at a specific location.
        Check if you're close enough to unlock it.
      </p>

      <button
        onClick={checkLocation}
        disabled={checking}
        className="btn btn-primary"
        style={{ fontSize: '0.9rem' }}
      >
        {checking ? 'Checking location...' : '📍 Check My Location'}
      </button>

      {result && (
        <div style={{
          marginTop: '1rem',
          padding: '1rem',
          borderRadius: 'var(--radius-sm)',
          background: result.withinRange
            ? 'rgba(74, 222, 128, 0.08)'
            : 'rgba(248, 113, 113, 0.08)',
          border: `1px solid ${result.withinRange
            ? 'rgba(74, 222, 128, 0.2)'
            : 'rgba(248, 113, 113, 0.2)'}`,
        }}>
          <p style={{
            fontSize: '0.9rem',
            color: result.withinRange ? 'var(--accent-green)' : 'var(--accent-red)',
            fontWeight: 500,
          }}>
            {result.message}
          </p>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.3rem' }}>
            Distance: {result.distance}m · Required: within {result.required}m
          </p>
        </div>
      )}
    </div>
  );
}

export default GeoUnlock;
