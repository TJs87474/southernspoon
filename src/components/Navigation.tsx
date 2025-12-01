import { Link, useLocation } from 'react-router-dom';
import './Navigation.css';

export default function Navigation() {
  const location = useLocation();

  return (
    <nav className="navigation">
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
