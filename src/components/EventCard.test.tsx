import { describe, it, expect } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import * as fc from 'fast-check';
import EventCard from './EventCard';
import type { EventWithDistance } from '../types/index';

describe('EventCard Component', () => {
  /**
   * Feature: southern-spoon, Property 4: Event cards display required information
   * Validates: Requirements 2.1
   */
  it('property: event card displays name, distance, and date for any event', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 2, maxLength: 100 }).filter(s => s.trim().length > 1),
        fc.string({ minLength: 2, maxLength: 100 }).filter(s => s.trim().length > 1),
        fc.double({ min: 0.1, max: 1000, noNaN: true }),
        fc.date({ min: new Date(), max: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) }),
        (name, venue, distance, date) => {
          const mockEvent: EventWithDistance = {
            id: 'test-id',
            name,
            venue,
            description: 'Test description',
            date,
            location: {
              latitude: 34.0522,
              longitude: -118.2437,
              address: 'Test address',
            },
            createdAt: new Date(),
            isActive: true,
            distance,
          };

          const { container, unmount } = render(
            <EventCard
              event={mockEvent}
              onSwipeLeft={() => {}}
              onSwipeRight={() => {}}
            />
          );

          // Verify event name is displayed
          const nameElement = container.querySelector('.event-name');
          expect(nameElement?.textContent).toBe(name);
          
          // Verify venue is displayed
          const venueElement = container.querySelector('.event-venue');
          expect(venueElement?.textContent).toBe(venue);
          
          // Verify distance is displayed (formatted)
          const distanceText = container.textContent;
          expect(distanceText).toContain('mi');
          
          // Clean up after each render
          unmount();
          cleanup();
        }
      ),
      { numRuns: 50 }
    );
  });
});
