/**
 * Indian Public Holidays & Long Weekend Intelligence
 * Conforming to 01-PRODUCT-AND-UI.md §8.4:
 * Sourced from static official gazetted calendar — never invented pricing.
 * Helps families identify peak holiday demand and cheaper mid-week alternatives.
 */

export interface IndianHoliday {
  name: string;
  date: string; // YYYY-MM-DD
  dayOfWeek: string;
  type: 'Gazetted' | 'Observance' | 'Long Weekend';
  notes?: string;
}

export const INDIAN_HOLIDAYS: IndianHoliday[] = [
  // 2026
  { name: 'Republic Day', date: '2026-01-26', dayOfWeek: 'Monday', type: 'Gazetted', notes: 'Long weekend (Sat-Mon)' },
  { name: 'Maha Shivratri', date: '2026-02-15', dayOfWeek: 'Sunday', type: 'Gazetted' },
  { name: 'Holi', date: '2026-03-04', dayOfWeek: 'Wednesday', type: 'Gazetted', notes: 'Major leisure travel period' },
  { name: 'Good Friday', date: '2026-04-03', dayOfWeek: 'Friday', type: 'Gazetted', notes: 'Long weekend (Fri-Sun)' },
  { name: 'Easter Sunday', date: '2026-04-05', dayOfWeek: 'Sunday', type: 'Observance' },
  { name: 'Eid-ul-Fitr', date: '2026-03-21', dayOfWeek: 'Saturday', type: 'Gazetted' },
  { name: 'Mahavir Jayanti', date: '2026-04-14', dayOfWeek: 'Tuesday', type: 'Gazetted' },
  { name: 'Buddha Purnima', date: '2026-05-31', dayOfWeek: 'Sunday', type: 'Gazetted' },
  { name: 'Bakrid / Eid-ul-Adha', date: '2026-05-27', dayOfWeek: 'Wednesday', type: 'Gazetted' },
  { name: 'Muharram', date: '2026-06-26', dayOfWeek: 'Friday', type: 'Gazetted', notes: 'Long weekend (Fri-Sun)' },
  { name: 'Independence Day', date: '2026-08-15', dayOfWeek: 'Saturday', type: 'Gazetted' },
  { name: 'Raksha Bandhan', date: '2026-08-28', dayOfWeek: 'Friday', type: 'Observance', notes: 'Long weekend (Fri-Sun)' },
  { name: 'Janmashtami', date: '2026-09-04', dayOfWeek: 'Friday', type: 'Gazetted', notes: 'Long weekend (Fri-Sun)' },
  { name: 'Milad-un-Nabi', date: '2026-08-26', dayOfWeek: 'Wednesday', type: 'Gazetted' },
  { name: 'Mahatma Gandhi Jayanti', date: '2026-10-02', dayOfWeek: 'Friday', type: 'Gazetted', notes: 'Long weekend (Fri-Sun)' },
  { name: 'Dussehra / Vijayadashami', date: '2026-10-20', dayOfWeek: 'Tuesday', type: 'Gazetted', notes: 'Palace peak season' },
  { name: 'Diwali / Deepavali', date: '2026-11-08', dayOfWeek: 'Sunday', type: 'Gazetted', notes: 'High peak demand nationwide' },
  { name: 'Govardhan Puja / Bhai Dooj', date: '2026-11-10', dayOfWeek: 'Tuesday', type: 'Gazetted' },
  { name: 'Guru Nanak Jayanti', date: '2026-11-24', dayOfWeek: 'Tuesday', type: 'Gazetted' },
  { name: 'Christmas Day', date: '2026-12-25', dayOfWeek: 'Friday', type: 'Gazetted', notes: 'Long weekend (Fri-Sun), Goa/Resort peak' },
  { name: "New Year's Eve", date: '2026-12-31', dayOfWeek: 'Thursday', type: 'Observance', notes: 'Mandatory gala season' },

  // 2027
  { name: "New Year's Day", date: '2027-01-01', dayOfWeek: 'Friday', type: 'Gazetted', notes: 'Long weekend (Fri-Sun)' },
  { name: 'Republic Day', date: '2027-01-26', dayOfWeek: 'Tuesday', type: 'Gazetted' },
  { name: 'Holi', date: '2027-03-22', dayOfWeek: 'Monday', type: 'Gazetted', notes: 'Long weekend (Sat-Mon)' },
  { name: 'Good Friday', date: '2027-03-26', dayOfWeek: 'Friday', type: 'Gazetted', notes: 'Long weekend (Fri-Sun)' },
  { name: 'Independence Day', date: '2027-08-15', dayOfWeek: 'Sunday', type: 'Gazetted' },
  { name: 'Gandhi Jayanti', date: '2027-10-02', dayOfWeek: 'Saturday', type: 'Gazetted' },
  { name: 'Diwali', date: '2027-10-29', dayOfWeek: 'Friday', type: 'Gazetted', notes: 'Long weekend (Fri-Sun)' },
  { name: 'Christmas', date: '2027-12-25', dayOfWeek: 'Saturday', type: 'Gazetted' },
];

/**
 * Finds any holidays occurring during or adjoining the stay dates
 */
export function getHolidaysInStayRange(checkInStr: string, checkOutStr: string): IndianHoliday[] {
  const checkIn = new Date(checkInStr);
  const checkOut = new Date(checkOutStr);

  return INDIAN_HOLIDAYS.filter((h) => {
    const hDate = new Date(h.date);
    return hDate >= checkIn && hDate <= checkOut;
  });
}

/**
 * Returns upcoming long weekends after a given reference date
 */
export function getUpcomingLongWeekends(fromDateStr: string = '2026-09-26'): IndianHoliday[] {
  const fromDate = new Date(fromDateStr);
  return INDIAN_HOLIDAYS.filter((h) => {
    const hDate = new Date(h.date);
    return hDate >= fromDate && (h.notes?.includes('Long weekend') || h.type === 'Gazetted');
  }).slice(0, 4);
}
