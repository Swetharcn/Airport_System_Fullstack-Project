const mongoose = require('mongoose');

/**
 * FlightBooking Schema
 * Tracks which flights a user has registered to receive boarding reminders for.
 * Separate from actual ticketing — this is purely for notification subscription.
 */
const flightBookingSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    flightId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Flight',
      required: true,
    },
    flightNumber: {
      type: String,
      required: true,
      uppercase: true,
    },
    seatNumber: {
      type: String,
      default: 'Not specified',
    },
    bookingRef: {
      type: String,
      unique: true,
    },
    // Track which reminder intervals have already been sent (prevent duplicates)
    reminders_sent: {
      at_90_min: { type: Boolean, default: false },
      at_60_min: { type: Boolean, default: false },
      at_30_min: { type: Boolean, default: false },
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// Ensure one registration per user per flight
flightBookingSchema.index({ userId: 1, flightId: 1 }, { unique: true });

// Auto-generate booking reference
flightBookingSchema.pre('save', function (next) {
  if (!this.bookingRef) {
    this.bookingRef = 'BK-' + this.flightNumber + '-' + Date.now().toString(36).toUpperCase();
  }
  next();
});

module.exports = mongoose.model('FlightBooking', flightBookingSchema);
