import { useMemo } from 'react';

/**
 * Geo Map
 * 
 * A simple SVG world map showing markers for geo-locked capsules.
 * Uses the Mercator projection to convert lat/lon → x/y on the map.
 * 
 * WHY NOT react-simple-maps?
 * Adding a 200KB dependency for a profile widget is overkill.
 * A lightweight SVG with a world outline + markers does the job
 * and keeps the bundle small.
 * 
 * HOW MERCATOR PROJECTION WORKS:
 * - Longitude → X is linear: (lon + 180) / 360 * width
 * - Latitude → Y uses a log/tan formula to account for
 *   how Mercator stretches the poles
 */

function latToY(lat, height) {
  const latRad = (lat * Math.PI) / 180;
  const mercN = Math.log(Math.tan(Math.PI / 4 + latRad / 2));
  return height / 2 - (height * mercN) / (2 * Math.PI);
}

function lonToX(lon, width) {
  return ((lon + 180) / 360) * width;
}

const MAP_WIDTH = 700;
const MAP_HEIGHT = 380;

function GeoMap({ capsules = [] }) {
  const geoCapsules = useMemo(() => {
    return capsules.filter(
      (c) => c.isGeoLocked && c.latitude != null && c.longitude != null
    );
  }, [capsules]);

  if (geoCapsules.length === 0) {
    return (
      <div style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-lg)',
        padding: '2rem',
        textAlign: 'center',
      }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '0.5rem' }}>🌍 Capsule Map</h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          Create geo-locked capsules to see them pinned on the world map.
        </p>
      </div>
    );
  }

  const markers = geoCapsules.map((c) => ({
    x: lonToX(c.longitude, MAP_WIDTH),
    y: latToY(c.latitude, MAP_HEIGHT),
    title: c.title,
    status: c.status,
    radius: c.geoRadius,
    lat: c.latitude,
    lon: c.longitude,
  }));

  return (
    <div style={{
      background: 'var(--bg-card)',
      border: '1px solid var(--border-subtle)',
      borderRadius: 'var(--radius-lg)',
      padding: '1.5rem 2rem',
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '1rem',
        flexWrap: 'wrap',
        gap: '0.5rem',
      }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 600 }}>🌍 Capsule Map</h3>
        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          {geoCapsules.length} geo-locked capsule{geoCapsules.length !== 1 ? 's' : ''}
        </div>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <svg
          viewBox={`0 0 ${MAP_WIDTH} ${MAP_HEIGHT}`}
          style={{
            width: '100%',
            maxWidth: MAP_WIDTH,
            height: 'auto',
            display: 'block',
            margin: '0 auto',
          }}
        >
          {/* Background */}
          <rect width={MAP_WIDTH} height={MAP_HEIGHT} fill="#0a0a1a" rx={8} />

          {/* Grid lines */}
          {[...Array(7)].map((_, i) => {
            const x = (i + 1) * (MAP_WIDTH / 8);
            return (
              <line key={`v${i}`} x1={x} y1={0} x2={x} y2={MAP_HEIGHT}
                stroke="rgba(255,255,255,0.03)" strokeWidth={1} />
            );
          })}
          {[...Array(5)].map((_, i) => {
            const y = (i + 1) * (MAP_HEIGHT / 6);
            return (
              <line key={`h${i}`} x1={0} y1={y} x2={MAP_WIDTH} y2={y}
                stroke="rgba(255,255,255,0.03)" strokeWidth={1} />
            );
          })}

          {/* Equator */}
          <line
            x1={0} y1={MAP_HEIGHT / 2} x2={MAP_WIDTH} y2={MAP_HEIGHT / 2}
            stroke="rgba(167, 139, 250, 0.1)" strokeWidth={1} strokeDasharray="4 4"
          />

          {/* Prime meridian */}
          <line
            x1={MAP_WIDTH / 2} y1={0} x2={MAP_WIDTH / 2} y2={MAP_HEIGHT}
            stroke="rgba(167, 139, 250, 0.1)" strokeWidth={1} strokeDasharray="4 4"
          />

          {/* Continent outlines — simplified polygons */}
          {/* North America */}
          <path
            d="M 80,60 L 120,55 160,70 170,95 165,125 150,140 130,145 100,135 85,140 75,155 60,140 55,110 60,80 Z"
            fill="rgba(167, 139, 250, 0.06)" stroke="rgba(167, 139, 250, 0.15)" strokeWidth={0.8}
          />
          {/* South America */}
          <path
            d="M 140,180 L 165,175 180,195 185,220 180,260 170,290 155,300 140,280 130,240 125,210 130,190 Z"
            fill="rgba(167, 139, 250, 0.06)" stroke="rgba(167, 139, 250, 0.15)" strokeWidth={0.8}
          />
          {/* Europe */}
          <path
            d="M 320,55 L 350,50 370,60 365,80 355,90 340,95 330,85 315,80 310,65 Z"
            fill="rgba(167, 139, 250, 0.06)" stroke="rgba(167, 139, 250, 0.15)" strokeWidth={0.8}
          />
          {/* Africa */}
          <path
            d="M 320,115 L 360,110 380,130 385,170 375,210 360,240 340,255 320,240 310,200 305,160 310,130 Z"
            fill="rgba(167, 139, 250, 0.06)" stroke="rgba(167, 139, 250, 0.15)" strokeWidth={0.8}
          />
          {/* Asia */}
          <path
            d="M 370,45 L 430,40 490,50 540,55 570,70 580,95 570,120 540,130 500,125 470,135 440,125 410,110 390,95 380,70 Z"
            fill="rgba(167, 139, 250, 0.06)" stroke="rgba(167, 139, 250, 0.15)" strokeWidth={0.8}
          />
          {/* India */}
          <path
            d="M 460,120 L 480,115 495,130 490,160 475,175 460,165 455,140 Z"
            fill="rgba(167, 139, 250, 0.06)" stroke="rgba(167, 139, 250, 0.15)" strokeWidth={0.8}
          />
          {/* Australia */}
          <path
            d="M 540,220 L 580,215 610,225 620,250 610,270 585,275 555,265 540,245 Z"
            fill="rgba(167, 139, 250, 0.06)" stroke="rgba(167, 139, 250, 0.15)" strokeWidth={0.8}
          />

          {/* Markers with pulse animation */}
          {markers.map((m, i) => (
            <g key={i}>
              {/* Pulse ring */}
              <circle
                cx={m.x} cy={m.y} r={12}
                fill="none"
                stroke={m.status === 'LOCKED' ? 'rgba(251, 191, 36, 0.3)' : 'rgba(74, 222, 128, 0.3)'}
                strokeWidth={1.5}
              >
                <animate attributeName="r" from="6" to="16" dur="2s" repeatCount="indefinite" />
                <animate attributeName="opacity" from="1" to="0" dur="2s" repeatCount="indefinite" />
              </circle>

              {/* Main dot */}
              <circle
                cx={m.x} cy={m.y} r={5}
                fill={m.status === 'LOCKED' ? '#fbbf24' : '#4ade80'}
                stroke="#0a0a1a"
                strokeWidth={1.5}
                style={{ cursor: 'pointer' }}
              />

              <title>{`${m.title}\n${m.status} · ${m.radius}m radius\n${m.lat.toFixed(4)}, ${m.lon.toFixed(4)}`}</title>
            </g>
          ))}
        </svg>
      </div>

      {/* Legend */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        gap: '1.5rem',
        marginTop: '1rem',
        fontSize: '0.8rem',
        color: 'var(--text-muted)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#fbbf24' }} />
          Locked
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#4ade80' }} />
          Unlocked / Opened
        </div>
      </div>
    </div>
  );
}

export default GeoMap;
