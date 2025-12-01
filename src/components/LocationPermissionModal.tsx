import { useState } from 'react';
import { useLocation } from '../contexts/LocationContext';
import './LocationPermissionModal.css';

interface LocationPermissionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function LocationPermissionModal({ isOpen, onClose }: LocationPermissionModalProps) {
  const { requestLocation, setManualLocation, error } = useLocation();
  const [showManualEntry, setShowManualEntry] = useState(false);
  const [locationInput, setLocationInput] = useState('');
  const [geocodeError, setGeocodeError] = useState('');
  const [isGeocoding, setIsGeocoding] = useState(false);

  if (!isOpen) return null;

  const handleRequestLocation = () => {
    requestLocation();
  };

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGeocodeError('');
    setIsGeocoding(true);
    
    try {
      // Use Nominatim (OpenStreetMap) free geocoding API
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(locationInput)}&limit=1`,
        {
          headers: {
            'User-Agent': 'SouthernSpoon/1.0'
          }
        }
      );
      
      const data = await response.json();
      
      if (data && data.length > 0) {
        const lat = parseFloat(data[0].lat);
        const lon = parseFloat(data[0].lon);
        setManualLocation(lat, lon);
        onClose();
      } else {
        setGeocodeError('Location not found. Try "Atlanta, GA" or "30303"');
      }
    } catch (err) {
      setGeocodeError('Failed to find location. Please try again.');
      console.error('Geocoding error:', err);
    } finally {
      setIsGeocoding(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Enable Location</h2>
        <p className="modal-description">
          We need your location to show you how far away events are from you.
        </p>

        
        {error && <div className="error-message">{error}</div>}
        
        {!showManualEntry ? (
          <div className="modal-actions">
            <button onClick={handleRequestLocation} className="btn-primary">
              Allow Location Access
            </button>
            <button onClick={() => setShowManualEntry(true)} className="btn-secondary">
              Enter Location Manually
            </button>
          </div>
        ) : (
          <form onSubmit={handleManualSubmit} className="manual-location-form">
            <div className="form-group">
              <label htmlFor="location">City, State or Zip Code</label>
              <input
                id="location"
                type="text"
                value={locationInput}
                onChange={(e) => setLocationInput(e.target.value)}
                placeholder="e.g., Atlanta, GA or 30303"
                required
                disabled={isGeocoding}
              />
              <p className="input-hint">Enter your city and state, or just a zip code</p>
            </div>
            
            {geocodeError && <div className="error-message">{geocodeError}</div>}
            
            <div className="modal-actions">
              <button type="submit" className="btn-primary" disabled={isGeocoding}>
                {isGeocoding ? 'Finding Location...' : 'Set Location'}
              </button>
              <button 
                type="button" 
                onClick={() => {
                  setShowManualEntry(false);
                  setGeocodeError('');
                  setLocationInput('');
                }} 
                className="btn-secondary"
                disabled={isGeocoding}
              >
                Back
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
