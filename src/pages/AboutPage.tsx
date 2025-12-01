import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Navigation from '../components/Navigation';
import './AboutPage.css';

export default function AboutPage() {
  const { currentUser } = useAuth();

  return (
    <div className="about-container">
      {currentUser && <Navigation />}
      
      <div className="about-content">
        <div className="hero-section">
          <h1 className="app-title">The Southern Spoon</h1>
          <p className="tagline">Discover Local Events, One Swipe at a Time</p>
        </div>

        <div className="about-card">
          <section className="about-section">
            <h2>What is The Southern Spoon?</h2>
            <p>
              The Southern Spoon is your personal event discovery companion, designed to help you 
              find exciting local events tailored to your interests. Whether you're looking for 
              live music, food festivals, art shows, or community gatherings, we make it easy to 
              discover what's happening around you.
            </p>
          </section>

          <section className="about-section">
            <h2>How It Works</h2>
            <div className="features-grid">
              <div className="feature-item">
                <div className="feature-icon">🔍</div>
                <h3>Discover</h3>
                <p>Browse through curated local events with beautiful image-based cards</p>
              </div>
              
              <div className="feature-item">
                <div className="feature-icon">👆</div>
                <h3>Swipe</h3>
                <p>Swipe right on events you're interested in, left to pass</p>
              </div>
              
              <div className="feature-item">
                <div className="feature-icon">💾</div>
                <h3>Save</h3>
                <p>Build your personalized list of upcoming events</p>
              </div>
              
              <div className="feature-item">
                <div className="feature-icon">📍</div>
                <h3>Explore</h3>
                <p>See event details, distances, and get directions</p>
              </div>
            </div>
          </section>

          <section className="about-section">
            <h2>Key Features</h2>
            <ul className="features-list">
              <li>
                <span className="feature-bullet">✨</span>
                <strong>Location-Based Discovery:</strong> Find events near you with real-time distance calculations
              </li>
              <li>
                <span className="feature-bullet">✨</span>
                <strong>Smart Filtering:</strong> Never see the same event twice - we remember your choices
              </li>
              <li>
                <span className="feature-bullet">✨</span>
                <strong>Detailed Information:</strong> Flip cards to see full descriptions, venue details, and links
              </li>
              <li>
                <span className="feature-bullet">✨</span>
                <strong>Organized Lists:</strong> Sort your saved events by date or distance
              </li>
              <li>
                <span className="feature-bullet">✨</span>
                <strong>Easy Access:</strong> Quick links to event pages and host websites
              </li>
            </ul>
          </section>

          <section className="about-section">
            <h2>Why The Southern Spoon?</h2>
            <p>
              We believe discovering local events should be fun, intuitive, and personalized. 
              Traditional event listings can be overwhelming and hard to navigate. The Southern Spoon 
              brings the simplicity of modern dating apps to event discovery - making it easy to 
              find experiences you'll love with just a swipe.
            </p>
          </section>

          <section className="about-section cta-section">
            <h2>Ready to Get Started?</h2>
            <p>Join The Southern Spoon community and start discovering amazing local events today!</p>
            <div className="cta-buttons">
              {currentUser ? (
                <Link to="/discover" className="btn-cta">
                  Start Discovering Events
                </Link>
              ) : (
                <>
                  <Link to="/register" className="btn-cta">
                    Sign Up Free
                  </Link>
                  <Link to="/login" className="btn-cta-secondary">
                    Log In
                  </Link>
                </>
              )}
            </div>
          </section>
        </div>

        <footer className="about-footer">
          <p>&copy; 2024 The Southern Spoon. Discover what's happening around you.</p>
        </footer>
      </div>
    </div>
  );
}
