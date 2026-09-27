/**
 * Authoritative mapping of Taj properties in the database to their official
 * Taj / IHCL Sanity CMS hotel IDs and booking identifiers.
 */

export interface TajHotelMapping {
  hotelId: string;
  identifier: string;
  hotelName: string;
}

export const TAJ_HOTEL_MAP: Record<string, TajHotelMapping> = {
  "taj-mahal-palace-mumbai": {
    "hotelId": "e84bb5c3-b460-4b25-a2ee-9bb0c5221cfb",
    "identifier": "taj-mahal-palace-mumbai",
    "hotelName": "The Taj Mahal Palace, Mumbai"
  },
  "taj-lands-end-mumbai": {
    "hotelId": "e1058dfa-fe44-4933-bb1b-85621258d217",
    "identifier": "taj-lands-end-mumbai",
    "hotelName": "Taj Lands End, Mumbai"
  },
  "taj-santacruz-mumbai": {
    "hotelId": "79fa07fc-92be-411a-9205-2e3dc2f8d8fc",
    "identifier": "taj-santacruz-mumbai",
    "hotelName": "Taj Santacruz, Mumbai"
  },
  "taj-lake-palace-udaipur": {
    "hotelId": "dd9c3e11-a638-4908-822e-ab4dcf52bd94",
    "identifier": "taj-lake-palace-udaipur",
    "hotelName": "Taj Lake Palace, Udaipur"
  },
  "taj-fateh-prakash-palace-udaipur": {
    "hotelId": "b045bb19-718a-436a-8d0c-3d8d4bc103bd",
    "identifier": "taj-fateh-prakash-palace-udaipur",
    "hotelName": "Taj Fateh Prakash Palace, Udaipur"
  },
  "rambagh-palace-jaipur": {
    "hotelId": "0d77eb01-8fa7-4d34-80da-6a91364d65e6",
    "identifier": "rambagh-palace-jaipur",
    "hotelName": "Rambagh Palace, Jaipur "
  },
  "taj-jai-mahal-palace-jaipur": {
    "hotelId": "b8c1a601-b216-4e70-a64a-1be8355bb5b4",
    "identifier": "jai-mahal-palace-jaipur",
    "hotelName": "Jai Mahal Palace, Jaipur"
  },
  "umaid-bhawan-palace-jodhpur": {
    "hotelId": "b753a4f0-c407-4c4f-9107-b29f2d3a6ac1",
    "identifier": "umaid-bhawan-palace-jodhpur",
    "hotelName": "Umaid Bhawan Palace, Jodhpur"
  },
  "taj-exotica-resort-spa-goa": {
    "hotelId": "2599cecc-2397-49d2-aa66-b0011ac2f48a",
    "identifier": "taj-exotica-goa",
    "hotelName": "Taj Exotica Resort & Spa, Goa"
  },
  "taj-fort-aguada-resort-spa-goa": {
    "hotelId": "1b8a63b8-839e-486e-86dd-a61cb68743cc",
    "identifier": "taj-fort-aguada-goa",
    "hotelName": "Taj Fort Aguada Resort & Spa, Goa"
  },
  "taj-holiday-village-resort-spa-goa": {
    "hotelId": "722066ba-44b2-4544-bc25-c985f86c3b26",
    "identifier": "taj-holiday-village-goa",
    "hotelName": "Taj Holiday Village Resort & Spa, Goa"
  },
  "taj-palace-new-delhi": {
    "hotelId": "288269fe-6d2d-4a25-be73-780418822a53",
    "identifier": "taj-palace-new-delhi",
    "hotelName": "Taj Palace, New Delhi"
  },
  "taj-falaknuma-palace-hyderabad": {
    "hotelId": "d0394a12-8f1f-47ed-a637-c107ca1cf261",
    "identifier": "taj-falaknuma-palace-hyderabad",
    "hotelName": "Taj Falaknuma Palace, Hyderabad"
  },
  "taj-krishna-hyderabad": {
    "hotelId": "c7d336c9-ef82-49c6-9cee-d3afe44b6c52",
    "identifier": "taj-krishna-hyderabad",
    "hotelName": "Taj Krishna, Hyderabad"
  },
  "taj-west-end-bengaluru": {
    "hotelId": "bbe3d58a-f37f-4f9b-ac8f-a5d3cf6f708b",
    "identifier": "taj-west-end-bengaluru",
    "hotelName": "Taj West End, Bengaluru"
  },
  "taj-coromandel-chennai": {
    "hotelId": "226f23a9-3dc7-4a07-a50f-d9296f7edf86",
    "identifier": "taj-coromandel-chennai",
    "hotelName": "Taj Coromandel, Chennai"
  },
  "taj-fishermans-cove-resort-spa-chennai": {
    "hotelId": "d5db6d30-9fb4-4605-b748-ff2b05e330da",
    "identifier": "taj-fishermans-cove-chennai",
    "hotelName": "Taj Fisherman's Cove Resort & Spa, Chennai"
  },
  "taj-bengal-kolkata": {
    "hotelId": "8e02cd8e-89d0-4287-9e72-81d46b9f0016",
    "identifier": "taj-bengal-kolkata",
    "hotelName": "Taj Bengal, Kolkata"
  },
  "taj-ganges-varanasi": {
    "hotelId": "161a18c2-d669-4f12-b71e-641327863040",
    "identifier": "taj-ganges-varanasi",
    "hotelName": "Taj Ganges, Varanasi"
  },
  "taj-rishikesh-resort-spa-uttarakhand": {
    "hotelId": "9c0cdab3-7271-4efe-baba-0828d9356ab2",
    "identifier": "taj-rishikesh",
    "hotelName": "Taj Rishikesh Resort & Spa, Uttarakhand"
  },
  "taj-bekal-resort-spa-kerala": {
    "hotelId": "ab07d270-f293-4bf6-a723-08bcd66619fd",
    "identifier": "taj-bekal-kerala",
    "hotelName": "Taj Bekal Resort & Spa, Kerala"
  },
  "taj-green-cove-resort-spa-kovalam": {
    "hotelId": "c44ded8d-02d0-4af1-8eed-57dbc71787a5",
    "identifier": "taj-green-cove",
    "hotelName": "Taj Green Cove Resort & Spa, Kovalam"
  },
  "taj-madikeri-resort-spa-coorg": {
    "hotelId": "042ca42c-7027-48a9-b7f9-f4f6d82f4411",
    "identifier": "taj-madikeri-coorg",
    "hotelName": "Taj Madikeri Resort & Spa, Coorg"
  },
  "taj-swarna-amritsar": {
    "hotelId": "e9ef28e3-377b-412c-b774-f86e3778b7d2",
    "identifier": "taj-amritsar",
    "hotelName": "Taj Swarna, Amritsar"
  },
  "taj-city-centre-gurugram": {
    "hotelId": "d21c3bf6-f508-47ae-a456-540429b02b0d",
    "identifier": "taj-city-centre-gurugram",
    "hotelName": "Taj City Centre, Gurugram"
  },
  "taj-chandigarh": {
    "hotelId": "dd8c3c6c-77dc-4541-aadc-25d21af9ce5b",
    "identifier": "taj-chandigarh",
    "hotelName": "Taj Chandigarh"
  },
  "taj-corbett-resort-spa-uttarakhand": {
    "hotelId": "d8c873a4-f345-4de0-843e-e6f939ad9153",
    "identifier": "taj-corbett-uttarakhand",
    "hotelName": "Taj Corbett Resort & Spa, Uttarakhand"
  },
  "taj-theog-resort-spa-shimla": {
    "hotelId": "028efcce-2d14-433e-8569-2d102f9ef349",
    "identifier": "taj-theog",
    "hotelName": "Taj Theog Resort & Spa, Shimla"
  },
  "taj-chia-kutir-resort-spa-darjeeling": {
    "hotelId": "10c9928a-febc-4d99-849f-7ae886846c1f",
    "identifier": "taj-chia-kutir-darjeeling",
    "hotelName": "Taj Chia Kutir Resort & Spa, Darjeeling "
  },
  "taj-mahal-hotel-new-delhi": {
    "hotelId": "51478b7d-f166-4ab9-9f53-167fbe45aac8",
    "identifier": "taj-mahal-new-delhi",
    "hotelName": "Taj Mahal, New Delhi"
  },
  "taj-hotel-convention-centre-agra": {
    "hotelId": "0ae5e1ca-985c-418f-9684-279549946f04",
    "identifier": "taj-agra",
    "hotelName": "Taj Agra"
  }
};

/**
 * Resolves a Taj hotel ID from a given slug or hotel name.
 */
export function getTajHotelMapping(slugOrId: string): TajHotelMapping | null {
  if (TAJ_HOTEL_MAP[slugOrId]) {
    return TAJ_HOTEL_MAP[slugOrId];
  }
  const normalized = slugOrId.toLowerCase().replace(/^(the-|taj-)/, '');
  for (const [key, val] of Object.entries(TAJ_HOTEL_MAP)) {
    if (key.includes(normalized) || val.identifier.includes(normalized)) {
      return val;
    }
  }
  return null;
}
