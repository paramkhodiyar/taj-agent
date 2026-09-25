import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface CanonicalTajProperty {
  id: string;
  canonicalName: string;
  slug: string;
  brand: string;
  city: string;
  state: string;
  country: string;
  address: string;
  description: string;
  starRating: number;
  officialBookingUrl: string;
  latitude: number;
  longitude: number;
  heroImage: string;
  galleryImages: string[];
}

export const CANONICAL_TAJ_CATALOG: CanonicalTajProperty[] = [
  {
    id: "taj-mahal-palace-mumbai",
    canonicalName: "The Taj Mahal Palace",
    slug: "taj-mahal-palace-mumbai",
    brand: "Taj",
    city: "Mumbai",
    state: "Maharashtra",
    country: "India",
    address: "Apollo Bunder, Colaba, Mumbai 400001",
    description: "Built in 1903, The Taj Mahal Palace is India's first luxury hotel, overlooking the Gateway of India and the Arabian Sea.",
    starRating: 5,
    officialBookingUrl: "https://www.tajhotels.com/en-in/taj/taj-mahal-palace-mumbai/",
    latitude: 18.9217,
    longitude: 72.8332,
    heroImage: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1600&q=80",
    galleryImages: [
      "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=1200&q=80"
    ]
  },
  {
    id: "taj-lands-end-mumbai",
    canonicalName: "Taj Lands End",
    slug: "taj-lands-end-mumbai",
    brand: "Taj",
    city: "Mumbai",
    state: "Maharashtra",
    country: "India",
    address: "BJ Road, Bandstand, Bandra West, Mumbai 400050",
    description: "Perched atop the Bandstand peninsula with sweeping panoramic views of the Arabian Sea and the Bandra-Worli Sea Link.",
    starRating: 5,
    officialBookingUrl: "https://www.tajhotels.com/en-in/taj/taj-lands-end-mumbai/",
    latitude: 19.0435,
    longitude: 72.8194,
    heroImage: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1600&q=80",
    galleryImages: [
      "https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=1200&q=80"
    ]
  },
  {
    id: "taj-santacruz-mumbai",
    canonicalName: "Taj Santacruz",
    slug: "taj-santacruz-mumbai",
    brand: "Taj",
    city: "Mumbai",
    state: "Maharashtra",
    country: "India",
    address: "Chhatrapati Shivaji Maharaj International Airport, Off Western Express Hwy, Mumbai 400099",
    description: "A luxury airport retreat blending traditional Indian palace architecture with sophisticated modern design.",
    starRating: 5,
    officialBookingUrl: "https://www.tajhotels.com/en-in/taj/taj-santacruz-mumbai/",
    latitude: 19.0886,
    longitude: 72.8535,
    heroImage: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=1600&q=80",
    galleryImages: []
  },
  {
    id: "taj-lake-palace-udaipur",
    canonicalName: "Taj Lake Palace",
    slug: "taj-lake-palace-udaipur",
    brand: "Taj",
    city: "Udaipur",
    state: "Rajasthan",
    country: "India",
    address: "Pichola, Udaipur 313001",
    description: "An 18th-century white marble pleasure palace floating serenely in the tranquil waters of Lake Pichola.",
    starRating: 5,
    officialBookingUrl: "https://www.tajhotels.com/en-in/taj/taj-lake-palace-udaipur/",
    latitude: 24.5754,
    longitude: 73.6800,
    heroImage: "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1600&q=80",
    galleryImages: [
      "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80"
    ]
  },
  {
    id: "taj-fateh-prakash-palace-udaipur",
    canonicalName: "Taj Fateh Prakash Palace",
    slug: "taj-fateh-prakash-palace-udaipur",
    brand: "Taj",
    city: "Udaipur",
    state: "Rajasthan",
    country: "India",
    address: "City Palace Complex, Udaipur 313001",
    description: "Located within the historic City Palace complex with front-row vistas across Lake Pichola and the Jagmandir Island.",
    starRating: 5,
    officialBookingUrl: "https://www.tajhotels.com/en-in/taj/taj-fateh-prakash-palace-udaipur/",
    latitude: 24.5762,
    longitude: 73.6835,
    heroImage: "https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1600&q=80",
    galleryImages: []
  },
  {
    id: "rambagh-palace-jaipur",
    canonicalName: "Rambagh Palace",
    slug: "rambagh-palace-jaipur",
    brand: "Taj",
    city: "Jaipur",
    state: "Rajasthan",
    country: "India",
    address: "Bhawani Singh Road, Jaipur 302005",
    description: "The former residence of the Maharaja of Jaipur, renowned worldwide as the 'Jewel of Jaipur' with 47 acres of landscaped Mughal gardens.",
    starRating: 5,
    officialBookingUrl: "https://www.tajhotels.com/en-in/taj/rambagh-palace-jaipur/",
    latitude: 26.8979,
    longitude: 75.8083,
    heroImage: "https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=1600&q=80",
    galleryImages: [
      "https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=1200&q=80"
    ]
  },
  {
    id: "taj-jai-mahal-palace-jaipur",
    canonicalName: "Jai Mahal Palace",
    slug: "taj-jai-mahal-palace-jaipur",
    brand: "Taj",
    city: "Jaipur",
    state: "Rajasthan",
    country: "India",
    address: "Jacob Road, Civil Lines, Jaipur 302006",
    description: "An exquisite masterpiece of Indo-Saracenic architecture set amidst 18 acres of landscaped Mughal gardens dating to 1745.",
    starRating: 5,
    officialBookingUrl: "https://www.tajhotels.com/en-in/taj/jai-mahal-palace-jaipur/",
    latitude: 26.9098,
    longitude: 75.7876,
    heroImage: "https://images.unsplash.com/photo-1549294413-26f195200c16?auto=format&fit=crop&w=1600&q=80",
    galleryImages: []
  },
  {
    id: "umaid-bhawan-palace-jodhpur",
    canonicalName: "Umaid Bhawan Palace",
    slug: "umaid-bhawan-palace-jodhpur",
    brand: "Taj",
    city: "Jodhpur",
    state: "Rajasthan",
    country: "India",
    address: "Circuit House Rd, Cantt Area, Jodhpur 342006",
    description: "Perched high above the blue city of Jodhpur, this golden sandstone palace is one of the world's largest private royal residences.",
    starRating: 5,
    officialBookingUrl: "https://www.tajhotels.com/en-in/taj/umaid-bhawan-palace-jodhpur/",
    latitude: 26.2808,
    longitude: 73.0475,
    heroImage: "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1600&q=80",
    galleryImages: []
  },
  {
    id: "taj-exotica-resort-spa-goa",
    canonicalName: "Taj Exotica Resort & Spa",
    slug: "taj-exotica-resort-spa-goa",
    brand: "Taj",
    city: "Goa",
    state: "Goa",
    country: "India",
    address: "Calwaddar, Benaulim, Salcete 403716",
    description: "Embraced by 56 acres of lush gardens along the pristine shores of Benaulim Beach in South Goa.",
    starRating: 5,
    officialBookingUrl: "https://www.tajhotels.com/en-in/taj/taj-exotica-goa/",
    latitude: 15.2472,
    longitude: 73.9248,
    heroImage: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1600&q=80",
    galleryImages: [
      "https://images.unsplash.com/photo-1540541338287-41700207dee6?auto=format&fit=crop&w=1200&q=80"
    ]
  },
  {
    id: "taj-fort-aguada-resort-spa-goa",
    canonicalName: "Taj Fort Aguada Resort & Spa",
    slug: "taj-fort-aguada-resort-spa-goa",
    brand: "Taj",
    city: "Goa",
    state: "Goa",
    country: "India",
    address: "Sinquerim, Candolim, Bardez 403515",
    description: "Built on the ramparts of a 16th-century Portuguese fortress overlooking the sweeping Arabian Sea.",
    starRating: 5,
    officialBookingUrl: "https://www.tajhotels.com/en-in/taj/taj-fort-aguada-goa/",
    latitude: 15.4989,
    longitude: 73.7694,
    heroImage: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1600&q=80",
    galleryImages: []
  },
  {
    id: "taj-holiday-village-resort-spa-goa",
    canonicalName: "Taj Holiday Village Resort & Spa",
    slug: "taj-holiday-village-resort-spa-goa",
    brand: "Taj",
    city: "Goa",
    state: "Goa",
    country: "India",
    address: "Sinquerim, Candolim, Goa 403515",
    description: "Charming terracotta-roofed cottages and Romanesque architecture nestled amidst palm-fringed tropical gardens in North Goa.",
    starRating: 5,
    officialBookingUrl: "https://www.tajhotels.com/en-in/taj/taj-holiday-village-goa/",
    latitude: 15.5028,
    longitude: 73.7681,
    heroImage: "https://images.unsplash.com/photo-1540541338287-41700207dee6?auto=format&fit=crop&w=1600&q=80",
    galleryImages: []
  },
  {
    id: "taj-palace-new-delhi",
    canonicalName: "Taj Palace",
    slug: "taj-palace-new-delhi",
    brand: "Taj",
    city: "New Delhi",
    state: "Delhi",
    country: "India",
    address: "2 Sardar Patel Marg, Diplomatic Enclave, New Delhi 110021",
    description: "Spread over six acres of lush parkland in New Delhi's exclusive diplomatic enclave, host to world leaders and heads of state.",
    starRating: 5,
    officialBookingUrl: "https://www.tajhotels.com/en-in/taj/taj-palace-new-delhi/",
    latitude: 28.5968,
    longitude: 77.1734,
    heroImage: "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1600&q=80",
    galleryImages: []
  },
  {
    id: "taj-mahal-hotel-new-delhi",
    canonicalName: "The Taj Mahal Hotel (Taj Mansingh)",
    slug: "taj-mahal-hotel-new-delhi",
    brand: "Taj",
    city: "New Delhi",
    state: "Delhi",
    country: "India",
    address: "Number One, Mansingh Road, New Delhi 110011",
    description: "An iconic symbol of Lutyens' Delhi hospitality, located in the heart of the national capital close to India Gate.",
    starRating: 5,
    officialBookingUrl: "https://www.tajhotels.com/en-in/taj/taj-mahal-hotel-new-delhi/",
    latitude: 28.6053,
    longitude: 77.2255,
    heroImage: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1600&q=80",
    galleryImages: []
  },
  {
    id: "taj-falaknuma-palace-hyderabad",
    canonicalName: "Taj Falaknuma Palace",
    slug: "taj-falaknuma-palace-hyderabad",
    brand: "Taj",
    city: "Hyderabad",
    state: "Telangana",
    country: "India",
    address: "Engine Bowli, Falaknuma, Hyderabad 500053",
    description: "The 'Mirror of the Sky', an Italian marble palace elevated 2,000 feet above Hyderabad, restored to Nizam royal grandeur.",
    starRating: 5,
    officialBookingUrl: "https://www.tajhotels.com/en-in/taj/taj-falaknuma-palace-hyderabad/",
    latitude: 17.3314,
    longitude: 78.4677,
    heroImage: "https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1600&q=80",
    galleryImages: []
  },
  {
    id: "taj-krishna-hyderabad",
    canonicalName: "Taj Krishna",
    slug: "taj-krishna-hyderabad",
    brand: "Taj",
    city: "Hyderabad",
    state: "Telangana",
    country: "India",
    address: "Road No. 1, Banjara Hills, Hyderabad 500034",
    description: "Distinguished luxury hotel in Banjara Hills surrounded by manicured lawns and serene water bodies.",
    starRating: 5,
    officialBookingUrl: "https://www.tajhotels.com/en-in/taj/taj-krishna-hyderabad/",
    latitude: 17.4168,
    longitude: 78.4483,
    heroImage: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1600&q=80",
    galleryImages: []
  },
  {
    id: "taj-west-end-bengaluru",
    canonicalName: "Taj West End",
    slug: "taj-west-end-bengaluru",
    brand: "Taj",
    city: "Bengaluru",
    state: "Karnataka",
    country: "India",
    address: "25 Race Course Road, Bengaluru 560001",
    description: "Founded in 1887, an oasis of 20 acres of flora and century-old trees in central Bengaluru.",
    starRating: 5,
    officialBookingUrl: "https://www.tajhotels.com/en-in/taj/taj-west-end-bengaluru/",
    latitude: 12.9839,
    longitude: 77.5855,
    heroImage: "https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=1600&q=80",
    galleryImages: []
  },
  {
    id: "taj-coromandel-chennai",
    canonicalName: "Taj Coromandel",
    slug: "taj-coromandel-chennai",
    brand: "Taj",
    city: "Chennai",
    state: "Tamil Nadu",
    country: "India",
    address: "37 Mahatma Gandhi Rd, Nungambakkam, Chennai 600034",
    description: "The grand dame of Chennai hospitality, celebrating South Indian art, architecture and culinary traditions.",
    starRating: 5,
    officialBookingUrl: "https://www.tajhotels.com/en-in/taj/taj-coromandel-chennai/",
    latitude: 13.0601,
    longitude: 80.2464,
    heroImage: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1600&q=80",
    galleryImages: []
  },
  {
    id: "taj-fishermans-cove-resort-spa-chennai",
    canonicalName: "Taj Fisherman's Cove Resort & Spa",
    slug: "taj-fishermans-cove-resort-spa-chennai",
    brand: "Taj",
    city: "Chennai",
    state: "Tamil Nadu",
    country: "India",
    address: "Covelong Beach, East Coast Road, Chennai 603112",
    description: "Built on the ramparts of an old Dutch fort right on the golden sands of the Bay of Bengal coastline.",
    starRating: 5,
    officialBookingUrl: "https://www.tajhotels.com/en-in/taj/taj-fishermans-cove-chennai/",
    latitude: 12.7937,
    longitude: 80.2528,
    heroImage: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1600&q=80",
    galleryImages: []
  },
  {
    id: "taj-bengal-kolkata",
    canonicalName: "Taj Bengal",
    slug: "taj-bengal-kolkata",
    brand: "Taj",
    city: "Kolkata",
    state: "West Bengal",
    country: "India",
    address: "34B Belvedere Road, Alipore, Kolkata 700027",
    description: "An elegant atrium hotel in the diplomatic neighborhood of Alipore, adorned with fine Bengali antiques and art.",
    starRating: 5,
    officialBookingUrl: "https://www.tajhotels.com/en-in/taj/taj-bengal-kolkata/",
    latitude: 22.5323,
    longitude: 88.3328,
    heroImage: "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1600&q=80",
    galleryImages: []
  },
  {
    id: "taj-ganges-varanasi",
    canonicalName: "Taj Ganges",
    slug: "taj-ganges-varanasi",
    brand: "Taj",
    city: "Varanasi",
    state: "Uttar Pradesh",
    country: "India",
    address: "Nadesar Palace Grounds, Varanasi 221002",
    description: "Set in 12 acres of tranquil gardens in the ancient holy city, offering a serene haven close to the Ghats.",
    starRating: 5,
    officialBookingUrl: "https://www.tajhotels.com/en-in/taj/taj-ganges-varanasi/",
    latitude: 25.3347,
    longitude: 82.9866,
    heroImage: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=1600&q=80",
    galleryImages: []
  },
  {
    id: "taj-rishikesh-resort-spa-uttarakhand",
    canonicalName: "Taj Rishikesh Resort & Spa",
    slug: "taj-rishikesh-resort-spa-uttarakhand",
    brand: "Taj",
    city: "Rishikesh",
    state: "Uttarakhand",
    country: "India",
    address: "Vill-Singthali, Post-Byasi, District Tehri Garhwal, Rishikesh 249192",
    description: "A Himalayan sanctuary perched on the banks of the sacred Ganges river with panoramic views of forested mountain ridges.",
    starRating: 5,
    officialBookingUrl: "https://www.tajhotels.com/en-in/taj/taj-rishikesh-resort-and-spa/",
    latitude: 30.0869,
    longitude: 78.5085,
    heroImage: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1600&q=80",
    galleryImages: []
  },
  {
    id: "taj-bekal-resort-spa-kerala",
    canonicalName: "Taj Bekal Resort & Spa",
    slug: "taj-bekal-resort-spa-kerala",
    brand: "Taj",
    city: "Bekal",
    state: "Kerala",
    country: "India",
    address: "Kappil Beach, Thekkekara, Bekal 671319",
    description: "Inspired by traditional Kettuvallam houseboats, nestled where the Kerala backwaters gently meet the Arabian Sea.",
    starRating: 5,
    officialBookingUrl: "https://www.tajhotels.com/en-in/taj/taj-bekal-resort-and-spa/",
    latitude: 12.3916,
    longitude: 75.0253,
    heroImage: "https://images.unsplash.com/photo-1540541338287-41700207dee6?auto=format&fit=crop&w=1600&q=80",
    galleryImages: []
  },
  {
    id: "taj-green-cove-resort-spa-kovalam",
    canonicalName: "Taj Green Cove Resort & Spa",
    slug: "taj-green-cove-resort-spa-kovalam",
    brand: "Taj",
    city: "Kovalam",
    state: "Kerala",
    country: "India",
    address: "G. V. Raja Vattappara Road, Kovalam 695527",
    description: "Perched on a seaside hillock with cottages offering breathtaking views of the coastline and lagoon in Kovalam.",
    starRating: 5,
    officialBookingUrl: "https://www.tajhotels.com/en-in/taj/taj-green-cove-resort-kovalam/",
    latitude: 8.4069,
    longitude: 76.9744,
    heroImage: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1600&q=80",
    galleryImages: []
  },
  {
    id: "taj-madikeri-resort-spa-coorg",
    canonicalName: "Taj Madikeri Resort & Spa",
    slug: "taj-madikeri-resort-spa-coorg",
    brand: "Taj",
    city: "Coorg",
    state: "Karnataka",
    country: "India",
    address: "1st Monnangeri, Galibeedu Road, Madikeri 571201",
    description: "Set 4,000 feet above sea level amidst 180 acres of pristine rainforest in the Western Ghats.",
    starRating: 5,
    officialBookingUrl: "https://www.tajhotels.com/en-in/taj/taj-madikeri-resort-and-spa/",
    latitude: 12.4412,
    longitude: 75.7196,
    heroImage: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1600&q=80",
    galleryImages: []
  },
  {
    id: "taj-swarna-amritsar",
    canonicalName: "Taj Swarna",
    slug: "taj-swarna-amritsar",
    brand: "Taj",
    city: "Amritsar",
    state: "Punjab",
    country: "India",
    address: "Plot No. C-1, Amritshree, Majitha Road, Amritsar 143001",
    description: "Contemporary luxury embodying the hospitality and warmth of Punjab, located near the revered Golden Temple.",
    starRating: 5,
    officialBookingUrl: "https://www.tajhotels.com/en-in/taj/taj-swarna-amritsar/",
    latitude: 31.6548,
    longitude: 74.8872,
    heroImage: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1600&q=80",
    galleryImages: []
  },
  {
    id: "taj-city-centre-gurugram",
    canonicalName: "Taj City Centre",
    slug: "taj-city-centre-gurugram",
    brand: "Taj",
    city: "Gurugram",
    state: "Haryana",
    country: "India",
    address: "Plot No. 1, Sector 44, Gurugram 122004",
    description: "Modern architectural triumph in the heart of Millennium City with fine dining and luxury wellness.",
    starRating: 5,
    officialBookingUrl: "https://www.tajhotels.com/en-in/taj/taj-city-centre-gurugram/",
    latitude: 28.4552,
    longitude: 77.0674,
    heroImage: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1600&q=80",
    galleryImages: []
  },
  {
    id: "taj-chandigarh",
    canonicalName: "Taj Chandigarh",
    slug: "taj-chandigarh",
    brand: "Taj",
    city: "Chandigarh",
    state: "Chandigarh",
    country: "India",
    address: "Block No. 9, Sector 17-A, Chandigarh 160017",
    description: "Reflecting Le Corbusier's modern city vision with warm Taj hospitality in the prime commercial heart of Chandigarh.",
    starRating: 5,
    officialBookingUrl: "https://www.tajhotels.com/en-in/taj/taj-chandigarh/",
    latitude: 30.7416,
    longitude: 76.7828,
    heroImage: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=1600&q=80",
    galleryImages: []
  },
  {
    id: "taj-hotel-convention-centre-agra",
    canonicalName: "Taj Hotel & Convention Centre",
    slug: "taj-hotel-convention-centre-agra",
    brand: "Taj",
    city: "Agra",
    state: "Uttar Pradesh",
    country: "India",
    address: "Taj East Gate Road, Agra 282001",
    description: "Located within walking distance of the Taj Mahal, featuring an infinity pool with direct views of the iconic monument.",
    starRating: 5,
    officialBookingUrl: "https://www.tajhotels.com/en-in/taj/taj-hotel-convention-centre-agra/",
    latitude: 27.1623,
    longitude: 78.0531,
    heroImage: "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1600&q=80",
    galleryImages: []
  },
  {
    id: "taj-corbett-resort-spa-uttarakhand",
    canonicalName: "Taj Corbett Resort & Spa",
    slug: "taj-corbett-resort-spa-uttarakhand",
    brand: "Taj",
    city: "Corbett",
    state: "Uttarakhand",
    country: "India",
    address: "Zero Garjia, Dhikuli, Ramnagar 244715",
    description: "Nestled in the foothills of the Himalayas along the Kosi River, at the threshold of India's oldest national park.",
    starRating: 5,
    officialBookingUrl: "https://www.tajhotels.com/en-in/taj/taj-corbett-resort-and-spa/",
    latitude: 29.4312,
    longitude: 79.1367,
    heroImage: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1600&q=80",
    galleryImages: []
  },
  {
    id: "taj-theog-resort-spa-shimla",
    canonicalName: "Taj Theog Resort & Spa",
    slug: "taj-theog-resort-spa-shimla",
    brand: "Taj",
    city: "Shimla",
    state: "Himachal Pradesh",
    country: "India",
    address: "Tehsil Theog, District Shimla, Himachal Pradesh 171201",
    description: "Perched on a ridge at 7,000 feet with 360-degree vistas of cedar forests, terraced apple orchards and snow-clad peaks.",
    starRating: 5,
    officialBookingUrl: "https://www.tajhotels.com/en-in/taj/taj-theog-resort-and-spa-shimla/",
    latitude: 31.1218,
    longitude: 77.3542,
    heroImage: "https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=1600&q=80",
    galleryImages: []
  },
  {
    id: "taj-chia-kutir-resort-spa-darjeeling",
    canonicalName: "Taj Chia Kutir Resort & Spa",
    slug: "taj-chia-kutir-resort-spa-darjeeling",
    brand: "Taj",
    city: "Darjeeling",
    state: "West Bengal",
    country: "India",
    address: "Makaibari Tea Estate, Kurseong, Darjeeling 734203",
    description: "Spread over 22 rolling acres in the historic Makaibari Tea Estate with views of Mount Kanchenjunga.",
    starRating: 5,
    officialBookingUrl: "https://www.tajhotels.com/en-in/taj/taj-chia-kutir-resort-and-spa-darjeeling/",
    latitude: 26.8833,
    longitude: 88.2778,
    heroImage: "https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1600&q=80",
    galleryImages: []
  }
];

