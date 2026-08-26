import { Link } from 'react-router-dom';

/**
 * Landing Page
 * 
 * The first thing people see when they visit the app without being logged in.
 * Its job: explain what the app does in 5 seconds and make them want to sign up.
 */

function Landing() {
  const features = [
    {
      icon: '🔒',
      title: 'Seal Your Messages',
      description: 'Write messages, attach photos or voice notes, and lock them until a future date. Nobody can peek — not even you.',
    },
    {
      icon: '⏰',
      title: 'Scheduled Delivery',
      description: 'Pick any date — tomorrow, next year, or a decade from now. Your capsule stays sealed until the moment arrives.',
    },
    {
      icon: '👥',
      title: 'Group Capsules',
      description: 'Invite friends or family to contribute. Everyone adds their piece, and you all open it together.',
    },
    {
      icon: '📍',
      title: 'Geo-Locked',
      description: 'Pin a capsule to a location. It only opens when the recipient is physically there. Digital treasure hunts.',
    },
    {
      icon: '🔐',
      title: 'End-to-End Encrypted',
      description: 'Your messages are encrypted before they leave your browser. Even our servers can\'t read them.',
    },
    {
      icon: '📊',
      title: 'Emotion Timeline',
      description: 'See how your feelings evolve over time. Your capsules paint a picture of your emotional journey.',
    },
  ];

  return (
    <div style={{ background: 'var(--bg-primary)', minHeight: '100vh' }}>
      {/* Navigation */}
      <nav style={{
        padding: '1.25rem 2rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        maxWidth: '1100px',
        margin: '0 auto',
      }}>
        <span style={{ fontSize: '1.25rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span>🕰️</span>
          <span className="text-gradient">Time Capsule</span>
        </span>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <Link to="/login" className="btn btn-secondary" style={{ padding: '0.5rem 1.25rem', fontSize: '0.9rem' }}>
            Log In
          </Link>
          <Link to="/register" className="btn btn-primary" style={{ padding: '0.5rem 1.25rem', fontSize: '0.9rem' }}>
            Sign Up Free
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section style={{
        textAlign: 'center',
        padding: '6rem 2rem 4rem',
        maxWidth: '800px',
        margin: '0 auto',
      }}>
        <h1 style={{
          fontSize: 'clamp(2.2rem, 5vw, 3.5rem)',
          fontWeight: 800,
          lineHeight: 1.15,
          marginBottom: '1.25rem',
        }}>
          Preserve today.{' '}
          <span className="text-gradient">Unlock tomorrow.</span>
        </h1>

        <p style={{
          fontSize: '1.15rem',
          color: 'var(--text-secondary)',
          maxWidth: '580px',
          margin: '0 auto 2.5rem',
          lineHeight: 1.7,
        }}>
          Write a message to your future self, seal it with a date, and let time 
          do the rest. When the moment arrives, your past speaks to your present.
        </p>

        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link to="/register" className="btn btn-primary" style={{
            padding: '0.85rem 2.5rem',
            fontSize: '1.05rem',
            fontWeight: 600,
          }}>
            Create Your First Capsule
          </Link>
          <a href="#features" className="btn btn-secondary" style={{
            padding: '0.85rem 2rem',
            fontSize: '1.05rem',
          }}>
            See How It Works
          </a>
        </div>

        {/* Stats */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '3rem',
          marginTop: '4rem',
          padding: '1.5rem 0',
          borderTop: '1px solid var(--border-subtle)',
          borderBottom: '1px solid var(--border-subtle)',
        }}>
          {[
            { value: '100%', label: 'Free Forever' },
            { value: 'AES-256', label: 'Encryption' },
            { value: '∞', label: 'Capsules' },
          ].map((stat, i) => (
            <div key={i} style={{ textAlign: 'center' }}>
              <div style={{
                fontSize: '1.5rem',
                fontWeight: 700,
                background: 'var(--gradient-accent)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}>
                {stat.value}
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section id="features" style={{
        padding: '4rem 2rem',
        maxWidth: '1100px',
        margin: '0 auto',
      }}>
        <h2 style={{
          textAlign: 'center',
          fontSize: '2rem',
          fontWeight: 700,
          marginBottom: '0.5rem',
        }}>
          More than just messages
        </h2>
        <p style={{
          textAlign: 'center',
          color: 'var(--text-muted)',
          marginBottom: '3rem',
          fontSize: '1rem',
        }}>
          Every feature is built to make your memories matter more.
        </p>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
          gap: '1.25rem',
        }}>
          {features.map((feature, i) => (
            <div key={i} style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              padding: '1.75rem',
              transition: 'all 0.2s',
            }}
              onMouseOver={(e) => {
                e.currentTarget.style.borderColor = 'var(--border-accent)';
                e.currentTarget.style.boxShadow = 'var(--shadow-glow)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.borderColor = 'var(--border-subtle)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>{feature.icon}</div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '0.5rem' }}>
                {feature.title}
              </h3>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section style={{
        padding: '4rem 2rem',
        maxWidth: '800px',
        margin: '0 auto',
      }}>
        <h2 style={{
          textAlign: 'center',
          fontSize: '2rem',
          fontWeight: 700,
          marginBottom: '2.5rem',
        }}>
          Three steps. That's it.
        </h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {[
            { step: '01', title: 'Write your message', desc: 'Text, photos, voice, video — whatever you want your future self or someone special to see.' },
            { step: '02', title: 'Pick a date', desc: 'Tomorrow, next birthday, graduation day, ten years from now — you decide when the seal breaks.' },
            { step: '03', title: 'Seal and forget', desc: 'Your capsule is locked and encrypted. When the time comes, it opens — and the past speaks.' },
          ].map((item, i) => (
            <div key={i} style={{
              display: 'flex',
              gap: '1.5rem',
              alignItems: 'flex-start',
              padding: '1.5rem',
              background: 'var(--bg-card)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
            }}>
              <span style={{
                fontSize: '1.5rem',
                fontWeight: 800,
                background: 'var(--gradient-accent)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                minWidth: '36px',
              }}>
                {item.step}
              </span>
              <div>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 600, marginBottom: '0.3rem' }}>
                  {item.title}
                </h3>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                  {item.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section style={{
        textAlign: 'center',
        padding: '4rem 2rem 6rem',
        maxWidth: '600px',
        margin: '0 auto',
      }}>
        <h2 style={{ fontSize: '1.8rem', fontWeight: 700, marginBottom: '1rem' }}>
          Your future self is waiting.
        </h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '2rem', fontSize: '1rem' }}>
          Start preserving the moments that matter — completely free, forever.
        </p>
        <Link to="/register" className="btn btn-primary" style={{
          padding: '0.85rem 3rem',
          fontSize: '1.1rem',
          fontWeight: 600,
        }}>
          Get Started
        </Link>
      </section>

      {/* Footer */}
      <footer style={{
        borderTop: '1px solid var(--border-subtle)',
        padding: '2rem',
        textAlign: 'center',
        color: 'var(--text-muted)',
        fontSize: '0.8rem',
      }}>
        Built by Hemachandra · Virtual Time Capsule © {new Date().getFullYear()}
      </footer>
    </div>
  );
}

export default Landing;
