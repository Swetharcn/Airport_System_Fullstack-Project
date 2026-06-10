const Baggage = require('../models/Baggage');
const LostItem = require('../models/LostItem');
const Flight = require('../models/Flight');

/**
 * Baggage Tracking Service
 * Handles business logic for baggage lifecycle management.
 */

/**
 * Generate a unique baggage ID in the format BG-XXXXXX
 */
const generateBaggageId = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let id = 'BG-';
  for (let i = 0; i < 6; i++) {
    id += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `${id}-${Date.now().toString(36).toUpperCase()}`;
};

/**
 * Advance baggage status and log to history.
 * If status → 'Missing', auto-create a Lost & Found entry.
 */
const advanceBaggageStatus = async (baggage, newStatus, location, note, updatedBy) => {
  baggage.status = newStatus;
  baggage.currentLocation = location || baggage.currentLocation;

  baggage.statusHistory.push({
    status: newStatus,
    location: location || baggage.currentLocation,
    note: note || '',
    updatedBy: updatedBy || 'Admin',
    timestamp: new Date(),
  });

  // Auto-link to Lost & Found if baggage is marked Missing
  if (newStatus === 'Missing' && !baggage.isLinkedToLostItem) {
    try {
      const flight = await Flight.findById(baggage.flightId);
      const flightRef = flight ? `Flight ${flight.flightNumber}` : 'Unknown Flight';

      const lostItem = await LostItem.create({
        trackingId: `LF-BAG-${baggage.baggageId}`,
        itemName: `Missing Baggage (Tag: ${baggage.baggageId})`,
        description: baggage.description,
        category: 'Bag',
        location: baggage.currentLocation || flightRef,
        status: 'Reported',
        userId: baggage.userId,
        contactEmail: '',
        statusHistory: [
          {
            status: 'Reported',
            changedBy: 'System',
            note: `Auto-created from baggage tracking. Bag last seen at: ${baggage.currentLocation}`,
          },
        ],
      });

      baggage.isLinkedToLostItem = true;
      baggage.lostItemId = lostItem._id;
    } catch (err) {
      console.error('Failed to auto-create Lost & Found entry:', err.message);
    }
  }

  return baggage.save();
};

/**
 * Get the ordered list of status stages for the progress stepper
 */
const STATUS_STAGES = [
  { key: 'Checked-in', label: 'Checked In', location: 'Check-in Counter', icon: '🧳' },
  { key: 'Security Screening', label: 'Security Screening', location: 'Security Zone', icon: '🔍' },
  { key: 'Loaded on Aircraft', label: 'Loaded on Aircraft', location: 'Tarmac', icon: '✈️' },
  { key: 'In Transit', label: 'In Transit', location: 'En Route', icon: '🛫' },
  { key: 'Arrived at Destination', label: 'Arrived', location: 'Destination Airport', icon: '🛬' },
  { key: 'At Baggage Claim Belt', label: 'At Claim Belt', location: 'Baggage Claim Hall', icon: '🔄' },
  { key: 'Collected', label: 'Collected', location: 'Passenger', icon: '✅' },
];

module.exports = {
  generateBaggageId,
  advanceBaggageStatus,
  STATUS_STAGES,
};
