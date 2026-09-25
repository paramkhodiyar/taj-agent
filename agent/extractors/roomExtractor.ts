import { RawBookingRecord } from '../types.js';

/**
 * Room Extractor Subsystem (docs/03-DATA-AND-AGENT.md §3.3 & §5)
 * Maps source-specific labels ("Deluxe King Room City View") into canonical records ("Deluxe Room")
 * while strictly retaining the original sourceRoomName.
 */

export interface ExtractedRoom {
  canonicalRoomName: string;
  sourceRoomName: string;
  viewType?: string;
  bedType?: string;
}

export function extract_rooms(raw: RawBookingRecord): ExtractedRoom {
  const sourceName = raw.sourceRoomName || 'Standard Room';
  const lower = sourceName.toLowerCase();

  // Extract View
  let viewType: string | undefined;
  if (/sea view|ocean view/i.test(lower)) viewType = 'Sea View';
  else if (/city view/i.test(lower)) viewType = 'City View';
  else if (/garden view/i.test(lower)) viewType = 'Garden View';
  else if (/lake view|pichola view/i.test(lower)) viewType = 'Lake View';
  else if (/palace view/i.test(lower)) viewType = 'Palace View';
  else if (/pool view/i.test(lower)) viewType = 'Pool View';

  // Extract Bed Type
  let bedType: string | undefined;
  if (/king bed|king/i.test(lower)) bedType = 'King';
  else if (/twin bed|twin/i.test(lower)) bedType = 'Twin';

  // Canonical Room Name resolution
  let canonicalRoomName = 'Deluxe Room';
  if (/presidential|grand presidential/i.test(lower)) {
    canonicalRoomName = 'Presidential Suite';
  } else if (/tata suite/i.test(lower)) {
    canonicalRoomName = 'Tata Suite';
  } else if (/executive suite/i.test(lower)) {
    canonicalRoomName = 'Executive Suite';
  } else if (/suite/i.test(lower)) {
    canonicalRoomName = 'Luxury Suite';
  } else if (/taj club|club room/i.test(lower)) {
    canonicalRoomName = 'Taj Club Room';
  } else if (/luxury room|grand luxury/i.test(lower)) {
    canonicalRoomName = 'Luxury Room';
  } else if (/superior room/i.test(lower)) {
    canonicalRoomName = 'Superior Room';
  } else if (/deluxe room|deluxe/i.test(lower)) {
    canonicalRoomName = 'Deluxe Room';
  } else if (/cottage|villa/i.test(lower)) {
    canonicalRoomName = 'Garden Villa / Cottage';
  }

  return {
    canonicalRoomName,
    sourceRoomName: sourceName.trim(),
    viewType,
    bedType,
  };
}
