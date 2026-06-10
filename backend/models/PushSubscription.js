const mongoose = require('mongoose');

/**
 * PushSubscription Schema
 * Stores Web Push subscriptions per user device.
 * One user can have multiple device subscriptions.
 */
const pushSubscriptionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    subscription: {
      // The full PushSubscription object from the browser
      endpoint: { type: String, required: true },
      expirationTime: { type: Number, default: null },
      keys: {
        p256dh: { type: String, required: true },
        auth:   { type: String, required: true },
      },
    },
    deviceHint: {
      // Browser/OS hint for display purposes
      type: String,
      default: 'Unknown Device',
    },
    active: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// A user + endpoint combination should be unique
pushSubscriptionSchema.index({ userId: 1, 'subscription.endpoint': 1 }, { unique: true });

module.exports = mongoose.model('PushSubscription', pushSubscriptionSchema);
