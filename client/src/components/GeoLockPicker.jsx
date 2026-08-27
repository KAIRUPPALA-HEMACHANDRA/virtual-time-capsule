import { useState } from 'react';

/**
 * GeoLockPicker
 * 
 * Lets users enable geo-locking and pick a location.
 * Two options:
 * 1. Use current location (browser Geolocation API)
 * 2. Enter coordinates manually
 * 
 * The radius slider lets them set how close someone must be (50-1000 meters).
 */

function GeoLockPicker({ geoData, onChange }) {
  const [locating, setLocating] = useState(false);
  const [locationName, setLocationName] = useState('');

  function handleToggle(e) {
    onChange({
      ...geoData,
      isGeoLocked: e.target.checked,
    });
  }

  function useCurrentLocation() {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser');
      return;
    }

    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        onChange({
          ...geoData,
          isGeoLocked: true,
          latitude: position.coords.latitude.toFixed(6),
          longitude: position.coords.longitude.toFixed(6),
        });
        setLocationName('📍 Current location captured');
        setLocating(false);
      },
      (error) => {
        alert('Could not get your location. Please allow location access or enter coordinates manually.');
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }

  return (
    <div style={{
      background: 'rgba(167, 139, 250, 0.04)',
      border: '1px solid rgba(167, 139, 250, 0.12)',
      borderRadius: 'var(--radius-md)',
      padding: '1.25rem',
    }}>
      {/* Toggle */}
      <label style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.6rem',
        cursor: 'pointer',
        fontSize: '0.95rem',
        color: 'var(--text-secondary)',
        marginBottom: geoData.isGeoLocked ? '1rem' : 0,
      }}>
        <input
          type="checkbox"
          checked={geoData.isGeoLocked}
          onChange={handleToggle}
          style={{ width: '18px', height: '18px', accentColor: 'var(--accent-purple)' }}
        />
        📍 Geo-lock this capsule (only opens at a specific location)
      </label>

      {geoData.isGeoLocked && (
        <>
          {/* Use Current Location Button */}
          <button
            type="button"
            onClick={useCurrentLocation}
            disabled={locating}
            className="btn btn-secondary"
            style={{ width: '100%', marginBottom: '1rem', fontSize: '0.85rem' }}
          >
            {locating ? 'Getting location...' : '📍 Use My Current Location'}
          </button>

          {locationName && (
            <p style={{
              fontSize: '0.8rem',
              color: 'var(--accent-green)',
              marginBottom: '0.75rem',
              textAlign: 'center',
            }}>
              {locationName}
            </p>
          )}

          {/* Manual Coordinates */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1rem' }}>
            <div>
              <label className="form-label" style={{ fontSize: '0.8rem' }}>Latitude</label>
              <input
                type="number"
                step="any"
                className="form-input"
                placeholder="e.g. 17.3850"
                value={geoData.latitude}
                onChange={(e) => onChange({ ...geoData, latitude: e.target.value })}
                style={{ fontSize: '0.85rem', padding: '0.6rem' }}
              />
            </div>
            <div>
              <label className="form-label" style={{ fontSize: '0.8rem' }}>Longitude</label>
              <input
                type="number"
                step="any"
                className="form-input"
                placeholder="e.g. 78.4867"
                value={geoData.longitude}
                onChange={(e) => onChange({ ...geoData, longitude: e.target.value })}
                style={{ fontSize: '0.85rem', padding: '0.6rem' }}
              />
            </div>
          </div>

          {/* Radius Slider */}
          <div>
            <label className="form-label" style={{ fontSize: '0.8rem' }}>
              Unlock radius: {geoData.geoRadius}m
            </label>
            <input
              type="range"
              min="50"
              max="1000"
              step="50"
              value={geoData.geoRadius}
              onChange={(e) => onChange({ ...geoData, geoRadius: parseInt(e.target.value) })}
              style={{ width: '100%', accentColor: 'var(--accent-purple)' }}
            />
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: '0.7rem',
              color: 'var(--text-muted)',
            }}>
              <span>50m</span>
              <span>1000m</span>
            </div>
          </div>

          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
            The recipient must be within {geoData.geoRadius} meters of this location to open the capsule.
          </p>
        </>
      )}
    </div>
  );
}

export default GeoLockPicker;