export async function seedCanonicalCatalog() {
  console.log(`Seeding canonical Taj property catalog (${CANONICAL_TAJ_CATALOG.length} properties)...`);

  for (const item of CANONICAL_TAJ_CATALOG) {
    const hotel = await prisma.hotel.upsert({
      where: { id: item.id },
      update: {
        canonicalName: item.canonicalName,
        slug: item.slug,
        brand: item.brand,
        city: item.city,
        state: item.state,
        country: item.country,
        address: item.address,
        description: item.description,
        starRating: item.starRating,
        officialBookingUrl: item.officialBookingUrl,
        latitude: item.latitude,
        longitude: item.longitude,
      },
      create: {
        id: item.id,
        canonicalName: item.canonicalName,
        slug: item.slug,
        brand: item.brand,
        city: item.city,
        state: item.state,
        country: item.country,
        address: item.address,
        description: item.description,
        starRating: item.starRating,
        officialBookingUrl: item.officialBookingUrl,
        latitude: item.latitude,
        longitude: item.longitude,
      },
    });

    // Seed Hero Asset
    await prisma.hotelAsset.deleteMany({
      where: { hotelId: hotel.id },
    });

    await prisma.hotelAsset.create({
      data: {
        hotelId: hotel.id,
        type: "hero",
        url: item.heroImage,
        source: "taj_official",
        altText: `${item.canonicalName}, ${item.city}`,
        licenseStatus: "official_media",
      },
    });

    // Seed Gallery Assets
    for (const galleryUrl of item.galleryImages) {
      await prisma.hotelAsset.create({
        data: {
          hotelId: hotel.id,
          type: "gallery",
          url: galleryUrl,
          source: "taj_official",
          altText: `${item.canonicalName} Gallery`,
          licenseStatus: "official_media",
        },
      });
    }

    // Seed canonical standard rooms for Property Resolver inventory baseline
    const standardRooms = [
      { canonicalRoomName: "Deluxe Room", sourceRoomName: "Deluxe King / Twin Room" },
      { canonicalRoomName: "Luxury Room", sourceRoomName: "Luxury Heritage / Palace Room" },
      { canonicalRoomName: "Taj Club Room", sourceRoomName: "Taj Club Room with Lounge Access" },
      { canonicalRoomName: "Executive Suite", sourceRoomName: "Executive Palace Suite" },
    ];

    for (const room of standardRooms) {
      await prisma.room.upsert({
        where: {
          hotelId_canonicalRoomName: {
            hotelId: hotel.id,
            canonicalRoomName: room.canonicalRoomName,
          },
        },
        update: {},
        create: {
          hotelId: hotel.id,
          canonicalRoomName: room.canonicalRoomName,
          sourceRoomName: room.sourceRoomName,
          capacityAdults: 2,
          capacityChildren: 1,
        },
      });
    }
  }

  // Seed canonical RatePlans
  const canonicalRates = [
    {
      canonicalRateName: "Best Available Rate",
      sourceRateName: "Best Available Rate (Room Only)",
      rateCode: "BAR",
      mealPlan: "Room only",
      cancellationPolicy: "Flexible cancellation up to 48 hours prior to check-in",
      isFlexible: true,
    },
    {
      canonicalRateName: "Breakfast Inclusive Rate",
      sourceRateName: "Taj Bed & Breakfast Experience",
      rateCode: "CP",
      mealPlan: "Breakfast included",
      cancellationPolicy: "Flexible cancellation up to 48 hours prior to check-in",
      isFlexible: true,
    },
    {
      canonicalRateName: "Taj Experiential Dining Rate",
      sourceRateName: "Half Board Experiential Stay",
      rateCode: "MAP",
      mealPlan: "Breakfast & Dinner included",
      cancellationPolicy: "Flexible cancellation up to 72 hours prior to check-in",
      isFlexible: true,
    },
    {
      canonicalRateName: "Advance Purchase Non-Refundable",
      sourceRateName: "Early Booker Non-Refundable Rate",
      rateCode: "NREF",
      mealPlan: "Room only",
      cancellationPolicy: "Non-refundable once booked",
      isFlexible: false,
    },
  ];

  for (const rate of canonicalRates) {
    await prisma.ratePlan.upsert({
      where: {
        canonicalRateName_mealPlan_cancellationPolicy: {
          canonicalRateName: rate.canonicalRateName,
          mealPlan: rate.mealPlan,
          cancellationPolicy: rate.cancellationPolicy,
        },
      },
      update: {},
      create: rate,
    });
  }

  console.log(`Seeding completed successfully: 31 Taj properties, assets, standard rooms, and canonical rate plans.`);
}

async function main() {
  try {
    await seedCanonicalCatalog();
  } catch (e) {
    console.error("Seeding failed:", e);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

if (process.argv[1]?.endsWith('seed.ts')) {
  main();
}
