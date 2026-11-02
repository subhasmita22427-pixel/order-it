export const demoDeliverySlots = [
  { id: '09:00-11:00', label: '9:00 AM - 11:00 AM', startHour: 9, startMinute: 0 },
  { id: '12:00-14:00', label: '12:00 PM - 2:00 PM', startHour: 12, startMinute: 0 },
  { id: '16:00-18:00', label: '4:00 PM - 6:00 PM', startHour: 16, startMinute: 0 },
];

export function formatDateInput(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getMinDeliveryDate(now = new Date()) {
  return formatDateInput(now);
}

function parseLocalDate(dateValue) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateValue || '');
  if (!match) return null;
  const [, year, month, day] = match;
  const date = new Date(Number(year), Number(month) - 1, Number(day));
  return formatDateInput(date) === dateValue ? date : null;
}

export function getAvailableDeliverySlots(dateValue, now = new Date()) {
  const date = parseLocalDate(dateValue);
  if (!date) return [];

  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  if (date < today) return [];

  return demoDeliverySlots.filter((slot) => {
    const slotStart = new Date(date);
    slotStart.setHours(slot.startHour, slot.startMinute, 0, 0);
    return slotStart > now;
  });
}

export function isValidDeliverySchedule(dateValue, slotId, now = new Date()) {
  return getAvailableDeliverySlots(dateValue, now).some((slot) => slot.id === slotId);
}

export function isValidDeliveryPreference(preference, now = new Date()) {
  return preference?.type === 'now'
    || (preference?.type === 'scheduled' && isValidDeliverySchedule(preference.date, preference.timeSlot, now));
}

export function getDeliverySummary(preference) {
  if (preference?.type !== 'scheduled') return 'Deliver now';
  const slot = demoDeliverySlots.find((item) => item.id === preference.timeSlot);
  const date = parseLocalDate(preference.date);
  if (!slot || !date) return 'Choose a delivery date and time slot';
  const dateLabel = new Intl.DateTimeFormat('en-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(date);
  return `Scheduled: ${dateLabel} · ${slot.label}`;
}
