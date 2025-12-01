import { useState, useRef } from 'react';
import type { EventWithDistance } from '../types/index';
import { formatDistance } from '../utils/distance';
import './EventCard.css';

interface EventCardProps {
  event: EventWithDistance;
  onSwipeLeft: () => void;
  onSwipeRight: () => void;
}

export default function EventCard({ event, onSwipeLeft, onSwipeRight }: EventCardProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isFlipped, setIsFlipped] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const cardRef = useRef<HTMLDivElement>(null);

  const handleDragStart = (clientX: number, clientY: number) => {
    setIsDragging(true);
    setStartPos({ x: clientX, y: clientY });
  };

  const handleDragMove = (clientX: number, clientY: number) => {
    if (!isDragging) return;
    
    const deltaX = clientX - startPos.x;
    const deltaY = clientY - startPos.y;
    setDragOffset({ x: deltaX, y: deltaY });
  };

  const handleDragEnd = () => {
    setIsDragging(false);
    
    const threshold = 100;
    
    if (dragOffset.x > threshold) {
      onSwipeRight();
    } else if (dragOffset.x < -threshold) {
      onSwipeLeft();
    }
    
    setDragOffset({ x: 0, y: 0 });
  };

  // Mouse events
  const handleMouseDown = (e: React.MouseEvent) => {
    // Don't start dragging if clicking the more info button
    if ((e.target as HTMLElement).closest('.more-info-btn')) {
      return;
    }
    handleDragStart(e.clientX, e.clientY);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    handleDragMove(e.clientX, e.clientY);
  };

  const handleMouseUp = () => {
    handleDragEnd();
  };

  // Touch events
  const handleTouchStart = (e: React.TouchEvent) => {
    // Don't start dragging if touching the more info button
    if ((e.target as HTMLElement).closest('.more-info-btn')) {
      return;
    }
    const touch = e.touches[0];
    handleDragStart(touch.clientX, touch.clientY);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    handleDragMove(touch.clientX, touch.clientY);
  };

  const handleTouchEnd = () => {
    handleDragEnd();
  };

  const rotation = dragOffset.x * 0.1;
  const opacity = 1 - Math.abs(dragOffset.x) / 300;

  const cardStyle = {
    transform: `translate(${dragOffset.x}px, ${dragOffset.y}px) rotate(${rotation}deg)`,
    opacity,
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const defaultImage = 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&auto=format&fit=crop';

  return (
    <div
      ref={cardRef}
      className={`event-card ${isDragging ? 'dragging' : ''} ${isFlipped ? 'flipped' : ''}`}
      style={cardStyle}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <div className="card-inner">
        {/* Front of card */}
        <div className="card-face card-front">
          <div 
            className="card-image"
            style={{ backgroundImage: `url(${event.imageUrl || defaultImage})` }}
          >
            <div className="image-overlay" />
          </div>
          
          <div className="card-info">
            <h2 className="event-name">{event.name}</h2>
            <p className="event-venue">
              <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                <circle cx="12" cy="10" r="3"></circle>
              </svg>
              {event.venue}
            </p>
            
            <div className="event-meta">
              <span className="meta-item">
                <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                  <line x1="16" y1="2" x2="16" y2="6"></line>
                  <line x1="8" y1="2" x2="8" y2="6"></line>
                  <line x1="3" y1="10" x2="21" y2="10"></line>
                </svg>
                {formatDate(event.date)}
              </span>
              <span className="meta-item">
                <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"></circle>
                  <polyline points="12 6 12 12 16 14"></polyline>
                </svg>
                {formatTime(event.date)}
              </span>
              {event.distance !== undefined && (
                <span className="meta-item">
                  <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                    <polyline points="12 5 19 12 12 19"></polyline>
                  </svg>
                  {formatDistance(event.distance)}
                </span>
              )}
            </div>
            
            <button 
              className="more-info-btn"
              onClick={(e) => {
                e.stopPropagation();
                setIsFlipped(true);
              }}
            >
              More Info →
            </button>
          </div>
        </div>

        {/* Back of card */}
        <div className="card-face card-back">
          <div className="back-content">
            <button 
              className="back-btn"
              onClick={(e) => {
                e.stopPropagation();
                setIsFlipped(false);
              }}
            >
              ← Back
            </button>
            
            <h3 className="back-title">{event.name}</h3>
            
            <div className="back-section">
              <h4>About This Event</h4>
              <p className="back-description">
                {event.description || 'No description available for this event.'}
              </p>
            </div>
            
            <div className="back-section">
              <h4>Location</h4>
              <p>{event.venue}</p>
              <p className="address">{event.location.address}</p>
            </div>
            
            <div className="back-links">
              {event.link && (
                <a 
                  href={event.link} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="event-link"
                  onClick={(e) => e.stopPropagation()}
                >
                  View Event Details →
                </a>
              )}
              
              {event.hostWebsite && (
                <a 
                  href={event.hostWebsite} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="event-link host-link"
                  onClick={(e) => e.stopPropagation()}
                >
                  Visit Host Website →
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
      
      <div className="swipe-indicators">
        <div className={`swipe-indicator swipe-no ${dragOffset.x < -50 ? 'active' : ''}`}>
          ✕
        </div>
        <div className={`swipe-indicator swipe-yes ${dragOffset.x > 50 ? 'active' : ''}`}>
          ✓
        </div>
      </div>
    </div>
  );
}
