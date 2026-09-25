export interface ParsedSearchInput {
  checkIn: Date;
  checkOut: Date;
  adults: number;
  children: number;
  rooms: number;
  hotelId?: string;
}

export function validateSearchInput(body: any): { data?: ParsedSearchInput; error?: string } {
  if (!body || typeof body !== 'object') {
    return { error: 'Request body must be a valid JSON object' };
  }

  const { checkIn, checkOut, adults = 2, children = 0, rooms = 1, hotelId } = body;

  if (!checkIn || !checkOut) {
    return { error: 'checkIn and checkOut dates are required (format YYYY-MM-DD)' };
  }

  const checkInDate = new Date(checkIn);
  const checkOutDate = new Date(checkOut);

  if (isNaN(checkInDate.getTime()) || isNaN(checkOutDate.getTime())) {
    return { error: 'Invalid date format. Expected valid ISO or YYYY-MM-DD date' };
  }

  // Prevent dates in the past (allow today in local time)
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const checkInDay = new Date(checkInDate);
  checkInDay.setHours(0, 0, 0, 0);

  if (checkInDay < today) {
    return { error: 'checkIn date cannot be in the past' };
  }

  if (checkOutDate <= checkInDate) {
    return { error: 'checkOut date must be strictly after checkIn date' };
  }

  // Maximum stay window sanity check (e.g. 30 days)
  const stayDays = (checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24);
  if (stayDays > 30) {
    return { error: 'Maximum stay duration is 30 nights' };
  }

  const parsedAdults = parseInt(String(adults), 10);
  const parsedChildren = parseInt(String(children), 10);
  const parsedRooms = parseInt(String(rooms), 10);

  if (isNaN(parsedAdults) || parsedAdults < 1 || parsedAdults > 10) {
    return { error: 'Adults must be between 1 and 10' };
  }

  if (isNaN(parsedChildren) || parsedChildren < 0 || parsedChildren > 8) {
    return { error: 'Children must be between 0 and 8' };
  }

  if (isNaN(parsedRooms) || parsedRooms < 1 || parsedRooms > 5) {
    return { error: 'Rooms must be between 1 and 5' };
  }

  return {
    data: {
      checkIn: checkInDate,
      checkOut: checkOutDate,
      adults: parsedAdults,
      children: parsedChildren,
      rooms: parsedRooms,
      hotelId: hotelId ? String(hotelId).trim() : undefined,
    },
  };
}
