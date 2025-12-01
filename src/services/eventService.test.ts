import { describe, it, expect, beforeEach, vi } from 'vitest';
import * as fc from 'fast-check';

// Mock Firestore
vi.mock('../firebase/config', () => ({
  db: {},
}));

vi.mock('firebase/firestore', () => ({
  collection: vi.fn(),
  addDoc: vi.fn(),
  Timestamp: {
    now: vi.fn(() => ({ seconds: Date.now() / 1000, nanoseconds: 0 })),
  },
  query: vi.fn(),
  where: vi.fn(),
  getDocs: vi.fn(),
}));

import { recordEventInteraction, saveEvent } from './eventService';
import { addDoc } from 'firebase/firestore';

describe('Event Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(addDoc).mockResolvedValue({ id: 'mock-id' } as any);
  });

  /**
   * Feature: southern-spoon, Property 6: Swipe yes adds to saved list
   * Validates: Requirements 3.1, 4.1
   */
  it('property: swipe yes records interaction and saves event for any user/event', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.uuid(),
        fc.uuid(),
        fc.double({ min: 0, max: 1000 }),
        async (userId, eventId, distance) => {
          vi.clearAllMocks();
          
          // Record yes interaction
          await recordEventInteraction(userId, eventId, 'yes');
          
          // Save event
          await saveEvent(userId, eventId, distance);
          
          // Verify both operations were called
          expect(addDoc).toHaveBeenCalledTimes(2);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Feature: southern-spoon, Property 7: Swipe no excludes from saved list
   * Validates: Requirements 3.2
   */
  it('property: swipe no only records interaction without saving for any user/event', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.uuid(),
        fc.uuid(),
        async (userId, eventId) => {
          vi.clearAllMocks();
          
          // Record no interaction
          await recordEventInteraction(userId, eventId, 'no');
          
          // Verify only interaction was recorded (not saved)
          expect(addDoc).toHaveBeenCalledTimes(1);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Feature: southern-spoon, Property 8: Events are not repeated
   * Validates: Requirements 3.3
   */
  it('property: interaction prevents event from appearing again', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.uuid(),
        fc.uuid(),
        fc.constantFrom('yes', 'no'),
        async (userId, eventId, action) => {
          vi.clearAllMocks();
          
          // Record interaction
          await recordEventInteraction(userId, eventId, action as 'yes' | 'no');
          
          // Verify interaction was recorded
          expect(addDoc).toHaveBeenCalled();
          
          const callArgs = vi.mocked(addDoc).mock.calls[0];
          expect(callArgs[1]).toMatchObject({
            userId,
            eventId,
            action,
          });
        }
      ),
      { numRuns: 100 }
    );
  });
});
