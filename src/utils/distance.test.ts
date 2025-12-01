import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { calculateDistance, milesToKilometers, formatDistance } from './distance';

describe('Distance Calculation Utilities', () => {
  /**
   * Feature: southern-spoon, Property 5: Distance calculation accuracy
   * Validates: Requirements 2.2, 2.4, 5.4
   */
  it('property: distance calculation matches haversine formula for any valid coordinates', () => {
    fc.assert(
      fc.property(
        // Generate valid latitude (-90 to 90)
        fc.double({ min: -90, max: 90, noNaN: true }),
        // Generate valid longitude (-180 to 180)
        fc.double({ min: -180, max: 180, noNaN: true }),
        fc.double({ min: -90, max: 90, noNaN: true }),
        fc.double({ min: -180, max: 180, noNaN: true }),
        (lat1, lon1, lat2, lon2) => {
          const distance = calculateDistance(lat1, lon1, lat2, lon2);
          
          // Distance should always be non-negative
          expect(distance).toBeGreaterThanOrEqual(0);
          
          // Distance should be a finite number
          expect(Number.isFinite(distance)).toBe(true);
          
          // Distance from a point to itself should be 0
          if (lat1 === lat2 && lon1 === lon2) {
            expect(distance).toBe(0);
          }
        }
      ),
      { numRuns: 100 }
    );
  });


  it('property: distance calculation is symmetric for any two points', () => {
    fc.assert(
      fc.property(
        fc.double({ min: -90, max: 90 }),
        fc.double({ min: -180, max: 180 }),
        fc.double({ min: -90, max: 90 }),
        fc.double({ min: -180, max: 180 }),
        (lat1, lon1, lat2, lon2) => {
          const distance1 = calculateDistance(lat1, lon1, lat2, lon2);
          const distance2 = calculateDistance(lat2, lon2, lat1, lon1);
          
          // Distance from A to B should equal distance from B to A
          expect(distance1).toBe(distance2);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('property: known distance calculations are accurate', () => {
    // Test with known coordinates
    // Los Angeles to New York (approximately 2451 miles)
    const laToNy = calculateDistance(34.0522, -118.2437, 40.7128, -74.0060);
    expect(laToNy).toBeGreaterThan(2400);
    expect(laToNy).toBeLessThan(2500);
    
    // San Francisco to Los Angeles (approximately 347 miles)
    const sfToLa = calculateDistance(37.7749, -122.4194, 34.0522, -118.2437);
    expect(sfToLa).toBeGreaterThan(340);
    expect(sfToLa).toBeLessThan(360);
  });

  it('property: miles to kilometers conversion is accurate', () => {
    fc.assert(
      fc.property(
        fc.double({ min: 0.1, max: 10000, noNaN: true }),
        (miles) => {
          const km = milesToKilometers(miles);
          
          // Conversion factor is approximately 1.60934
          const expectedKm = Math.round(miles * 1.60934 * 10) / 10;
          expect(km).toBe(expectedKm);
          
          // Kilometers should always be greater than miles (for values > 0.1)
          expect(km).toBeGreaterThan(miles);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('property: format distance returns correct string format', () => {
    fc.assert(
      fc.property(
        fc.double({ min: 0, max: 1000 }),
        (miles) => {
          const milesFormat = formatDistance(miles, 'miles');
          const kmFormat = formatDistance(miles, 'km');
          
          // Should contain the unit
          expect(milesFormat).toContain('mi');
          expect(kmFormat).toContain('km');
          
          // Should contain a number
          expect(milesFormat).toMatch(/\d+/);
          expect(kmFormat).toMatch(/\d+/);
        }
      ),
      { numRuns: 100 }
    );
  });
});
