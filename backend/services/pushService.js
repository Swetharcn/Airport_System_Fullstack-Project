/**
 * Push Notification Service
 * Handles Web Push (VAPID) delivery to subscribed mobile/desktop devices.
 */
const webpush = require('web-push');

// Configure VAPID details once at module load
webpush.setVapidDetails(
  process.env.VAPID_SUBJECT || 'mailto:notifications@airassist.local',
  process.env.VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
);

/**
 * Send a push notification to a single PushSubscription document.
 * @param {Object} subDoc - PushSubscription mongoose document
 * @param {Object} payload - { title, body, icon, data }
 * @returns {boolean} success
 */
const sendPushToSubscription = async (subDoc, payload) => {
  try {
    await webpush.sendNotification(
      subDoc.subscription,
      JSON.stringify(payload),
      { TTL: 3600 } // keep notification valid for 1 hour if device is offline
    );
    return true;
  } catch (err) {
    // 410 Gone = subscription is no longer valid, mark inactive
    if (err.statusCode === 410 || err.statusCode === 404) {
      subDoc.active = false;
      await subDoc.save();
      console.log(`[Push] Removed expired subscription for endpoint: ${subDoc.subscription.endpoint.slice(0, 40)}...`);
    } else {
      console.error(`[Push] Error sending to ${subDoc.subscription.endpoint.slice(0, 40)}...:`, err.message);
    }
    return false;
  }
};

/**
 * Send a push notification to ALL active subscriptions for a user.
 * @param {string} userId - MongoDB ObjectId string
 * @param {Object} payload - { title, body, icon, badge, data }
 * @returns {number} count of successfully sent notifications
 */
const sendPushToUser = async (userId, payload) => {
  const PushSubscription = require('../models/PushSubscription');
  const subs = await PushSubscription.find({ userId, active: true });
  if (!subs.length) return 0;

  let sent = 0;
  await Promise.all(
    subs.map(async (sub) => {
      const ok = await sendPushToSubscription(sub, payload);
      if (ok) sent++;
    })
  );
  return sent;
};

/**
 * Build a boarding alert push payload
 */
const buildBoardingAlertPayload = (pass, flight) => ({
  title: `🛫 Boarding Now Open — ${flight.flightNumber}`,
  body: `Gate ${pass.gate || flight.gate} | Seat ${pass.seatNumber} | ${flight.sourceAirport} → ${flight.destinationAirport}\nPlease proceed to the gate now. Boarding closes in 30 minutes.`,
  icon: '/icons/icon-192x192.png',
  badge: '/icons/badge-72x72.png',
  data: {
    url: '/boarding-pass',
    flightNumber: flight.flightNumber,
    gate: pass.gate || flight.gate,
  },
  actions: [
    { action: 'navigate', title: '🗺️ Get Directions' },
    { action: 'dismiss', title: 'Dismiss' },
  ],
});

module.exports = { sendPushToUser, buildBoardingAlertPayload, sendPushToSubscription };
