const BoardingPass = require('../models/BoardingPass');
const AirportService = require('../models/AirportService');
const Flight = require('../models/Flight');
const { sendPushToUser, buildBoardingAlertPayload } = require('./pushService');

/**
 * Boarding Reminder Scheduler
 * Runs every minute. Sends push + email notifications 30 minutes before boarding.
 */

/**
 * Map gate identifiers to nearby service categories and node names
 * (matches MAP_COORDS from AirportMapSVG)
 */
const GATE_TO_ZONE = {
  // Terminal A gates
  'A1':  { terminal: 'Terminal A', nearbyNodes: ['Gate A1', 'Pearl Lounge', 'Cafe Aroma', 'Terminal A Plaza'] },
  'A2':  { terminal: 'Terminal A', nearbyNodes: ['Gate A2', 'Terminal A Plaza', 'Cafe Aroma', 'Food Court'] },
  'A5':  { terminal: 'Terminal A', nearbyNodes: ['Terminal A Plaza', 'Cafe Aroma', 'Pearl Lounge'] },
  'A9':  { terminal: 'Terminal A', nearbyNodes: ['Terminal A Plaza', 'Gate A1', 'Gate A2'] },
  'A12': { terminal: 'Terminal A', nearbyNodes: ['Terminal A Plaza', 'Cafe Aroma', 'Pearl Lounge'] },
  // Terminal B gates
  'B1':  { terminal: 'Terminal B', nearbyNodes: ['Gate B1', 'Sky Lounge', 'Spice Garden', 'Terminal B Plaza'] },
  'B2':  { terminal: 'Terminal B', nearbyNodes: ['Gate B2', 'Transfer Corridor', 'Food Court', 'Sky Lounge'] },
  'B5':  { terminal: 'Terminal B', nearbyNodes: ['Terminal B Plaza', 'Spice Garden', 'World of Fashion'] },
  'B12': { terminal: 'Terminal B', nearbyNodes: ['Gate B1', 'Sky Lounge', 'World of Fashion'] },
  'B14': { terminal: 'Terminal B', nearbyNodes: ['Gate B14', 'Prayer Room', 'Medical Clinic'] },
  'C8':  { terminal: 'Terminal B', nearbyNodes: ['Terminal B Plaza', 'Sky Lounge', 'Medical Clinic'] },
  'C22': { terminal: 'Terminal B', nearbyNodes: ['Terminal B Plaza', 'Spice Garden', 'World of Fashion'] },
  'D3':  { terminal: 'Terminal B', nearbyNodes: ['Terminal B Plaza', 'Food Court', 'Transfer Corridor'] },
  'D8':  { terminal: 'Terminal A', nearbyNodes: ['Terminal A Plaza', 'Cafe Aroma'] },
  'E3':  { terminal: 'Terminal B', nearbyNodes: ['Gate B2', 'Sky Lounge', 'Transfer Corridor'] },
  'E6':  { terminal: 'Terminal A', nearbyNodes: ['Terminal A Plaza', 'Pearl Lounge', 'Gate A2'] },
  'F2':  { terminal: 'Terminal B', nearbyNodes: ['Gate B1', 'Spice Garden', 'Sky Lounge'] },
  'F7':  { terminal: 'Terminal B', nearbyNodes: ['Terminal B Plaza', 'Medical Clinic'] },
  'G11': { terminal: 'Terminal B', nearbyNodes: ['Gate B2', 'Sky Lounge', 'Medical Clinic'] },
  'G14': { terminal: 'Terminal B', nearbyNodes: ['Gate B2', 'World of Fashion', 'Sky Lounge'] },
  'H4':  { terminal: 'Terminal A', nearbyNodes: ['Terminal A Plaza', 'Pearl Lounge', 'Cafe Aroma'] },
};

/**
 * Get gate zone info — falls back to Terminal B if gate not in map
 */
const getGateZone = (gateCode) => {
  if (!gateCode) return null;
  const normalized = gateCode.toUpperCase().replace(/^GATE\s*/i, '').trim();
  return GATE_TO_ZONE[normalized] || {
    terminal: gateCode.includes('A') ? 'Terminal A' : 'Terminal B',
    nearbyNodes: ['Food Court', 'Medical Clinic'],
  };
};

/**
 * Send boarding reminder: push notification + optional email
 */
const sendBoardingReminder = async (pass, flight) => {
  let sent = 0;

  // 1. Push notification to all subscribed devices
  try {
    const payload = buildBoardingAlertPayload(pass, flight);
    const pushCount = await sendPushToUser(pass.userId.toString(), payload);
    sent += pushCount;
    if (pushCount > 0) {
      console.log(`[Boarding Reminder] Push sent to ${pushCount} device(s) for ${flight.flightNumber}`);
    }
  } catch (err) {
    console.error('[Boarding Reminder] Push error:', err.message);
  }

  // 2. Email notification (nodemailer already configured)
  try {
    const { sendBoardingEmail } = require('./emailService');
    if (sendBoardingEmail) {
      await sendBoardingEmail(pass, flight);
      sent++;
      console.log(`[Boarding Reminder] Email sent for ${flight.flightNumber}`);
    }
  } catch (err) {
    // Email service may not be available — non-fatal
    console.warn('[Boarding Reminder] Email skipped:', err.message);
  }

  return sent;
};

/**
 * Main scheduler function — call this every minute via setInterval
 */
const checkBoardingReminders = async () => {
  try {
    const now = new Date();
    // Find boarding passes where boarding is 28-32 minutes away (± 2 min window)
    const windowStart = new Date(now.getTime() + 28 * 60 * 1000);
    const windowEnd   = new Date(now.getTime() + 32 * 60 * 1000);

    const duePasses = await BoardingPass.find({
      boardingTime:        { $gte: windowStart, $lte: windowEnd },
      notificationSent:    false,
    }).populate('flightId userId');

    for (const pass of duePasses) {
      if (!pass.flightId) continue;

      await sendBoardingReminder(pass, pass.flightId);

      // Mark notification as sent
      pass.notificationSent = true;
      pass.notificationSentAt = now;
      await pass.save();
    }

    if (duePasses.length > 0) {
      console.log(`[Boarding Scheduler] Processed ${duePasses.length} boarding reminder(s)`);
    }
  } catch (err) {
    console.error('[Boarding Scheduler] Error:', err.message);
  }
};

module.exports = { checkBoardingReminders, getGateZone, GATE_TO_ZONE };
