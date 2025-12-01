import { Link } from 'react-router-dom';
import friendsImage from '../assets/friends.jpeg';
import logoImage from '../assets/logo.png';
import './AboutPage.css';

export default function AboutPage() {
  return (
    <div className="about-container">
      <div className="about-content">
        <div className="hero-section">
           
          <img src={logoImage} alt="Logo" className="about-image2" />
        </div>

        <div className="about-card">
          <h1>Welcome to the Southern Spoon</h1>
          <img src={friendsImage} alt="Friends" className="about-image" />
          
          <div className="about-text">
            <p>The Southern Spoon was an idea that came from two best friends who share a love for exploring the city of Atlanta, and a good meal. There are so many great culinary experiences in Atlanta, from dining experiences and cooking classes, to popups where you can enjoy creative and limited dishes. The Southern Spoon was created to be a repositiory to help you find your next favorite event, all in one place.    </p>
          </div>
        </div>

        <div className="cta-section">
          <h2>Ready to get started? Let's go!</h2>
          <Link to="/register" className="cta-button">
            Sign Up
          </Link>
        </div>
      </div>
    </div>
  );
}
