import { describe, expect, it } from 'vitest';
import {
  demoDeliverySlots,
  getAvailableDeliverySlots,
  getDeliverySummary,
  getMinDeliveryDate,
  isValidDeliveryPreference,
  isValidDeliverySchedule,
} from './delivery';

describe('delivery scheduling utilities', () => {
  it('rejects past dates and invalid calendar dates', () => {
    const now = new Date(2026, 10, 2, 8, 0);

    expect(getAvailableDeliverySlots('2026-11-01', now)).toEqual([]);
    expect(getAvailableDeliverySlots('2026-02-30', now)).toEqual([]);
    expect(isValidDeliverySchedule('2026-11-01', demoDeliverySlots[0].id, now)).toBe(false);
    expect(getMinDeliveryDate(now)).toBe('2026-11-02');
  });

  it('offers only future sample slots for today and all slots for a future date', () => {
    const now = new Date(2026, 10, 2, 10, 30);

    expect(getAvailableDeliverySlots('2026-11-02', now).map((slot) => slot.id)).toEqual([
      '12:00-14:00',
      '16:00-18:00',
    ]);
    expect(getAvailableDeliverySlots('2026-11-03', now).map((slot) => slot.id)).toEqual(demoDeliverySlots.map((slot) => slot.id));
    expect(isValidDeliverySchedule('2026-11-02', '09:00-11:00', now)).toBe(false);
    expect(isValidDeliverySchedule('2026-11-02', '12:00-14:00', now)).toBe(true);
  });

  it('summarizes delivery preferences and validates selection state', () => {
    const scheduled = { type: 'scheduled', date: '2026-11-03', timeSlot: '12:00-14:00' };
    const now = new Date(2026, 10, 2, 8, 0);

    expect(getDeliverySummary({ type: 'now' })).toBe('Deliver now');
    expect(getDeliverySummary(scheduled)).toMatch(/Scheduled:.*3 Nov.*12:00 PM - 2:00 PM/);
    expect(getDeliverySummary({ type: 'scheduled', date: '', timeSlot: '' })).toBe('Choose a delivery date and time slot');
    expect(isValidDeliveryPreference({ type: 'now' }, now)).toBe(true);
    expect(isValidDeliveryPreference(scheduled, now)).toBe(true);
    expect(isValidDeliveryPreference({ ...scheduled, timeSlot: '' }, now)).toBe(false);
  });
});
