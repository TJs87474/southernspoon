import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import logo from '../assets/logo.png';
import './Navigation.css';

export default function Navigation() {
  const location = useLocation();
  const { currentUser } = useAuth();

  // Get first letter of email for profile picture
  const getInitial = (email: string | null | undefined) => {
    if (!email) return '?';
    return email.charAt(0).toUpperCase();
  };

  return (
    <nav className="navigation">
      <div className="nav-top">
        <div className="user-welcome">
          <div className="profile-picture">
            {getInitial(currentUser?.email)}
          </div>
          <span className="welcome-text">
            Welcome, {String(currentUser?.email || 'Guest')}
          </span>
        </div>
        <img src={logo} alt="Southern Spoon Logo" className="app-logo" />
        <div className="nav-spacer"></div>
      </div>
      <div className="nav-links">
        <Link 
          to="/about" 
          className={`nav-link ${location.pathname === '/about' ? 'active' : ''}`}
        >
          About
        </Link>
        <Link 
          to="/discover" 
          className={`nav-link ${location.pathname === '/discover' ? 'active' : ''}`}
        >
          Discover
        </Link>
        <Link 
          to="/saved" 
          className={`nav-link ${location.pathname === '/saved' ? 'active' : ''}`}
        >
          Saved
        </Link>
        <Link 
          to="/profile" 
          className={`nav-link ${location.pathname === '/profile' ? 'active' : ''}`}
        >
          Profile
        </Link>
      </div>
    </nav>
  );
}
