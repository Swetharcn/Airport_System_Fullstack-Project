const mongoose = require('mongoose');

/**
 * BoardingPass Schema
 * Stores a passenger's digital boarding pass linked to a flight.
 * Tracks push subscription and notification status.
 */
const boardingPassSchema = new mongoose.Schema(
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
    passengerName: {
      type: String,
      required: [true, 'Passenger name is required'],
      trim: true,
    },
    seatNumber: {
      type: String,
      trim: true,
      default: 'TBA',
    },
    boardingClass: {
      type: String,
      enum: ['Economy', 'Premium Economy', 'Business', 'First'],
      default: 'Economy',
    },
    gate: {
      type: String,
      trim: true,
    },
    boardingTime: {
      type: Date,
      required: [true, 'Boarding time is required'],
    },
    passCode: {
      type: String,
      trim: true,
    },
    // Push notification tracking
    notificationSent: {
      type: Boolean,
      default: false,
    },
    notificationSentAt: {
      type: Date,
      default: null,
    },
    // Email notification
    emailNotificationSent: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

boardingPassSchema.index({ userId: 1, boardingTime: 1 });

module.exports = mongoose.model('BoardingPass', boardingPassSchema);
