/**
 * Seed Script — Smart Airport Assistant System
 * Populates the database with sample flights, services, and an admin user.
 *
 * Usage: npm run seed
 */
require('dotenv').config();
const mongoose = require('mongoose');
const User     = require('./models/User');
const Flight   = require('./models/Flight');
const AirportService = require('./models/AirportService');
const LostItem = require('./models/LostItem');
const CrowdDensity = require('./models/CrowdDensity');
const Notification = require('./models/Notification');
const FlightBooking = require('./models/FlightBooking');
const Baggage = require('./models/Baggage');

const { initializeZones } = require('./services/crowdService');

// ─── Sample Data ───────────────────────────────────────────────────────────────
const flights = [
  {
    flightNumber: 'AI202',
    airlineName: 'Air India',
    sourceAirport: 'Bengaluru International Airport (BLR)',
    destinationAirport: 'Delhi (DEL)',
    departureTime: new Date('2026-05-10T06:00:00'),
    arrivalTime: new Date('2026-05-10T08:00:00'),
    terminal: 'Terminal 1',
    gate: 'A12',
    flightStatus: 'On Time',
    aircraft: 'Boeing 787',
    price: 4500,
  },
  {
    flightNumber: 'SG401',
    airlineName: 'SpiceJet',
    sourceAirport: 'Bengaluru International Airport (BLR)',
    destinationAirport: 'Kolkata (CCU)',
    departureTime: new Date('2026-05-10T09:30:00'),
    arrivalTime: new Date('2026-05-10T12:15:00'),
    terminal: 'Terminal 1',
    gate: 'B5',
    flightStatus: 'Boarding',
    aircraft: 'Boeing 737',
    price: 4800,
  },
  {
    flightNumber: 'EK512',
    airlineName: 'Emirates',
    sourceAirport: 'Bengaluru International Airport (BLR)',
    destinationAirport: 'Dubai (DXB)',
    departureTime: new Date('2026-05-10T14:45:00'),
    arrivalTime: new Date('2026-05-10T17:30:00'),
    terminal: 'Terminal B',
    gate: 'C22',
    flightStatus: 'On Time',
    aircraft: 'Airbus A380',
    price: 28000,
  },
  {
    flightNumber: '6E315',
    airlineName: 'IndiGo',
    sourceAirport: 'Bengaluru International Airport (BLR)',
    destinationAirport: 'Hyderabad (HYD)',
    departureTime: new Date('2026-05-10T11:15:00'),
    arrivalTime: new Date('2026-05-10T12:30:00'),
    terminal: 'Terminal 1',
    gate: 'D8',
    flightStatus: 'Delayed',
    aircraft: 'Airbus A320',
    price: 2800,
  },
  {
    flightNumber: 'LH763',
    airlineName: 'Lufthansa',
    sourceAirport: 'Bengaluru International Airport (BLR)',
    destinationAirport: 'Frankfurt (FRA)',
    departureTime: new Date('2026-05-10T23:55:00'),
    arrivalTime: new Date('2026-05-11T06:00:00'),
    terminal: 'Terminal B',
    gate: 'E3',
    flightStatus: 'On Time',
    aircraft: 'Boeing 747',
    price: 55000,
  },
  {
    flightNumber: 'QR574',
    airlineName: 'Qatar Airways',
    sourceAirport: 'Bengaluru International Airport (BLR)',
    destinationAirport: 'Doha (DOH)',
    departureTime: new Date('2026-05-10T03:30:00'),
    arrivalTime: new Date('2026-05-10T06:15:00'),
    terminal: 'Terminal C',
    gate: 'F7',
    flightStatus: 'Departed',
    aircraft: 'Airbus A350',
    price: 32000,
  },
  {
    flightNumber: 'AI115',
    airlineName: 'Air India',
    sourceAirport: 'Bengaluru International Airport (BLR)',
    destinationAirport: 'London (LHR)',
    departureTime: new Date('2026-05-10T20:00:00'),
    arrivalTime: new Date('2026-05-11T00:45:00'),
    terminal: 'Terminal B',
    gate: 'G11',
    flightStatus: 'On Time',
    aircraft: 'Boeing 777',
    price: 48000,
  },
  {
    flightNumber: 'UK942',
    airlineName: 'Vistara',
    sourceAirport: 'Bengaluru International Airport (BLR)',
    destinationAirport: 'Mumbai (BOM)',
    departureTime: new Date('2026-05-10T16:00:00'),
    arrivalTime: new Date('2026-05-10T18:30:00'),
    terminal: 'Terminal A',
    gate: 'H4',
    flightStatus: 'Cancelled',
    aircraft: 'Airbus A320neo',
    price: 5200,
  },
  // ─── NEW FLIGHTS ───────────────────────────────────────────────────────────────
  {
    flightNumber: 'SQ421',
    airlineName: 'Singapore Airlines',
    sourceAirport: 'Bengaluru International Airport (BLR)',
    destinationAirport: 'Singapore (SIN)',
    departureTime: new Date('2026-05-10T01:30:00'),
    arrivalTime: new Date('2026-05-10T08:45:00'),
    terminal: 'Terminal B',
    gate: 'B12',
    flightStatus: 'On Time',
    aircraft: 'Airbus A350',
    price: 42000,
  },
  {
    flightNumber: 'AI560',
    airlineName: 'Air India',
    sourceAirport: 'Bengaluru International Airport (BLR)',
    destinationAirport: 'Pune (PNQ)',
    departureTime: new Date('2026-05-10T07:15:00'),
    arrivalTime: new Date('2026-05-10T09:00:00'),
    terminal: 'Terminal 1',
    gate: 'A5',
    flightStatus: 'Boarding',
    aircraft: 'Boeing 737',
    price: 3800,
  },
  {
    flightNumber: '6E744',
    airlineName: 'IndiGo',
    sourceAirport: 'Bengaluru International Airport (BLR)',
    destinationAirport: 'Goa (GOI)',
    departureTime: new Date('2026-05-10T10:00:00'),
    arrivalTime: new Date('2026-05-10T12:15:00'),
    terminal: 'Terminal 2',
    gate: 'D3',
    flightStatus: 'On Time',
    aircraft: 'Airbus A320',
    price: 4100,
  },
  {
    flightNumber: 'BA117',
    airlineName: 'British Airways',
    sourceAirport: 'Bengaluru International Airport (BLR)',
    destinationAirport: 'London (LHR)',
    departureTime: new Date('2026-05-10T21:30:00'),
    arrivalTime: new Date('2026-05-11T03:30:00'),
    terminal: 'Terminal B',
    gate: 'C8',
    flightStatus: 'Delayed',
    aircraft: 'Boeing 787',
    price: 62000,
  },
  {
    flightNumber: 'G8201',
    airlineName: 'Go First',
    sourceAirport: 'Bengaluru International Airport (BLR)',
    destinationAirport: 'Delhi (DEL)',
    departureTime: new Date('2026-05-10T13:45:00'),
    arrivalTime: new Date('2026-05-10T16:00:00'),
    terminal: 'Terminal 1',
    gate: 'E6',
    flightStatus: 'On Time',
    aircraft: 'Airbus A320neo',
    price: 3600,
  },
  {
    flightNumber: 'TK718',
    airlineName: 'Turkish Airlines',
    sourceAirport: 'Bengaluru International Airport (BLR)',
    destinationAirport: 'Istanbul (IST)',
    departureTime: new Date('2026-05-10T04:00:00'),
    arrivalTime: new Date('2026-05-10T09:30:00'),
    terminal: 'Terminal B',
    gate: 'F2',
    flightStatus: 'Departed',
    aircraft: 'Boeing 777',
    price: 51000,
  },
  {
    flightNumber: 'SG808',
    airlineName: 'SpiceJet',
    sourceAirport: 'Bengaluru International Airport (BLR)',
    destinationAirport: 'Kochi (COK)',
    departureTime: new Date('2026-05-10T15:30:00'),
    arrivalTime: new Date('2026-05-10T16:45:00'),
    terminal: 'Terminal 1',
    gate: 'A9',
    flightStatus: 'On Time',
    aircraft: 'Boeing 737',
    price: 2600,
  },
  {
    flightNumber: 'AI308',
    airlineName: 'Air India',
    sourceAirport: 'Bengaluru International Airport (BLR)',
    destinationAirport: 'New York (JFK)',
    departureTime: new Date('2026-05-10T22:30:00'),
    arrivalTime: new Date('2026-05-11T06:45:00'),
    terminal: 'Terminal B',
    gate: 'G14',
    flightStatus: 'On Time',
    aircraft: 'Boeing 787',
    price: 78000,
  },
  // ─── 10 NEW DESTINATIONS FROM BENGALURU ──────────────────────────────────────
  {
    flightNumber: 'EY212',
    airlineName: 'Etihad Airways',
    sourceAirport: 'Bengaluru International Airport (BLR)',
    destinationAirport: 'Abu Dhabi (AUH)',
    departureTime: new Date('2026-05-10T02:15:00'),
    arrivalTime: new Date('2026-05-10T04:30:00'),
    terminal: 'Terminal 2',
    gate: 'C14',
    flightStatus: 'On Time',
    aircraft: 'Boeing 787',
    price: 26000,
  },
  {
    flightNumber: 'MH194',
    airlineName: 'Malaysia Airlines',
    sourceAirport: 'Bengaluru International Airport (BLR)',
    destinationAirport: 'Kuala Lumpur (KUL)',
    departureTime: new Date('2026-05-10T23:00:00'),
    arrivalTime: new Date('2026-05-11T05:30:00'),
    terminal: 'Terminal 2',
    gate: 'D11',
    flightStatus: 'On Time',
    aircraft: 'Airbus A330',
    price: 38000,
  },
  {
    flightNumber: '6E881',
    airlineName: 'IndiGo',
    sourceAirport: 'Bengaluru International Airport (BLR)',
    destinationAirport: 'Jaipur (JAI)',
    departureTime: new Date('2026-05-10T15:30:00'),
    arrivalTime: new Date('2026-05-10T17:45:00'),
    terminal: 'Terminal 1',
    gate: 'B9',
    flightStatus: 'On Time',
    aircraft: 'Airbus A320',
    price: 3900,
  },
  {
    flightNumber: 'UK305',
    airlineName: 'Vistara',
    sourceAirport: 'Bengaluru International Airport (BLR)',
    destinationAirport: 'Ahmedabad (AMD)',
    departureTime: new Date('2026-05-10T10:45:00'),
    arrivalTime: new Date('2026-05-10T12:45:00'),
    terminal: 'Terminal 1',
    gate: 'A9',
    flightStatus: 'On Time',
    aircraft: 'Airbus A320neo',
    price: 4200,
  },
  {
    flightNumber: 'AI777',
    airlineName: 'Air India',
    sourceAirport: 'Bengaluru International Airport (BLR)',
    destinationAirport: 'Bangkok (BKK)',
    departureTime: new Date('2026-05-10T18:45:00'),
    arrivalTime: new Date('2026-05-10T23:50:00'),
    terminal: 'Terminal 2',
    gate: 'E10',
    flightStatus: 'On Time',
    aircraft: 'Boeing 787',
    price: 22000,
  },
  {
    flightNumber: 'UK109',
    airlineName: 'Vistara',
    sourceAirport: 'Bengaluru International Airport (BLR)',
    destinationAirport: 'Bhubaneswar (BBI)',
    departureTime: new Date('2026-05-10T12:00:00'),
    arrivalTime: new Date('2026-05-10T14:30:00'),
    terminal: 'Terminal 1',
    gate: 'C3',
    flightStatus: 'On Time',
    aircraft: 'Airbus A320neo',
    price: 4600,
  },
  {
    flightNumber: '6E200',
    airlineName: 'IndiGo',
    sourceAirport: 'Bengaluru International Airport (BLR)',
    destinationAirport: 'Chennai (MAA)',
    departureTime: new Date('2026-05-10T08:00:00'),
    arrivalTime: new Date('2026-05-10T09:10:00'),
    terminal: 'Terminal 1',
    gate: 'D4',
    flightStatus: 'Boarding',
    aircraft: 'Airbus A320',
    price: 2200,
  },
  {
    flightNumber: 'AI310',
    airlineName: 'Air India',
    sourceAirport: 'Bengaluru International Airport (BLR)',
    destinationAirport: 'Trivandrum (TRV)',
    departureTime: new Date('2026-05-10T14:00:00'),
    arrivalTime: new Date('2026-05-10T15:15:00'),
    terminal: 'Terminal 1',
    gate: 'A3',
    flightStatus: 'On Time',
    aircraft: 'Boeing 737',
    price: 2900,
  },
  {
    flightNumber: 'SG212',
    airlineName: 'SpiceJet',
    sourceAirport: 'Bengaluru International Airport (BLR)',
    destinationAirport: 'Chandigarh (IXC)',
    departureTime: new Date('2026-05-10T07:00:00'),
    arrivalTime: new Date('2026-05-10T09:30:00'),
    terminal: 'Terminal 1',
    gate: 'B2',
    flightStatus: 'On Time',
    aircraft: 'Boeing 737',
    price: 5100,
  },
  {
    flightNumber: 'AI999',
    airlineName: 'Air India',
    sourceAirport: 'Bengaluru International Airport (BLR)',
    destinationAirport: 'Nagpur (NAG)',
    departureTime: new Date('2026-05-10T16:30:00'),
    arrivalTime: new Date('2026-05-10T18:00:00'),
    terminal: 'Terminal 1',
    gate: 'C6',
    flightStatus: 'Delayed',
    aircraft: 'Airbus A320',
    price: 3400,
  },
];

