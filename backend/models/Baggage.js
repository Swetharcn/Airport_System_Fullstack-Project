const mongoose = require('mongoose');

/**
 * Baggage Schema
 * Represents a piece of checked baggage linked to a user and flight.
 * Tracks the full lifecycle from check-in to collection.
 */
const statusHistorySchema = new mongoose.Schema(
  {
    status: { type: String, required: true },
    location: { type: String, default: '' },
    note: { type: String, default: '' },
    updatedBy: { type: String, default: 'System' },
    timestamp: { type: Date, default: Date.now },
  },
  { _id: false }
);

const baggageSchema = new mongoose.Schema(
  {
    baggageId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
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
    tagNumber: {
      type: String,
      trim: true,
      default: '',
    },
    description: {
      type: String,
      trim: true,
      required: [true, 'Please describe the baggage'],
    },
    weight: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: [
        'Checked-in',
        'Security Screening',
        'Loaded on Aircraft',
        'In Transit',
        'Arrived at Destination',
        'At Baggage Claim Belt',
        'Collected',
        'Missing',
      ],
      default: 'Checked-in',
    },
    currentLocation: {
      type: String,
      default: 'Check-in Counter',
    },
    statusHistory: [statusHistorySchema],
    // Lost & Found integration
    isLinkedToLostItem: {
      type: Boolean,
      default: false,
    },
    lostItemId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'LostItem',
      default: null,
    },
  },
  { timestamps: true }
);

baggageSchema.index({ userId: 1, flightId: 1 });

module.exports = mongoose.model('Baggage', baggageSchema);
