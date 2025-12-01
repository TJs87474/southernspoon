import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import * as fc from 'fast-check';
import { LocationProvider, useLocation } from './LocationContext';

describe('Location Context', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  /**
   * Feature: southern-spoon, Property 11: Location permission granted retrieves coordinates
   * Validates: Requirements 5.2
   */
  it('property: location retrieval returns valid coordinates for any granted permission', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.double({ min: -90, max: 90 }),
        fc.double({ min: -180, max: 180 }),
        async (latitude, longitude) => {
          // Mock geolocation API
          const mockGeolocation = {
            getCurrentPosition: vi.fn((success) => {
              success({
                coords: {
                  latitude,
                  longitude,
                  accuracy: 10,
                  altitude: null,
                  altitudeAccuracy: null,
                  heading: null,
                  speed: null,
                },
                timestamp: Date.now(),
              });
            }),
          };

          Object.defineProperty(global.navigator, 'geolocation', {
            value: mockGeolocation,
            configurable: true,
          });

          const { result } = renderHook(() => useLocation(), {
            wrapper: LocationProvider,
          });

          act(() => {
            result.current.requestLocation();
          });

          await waitFor(() => {
            expect(result.current.location).not.toBeNull();
          });

          // Verify coordinates are retrieved correctly
          expect(result.current.location?.latitude).toBe(latitude);
          expect(result.current.location?.longitude).toBe(longitude);
          expect(result.current.error).toBeNull();
        }
      ),
      { numRuns: 100 }
    );
  });


  it('property: manual location setting accepts any valid coordinates', () => {
    fc.assert(
      fc.property(
        fc.double({ min: -90, max: 90 }),
        fc.double({ min: -180, max: 180 }),
        (latitude, longitude) => {
          const { result } = renderHook(() => useLocation(), {
            wrapper: LocationProvider,
          });

          act(() => {
            result.current.setManualLocation(latitude, longitude);
          });

          // Verify manual location is set correctly
          expect(result.current.location?.latitude).toBe(latitude);
          expect(result.current.location?.longitude).toBe(longitude);
          expect(result.current.error).toBeNull();
        }
      ),
      { numRuns: 100 }
    );
  });

  it('handles permission denied error', () => {
    const mockGeolocation = {
      getCurrentPosition: vi.fn((success, error) => {
        error({
          code: 1, // PERMISSION_DENIED
          message: 'User denied geolocation',
          PERMISSION_DENIED: 1,
          POSITION_UNAVAILABLE: 2,
          TIMEOUT: 3,
        });
      }),
    };

    Object.defineProperty(global.navigator, 'geolocation', {
      value: mockGeolocation,
      configurable: true,
    });

    const { result } = renderHook(() => useLocation(), {
      wrapper: LocationProvider,
    });

    act(() => {
      result.current.requestLocation();
    });

    expect(result.current.error).toBe('Location permission denied');
    expect(result.current.location).toBeNull();
  });
});