const services = [
  {
    serviceName: 'Spice Garden Restaurant',
    category: 'Restaurant',
    location: 'Terminal A, Level 2',
    description: 'Authentic Indian cuisine with a wide variety of North and South Indian dishes. Perfect for a hearty meal before your flight.',
    openingHours: '24/7',
    contact: '+91 22 6685 1111',
    icon: '🍛',
    rating: 4.5,
  },
  {
    serviceName: 'Café Aroma',
    category: 'Restaurant',
    location: 'All Terminals, Level 1',
    description: 'Premium coffee, fresh sandwiches, pastries, and quick bites. Your perfect travel companion for any time of day.',
    openingHours: '05:00 AM – 11:00 PM',
    icon: '☕',
    rating: 4.2,
  },
  {
    serviceName: 'Sky Lounge',
    category: 'Lounge',
    location: 'Terminal B, Level 3',
    description: 'Premium passenger lounge offering complimentary dining, premium spirits, spa access, and high-speed Wi-Fi. Access via Priority Pass or Business/First Class ticket.',
    openingHours: '24/7',
    icon: '🛋️',
    rating: 4.8,
  },
  {
    serviceName: 'Pearl Executive Lounge',
    category: 'Lounge',
    location: 'Terminal A, Level 2',
    description: 'Comfortable seating, business center, shower facilities, and gourmet refreshments. Available for ₹2,500 per visit.',
    openingHours: '05:00 AM – 12:00 AM',
    icon: '💎',
    rating: 4.6,
  },
  {
    serviceName: 'Terminal A – Domestic',
    category: 'Terminal',
    location: 'Level 1 & 2',
    description: 'Handles all domestic departures for IndiGo, SpiceJet, and Air India domestic routes. Features 24 check-in counters and 8 security lanes.',
    openingHours: '24/7',
    icon: '🏢',
    rating: 4.0,
  },
  {
    serviceName: 'Terminal B – International',
    category: 'Terminal',
    location: 'Level 1, 2 & 3',
    description: 'Dedicated international terminal featuring immigration, customs, 3 lounges, and premium duty-free shopping.',
    openingHours: '24/7',
    icon: '🌏',
    rating: 4.3,
  },
  {
    serviceName: 'World of Fashion',
    category: 'Retail',
    location: 'Terminal B, Level 2',
    description: 'Duty-free shopping featuring luxury brands, electronics, perfumes, chocolates, and Indian souvenirs.',
    openingHours: '06:00 AM – 10:00 PM',
    icon: '🛍️',
    rating: 4.1,
  },
  {
    serviceName: 'Airport Medical Clinic',
    category: 'Medical',
    location: 'Terminal B, Level 1',
    description: '24/7 medical facility with licensed doctors, emergency care, pharmacy, and travel health advisory services.',
    openingHours: '24/7',
    contact: '+91 22 6685 9999',
    icon: '🏥',
    rating: 4.7,
  },
  {
    serviceName: 'Metro Station Connect',
    category: 'Transport',
    location: 'Terminal B, Basement Level',
    description: 'Direct metro connectivity to the city center. Trains run every 12 minutes between 5 AM and midnight.',
    openingHours: '05:00 AM – 12:00 AM',
    icon: '🚇',
    rating: 4.4,
  },
  {
    serviceName: 'Pre-Paid Taxi Booth',
    category: 'Transport',
    location: 'Outside all terminal exits',
    description: 'Government-regulated prepaid taxi services available at fixed rates. Safer alternative to bargaining outside.',
    openingHours: '24/7',
    icon: '🚖',
    rating: 3.9,
  },
  {
    serviceName: 'SBI ATM & Currency Exchange',
    category: 'Banking',
    location: 'Terminal A & B, Level 1',
    description: 'SBI ATMs, HDFC forex counters, and Thomas Cook currency exchange. Competitive rates for 30+ currencies.',
    openingHours: '24/7',
    icon: '💳',
    rating: 4.0,
  },
  {
    serviceName: 'Transit Hotel AirInn',
    category: 'Hotel',
    location: 'Terminal B, Level 3',
    description: 'Ideal for long layovers. Private rooms with shower, TV, and breakfast included. Book from 3 hours to overnight.',
    openingHours: '24/7',
    contact: '+91 22 6685 7777',
    icon: '🏨',
    rating: 4.3,
  },
  // ─── NEW SERVICES ──────────────────────────────────────────────────────────────
  {
    serviceName: 'Planet Sub',
    category: 'Restaurant',
    location: 'Terminal A, Level 1',
    description: 'Fresh-made submarine sandwiches, wraps, and salads. Quick service ideal for passengers in a hurry.',
    openingHours: '06:00 AM – 10:00 PM',
    icon: '🥖',
    rating: 4.1,
  },
  {
    serviceName: 'The Beer Garden',
    category: 'Restaurant',
    location: 'Terminal B, Level 2',
    description: 'Premium craft beers, cocktails, and international pub-style food. Lively atmosphere for the waiting traveller.',
    openingHours: '10:00 AM – 11:00 PM',
    icon: '🍺',
    rating: 4.3,
  },
  {
    serviceName: 'Indira Gandhi Prayer Room',
    category: 'Terminal',
    location: 'Terminal B, Level 1 (near Gate B14)',
    description: 'Quiet multi-faith prayer and meditation room available to all passengers. Ablution facilities are provided.',
    openingHours: '24/7',
    icon: '🕌',
    rating: 4.6,
  },
  {
    serviceName: 'Kids Play Zone',
    category: 'Terminal',
    location: 'Terminal A, Level 2',
    description: 'Safe and supervised play area for children up to 12 years. Features games, slides, and a reading corner.',
    openingHours: '08:00 AM – 09:00 PM',
    icon: '🧸',
    rating: 4.7,
  },
  {
    serviceName: 'Tech Mart Electronics',
    category: 'Retail',
    location: 'Terminal B Duty Free, Level 2',
    description: 'Latest smartphones, tablets, headphones, and travel accessories. All at duty-free prices.',
    openingHours: '07:00 AM – 10:00 PM',
    icon: '📱',
    rating: 4.0,
  },
  {
    serviceName: 'Refresh & Spa',
    category: 'Hotel',
    location: 'Terminal A, Level 3',
    description: 'Quick massage, manicure, and grooming services. No appointment needed. Perfect for the jet-lagged traveller.',
    openingHours: '06:00 AM – 11:00 PM',
    icon: '💆',
    rating: 4.5,
  },
  {
    serviceName: 'Airport Shuttle Bus',
    category: 'Transport',
    location: 'Terminal A & B, Ground Floor',
    description: 'Inter-terminal shuttle runs every 10 minutes. Free for all ticketed passengers. Also covers car park zones.',
    openingHours: '24/7',
    icon: '🚌',
    rating: 3.8,
  },
  {
    serviceName: 'Baggage Wrapping Service',
    category: 'Terminal',
    location: 'Terminal A & B, Check-in Area',
    description: 'Professional luggage wrapping for extra security. Stretch-wrap service available in 3 colours.',
    openingHours: '05:00 AM – 11:00 PM',
    contact: '+91 22 6685 4444',
    icon: '🎁',
    rating: 4.2,
  },
];

// ─── Seed Function ─────────────────────────────────────────────────────────────
const seedDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Flight.deleteMany({});
    await AirportService.deleteMany({});
    await LostItem.deleteMany({});
    await CrowdDensity.deleteMany({});
    await Notification.deleteMany({});
    await FlightBooking.deleteMany({});
    await Baggage.deleteMany({});
    console.log('🗑️  Cleared existing data');

    // Create admin user — plain text password, pre-save hook hashes it
    const adminUser = await User.create({
      name: 'Airport Admin',
      email: 'admin@airport.com',
      password: 'Admin@123',
      role: 'admin',
    });

    // Create sample passenger
    const passengerUser = await User.create({
      name: 'Admin',
      email: 'admin_passenger@example.com',
      password: 'Passenger@123',
      role: 'passenger',
    });

    // Insert flights and services
    await Flight.insertMany(flights);
    const createdServices = await AirportService.insertMany(services);
    console.log(`✅ Seeded ${createdServices.length} airport services`);

    // --- Seed New Intelligent Modules ---
    
    // 1. Initialize Crowd Zones
    await initializeZones();

    // 2. Sample Lost & Found Items
    await LostItem.create([
      {
        trackingId: 'LF-' + Date.now().toString(36).toUpperCase() + '-1',
        itemName: 'MacBook Pro 16"',
        description: 'Silver MacBook with a stickers on the back.',
        category: 'Electronics',
        location: 'Security Checkpoint A',
        status: 'In Progress',
        userId: passengerUser._id,
        contactEmail: 'admin_passenger@example.com',
        statusHistory: [
          { status: 'Reported', changedBy: 'Admin', note: 'Left at security bin.' },
          { status: 'In Progress', changedBy: 'Admin', note: 'Checking CCTV footage.' }
        ]
      },
      {
        trackingId: 'LF-' + Date.now().toString(36).toUpperCase() + '-2',
        itemName: 'Brown Leather Wallet',
        description: 'Contains ID and cards. Brand: Tommy Hilfiger',
        category: 'Other',
        location: 'Gate B2 seating area',
        status: 'Found',
        userId: passengerUser._id,
        foundLocation: 'Lost & Found Desk, Terminal A',
        adminNotes: 'Found by cleaning staff. Ready for pickup.',
        statusHistory: [
          { status: 'Reported', changedBy: 'Admin', note: 'Dropped near gate.' },
          { status: 'Found', changedBy: 'Admin', note: 'Item recovered.' }
        ]
      },
      {
        trackingId: 'LF-' + Date.now().toString(36).toUpperCase() + '-3',
        itemName: 'Red Samsonite Suitcase',
        description: 'Medium size, 4 wheels, has a blue ribbon on handle.',
        category: 'Bag',
        location: 'Baggage Claim Carousel 3',
        status: 'Reported',
        userId: passengerUser._id,
        contactEmail: 'admin_passenger@example.com',
        statusHistory: [
          { status: 'Reported', changedBy: 'Admin', note: 'Did not arrive on flight AI202.' }
        ]
      },
      {
        trackingId: 'LF-' + Date.now().toString(36).toUpperCase() + '-4',
        itemName: 'Apple AirPods Pro',
        description: 'White case with a silicone Batman cover.',
        category: 'Electronics',
        location: 'Restroom near Gate A5',
        status: 'Resolved',
        userId: passengerUser._id,
        foundLocation: 'Lost & Found Desk, Terminal B',
        adminNotes: 'Picked up by passenger.',
        statusHistory: [
          { status: 'Reported', changedBy: 'Admin', note: 'Left on sink counter.' },
          { status: 'Found', changedBy: 'Admin', note: 'Turned in by janitor.' },
          { status: 'Resolved', changedBy: 'Admin', note: 'Returned to owner.' }
        ]
      },
      {
        trackingId: 'LF-' + Date.now().toString(36).toUpperCase() + '-5',
        itemName: 'Black Passport holder',
        description: 'Contains US Passport and some foreign currency.',
        category: 'Document',
        location: 'Duty Free Shop, Terminal B',
        status: 'In Progress',
        userId: passengerUser._id,
        contactEmail: 'admin_passenger@example.com',
        statusHistory: [
          { status: 'Reported', changedBy: 'Admin', note: 'Left at checkout counter.' },
          { status: 'In Progress', changedBy: 'Admin', note: 'Contacted Duty Free staff.' }
        ]
      },
      {
        trackingId: 'LF-' + Date.now().toString(36).toUpperCase() + '-6',
        itemName: 'Gold Chain Necklace',
        description: 'Thin gold chain with a small diamond pendant.',
        category: 'Jewellery',
        location: 'Security Checkpoint B',
        status: 'Found',
        userId: passengerUser._id,
        foundLocation: 'Security Office',
        adminNotes: 'Held in safe.',
        statusHistory: [
          { status: 'Reported', changedBy: 'Admin', note: 'Taken off for metal detector, forgot to pick up.' },
          { status: 'Found', changedBy: 'Admin', note: 'Secured by TSA.' }
        ]
      },
      {
        trackingId: 'LF-' + Date.now().toString(36).toUpperCase() + '-7',
        itemName: 'Navy Blue Blazer',
        description: 'Men\'s size L, Zara brand.',
        category: 'Clothing',
        location: 'Food Court - McDonald\'s',
        status: 'Reported',
        userId: passengerUser._id,
        contactEmail: 'admin_passenger@example.com',
        statusHistory: [
          { status: 'Reported', changedBy: 'Admin', note: 'Left on chair while eating.' }
        ]
      },
      {
        trackingId: 'LF-' + Date.now().toString(36).toUpperCase() + '-8',
        itemName: 'Set of House Keys',
        description: '3 keys on a red carabiner with a gym fob.',
        category: 'Keys',
        location: 'Terminal A Entrance Drop-off',
        status: 'Found',
        userId: passengerUser._id,
        foundLocation: 'Info Desk',
        adminNotes: 'Found outside near pillar 4.',
        statusHistory: [
          { status: 'Reported', changedBy: 'Admin', note: 'Dropped getting out of taxi.' },
          { status: 'Found', changedBy: 'Admin', note: 'Turned in by another passenger.' }
        ]
      },
      {
        trackingId: 'LF-' + Date.now().toString(36).toUpperCase() + '-9',
        itemName: 'Children\'s Teddy Bear',
        description: 'Brown bear missing one button eye.',
        category: 'Other',
        location: 'Play Area, Terminal B',
        status: 'Resolved',
        userId: passengerUser._id,
        adminNotes: 'Mailed to passenger.',
        statusHistory: [
          { status: 'Reported', changedBy: 'Admin', note: 'My daughter is crying.' },
          { status: 'Found', changedBy: 'Admin', note: 'Found in play pit.' },
          { status: 'Resolved', changedBy: 'Admin', note: 'Shipped to home address.' }
        ]
      },
      {
        trackingId: 'LF-' + Date.now().toString(36).toUpperCase() + '-10',
        itemName: 'Canon DSLR Camera',
        description: 'Black EOS Rebel T7 with kit lens.',
        category: 'Electronics',
        location: 'Gate A12 waiting area',
        status: 'In Progress',
        userId: passengerUser._id,
        contactEmail: 'admin_passenger@example.com',
        statusHistory: [
          { status: 'Reported', changedBy: 'Admin', note: 'Left under seat 5A.' },
          { status: 'In Progress', changedBy: 'Admin', note: 'Gate agent notified.' }
        ]
      },
      {
        trackingId: 'LF-' + Date.now().toString(36).toUpperCase() + '-11',
        itemName: 'Prescription Glasses',
        description: 'Tortoiseshell frames, Ray-Ban.',
        category: 'Other',
        location: 'Sky Lounge',
        status: 'Reported',
        userId: passengerUser._id,
        contactEmail: 'admin_passenger@example.com',
        statusHistory: [
          { status: 'Reported', changedBy: 'Admin', note: 'Left on coffee table.' }
        ]
      },
      {
        trackingId: 'LF-' + Date.now().toString(36).toUpperCase() + '-12',
        itemName: 'Leather Briefcase',
        description: 'Brown leather, contains work laptop and files.',
        category: 'Bag',
        location: 'Terminal A restrooms',
        status: 'Found',
        userId: passengerUser._id,
        foundLocation: 'Lost & Found Desk',
        adminNotes: 'Turned in by staff.',
        statusHistory: [
          { status: 'Reported', changedBy: 'Admin', note: 'Left on hook in stall.' },
          { status: 'Found', changedBy: 'Admin', note: 'Recovered.' }
        ]
      }
    ]);
    console.log(`✅ Seeded sample Lost & Found items`);

    // 3. Sample Notifications for passenger
    await Notification.create([
      {
        userId: passengerUser._id,
        title: 'Welcome to AirAssist',
        message: 'Your smart airport journey begins here. You can now register for flight reminders.',
        type: 'system',
        icon: '👋'
      },
      {
        userId: passengerUser._id,
        title: 'Lost Item Update',
        message: 'Great news! Your Brown Leather Wallet has been found.',
        type: 'lost-found',
        icon: '🧳',
        isRead: false
      }
    ]);
    console.log(`✅ Seeded sample Notifications`);

    // 4. Sample Baggage Records
    const seededFlights = await Flight.find().limit(4);
    if (seededFlights.length > 0) {
      const now = new Date();
      const baggageSamples = [
        {
          baggageId: 'BG-ALPHA1-' + Date.now().toString(36).toUpperCase(),
          userId: passengerUser._id,
          flightId: seededFlights[0]._id,
          description: 'Large black Samsonite trolley bag with red ribbon.',
          tagNumber: 'TAG-A001',
          weight: 23,
          status: 'At Baggage Claim Belt',
          currentLocation: 'Baggage Claim Belt 3',
          statusHistory: [
            { status: 'Checked-in', location: 'Check-in Counter', note: 'Bag accepted', updatedBy: 'Staff', timestamp: new Date(now - 5*3600000) },
            { status: 'Security Screening', location: 'Security Zone', note: 'Cleared screening', updatedBy: 'System', timestamp: new Date(now - 4*3600000) },
            { status: 'Loaded on Aircraft', location: 'Tarmac', note: 'Loaded into hold', updatedBy: 'Ground Crew', timestamp: new Date(now - 3*3600000) },
            { status: 'In Transit', location: 'En Route', note: 'Flight departed', updatedBy: 'System', timestamp: new Date(now - 2*3600000) },
            { status: 'Arrived at Destination', location: 'Destination Airport', note: 'Flight landed', updatedBy: 'System', timestamp: new Date(now - 1*3600000) },
            { status: 'At Baggage Claim Belt', location: 'Baggage Claim Belt 3', note: 'Ready for collection', updatedBy: 'Ground Staff', timestamp: new Date(now - 0.5*3600000) },
          ],
        },
        {
          baggageId: 'BG-BETA2-' + Date.now().toString(36).toUpperCase(),
          userId: passengerUser._id,
          flightId: seededFlights[1]?._id || seededFlights[0]._id,
          description: 'Blue hard-shell cabin bag with travel stickers.',
          tagNumber: 'TAG-B002',
          weight: 15,
          status: 'In Transit',
          currentLocation: 'En Route',
          statusHistory: [
            { status: 'Checked-in', location: 'Check-in Counter', note: 'Bag checked', updatedBy: 'Staff', timestamp: new Date(now - 3*3600000) },
            { status: 'Security Screening', location: 'Security Zone', note: 'Cleared', updatedBy: 'System', timestamp: new Date(now - 2.5*3600000) },
            { status: 'Loaded on Aircraft', location: 'Tarmac', note: 'Loaded', updatedBy: 'Ground Crew', timestamp: new Date(now - 2*3600000) },
            { status: 'In Transit', location: 'En Route', note: 'Aircraft in flight', updatedBy: 'System', timestamp: new Date(now - 1*3600000) },
          ],
        },
        {
          baggageId: 'BG-GAMMA3-' + Date.now().toString(36).toUpperCase(),
          userId: passengerUser._id,
          flightId: seededFlights[2]?._id || seededFlights[0]._id,
          description: 'Vintage brown leather duffel bag.',
          tagNumber: 'TAG-C003',
          weight: 12,
          status: 'Loaded on Aircraft',
          currentLocation: 'Tarmac Hold',
          statusHistory: [
            { status: 'Checked-in', location: 'Check-in Counter', note: 'Bag accepted', updatedBy: 'Staff', timestamp: new Date(now - 1.5*3600000) },
            { status: 'Security Screening', location: 'Security Zone', note: 'Cleared', updatedBy: 'System', timestamp: new Date(now - 1*3600000) },
            { status: 'Loaded on Aircraft', location: 'Tarmac Hold', note: 'Loaded in bay 4', updatedBy: 'Ground Crew', timestamp: new Date(now - 0.3*3600000) },
          ],
        },
        {
          baggageId: 'BG-DELTA4-' + Date.now().toString(36).toUpperCase(),
          userId: passengerUser._id,
          flightId: seededFlights[3]?._id || seededFlights[0]._id,
          description: 'Grey backpack with laptop sleeve.',
          tagNumber: 'TAG-D004',
          weight: 8,
          status: 'Collected',
          currentLocation: 'Passenger',
          statusHistory: [
            { status: 'Checked-in', location: 'Check-in Counter', note: 'Checked in', updatedBy: 'Staff', timestamp: new Date(now - 8*3600000) },
            { status: 'Security Screening', location: 'Security Zone', note: 'Passed', updatedBy: 'System', timestamp: new Date(now - 7*3600000) },
            { status: 'Loaded on Aircraft', location: 'Tarmac', note: 'Loaded', updatedBy: 'Ground Crew', timestamp: new Date(now - 6*3600000) },
            { status: 'In Transit', location: 'En Route', note: 'In flight', updatedBy: 'System', timestamp: new Date(now - 5*3600000) },
            { status: 'Arrived at Destination', location: 'Destination Airport', note: 'Arrived', updatedBy: 'System', timestamp: new Date(now - 4*3600000) },
            { status: 'At Baggage Claim Belt', location: 'Belt 1', note: 'On belt', updatedBy: 'Ground Staff', timestamp: new Date(now - 3*3600000) },
            { status: 'Collected', location: 'Passenger', note: 'Picked up by passenger', updatedBy: 'Staff', timestamp: new Date(now - 2*3600000) },
          ],
        },
      ];
      await Baggage.insertMany(baggageSamples);
      console.log(`✅ Seeded ${baggageSamples.length} sample baggage records`);
    }

    console.log(`✅ Seeded ${flights.length} flights`);

    console.log('\n📋 Demo Accounts:');
    console.log('  Admin    → admin@airport.com  / Admin@123');
    console.log('  Passenger → admin_passenger@example.com   / Passenger@123');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seed error:', error.message);
    process.exit(1);
  }
};

seedDatabase();

