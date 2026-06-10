const mongoose = require('mongoose');

/**
 * Flight Schema
 * Represents a scheduled flight including route, timing, and operational status.
 */
const flightSchema = new mongoose.Schema(
  {
    flightNumber: {
      type: String,
      required: [true, 'Flight number is required'],
      unique: true,
      uppercase: true,
      trim: true,
    },
    airlineName: {
      type: String,
      required: [true, 'Airline name is required'],
      trim: true,
    },
    sourceAirport: {
      type: String,
      required: [true, 'Source airport is required'],
      trim: true,
    },
    destinationAirport: {
      type: String,
      required: [true, 'Destination airport is required'],
      trim: true,
    },
    departureTime: {
      type: Date,
      required: [true, 'Departure time is required'],
    },
    arrivalTime: {
      type: Date,
      required: [true, 'Arrival time is required'],
    },
    terminal: {
      type: String,
      required: [true, 'Terminal is required'],
      trim: true,
    },
    gate: {
      type: String,
      trim: true,
      default: 'TBA',
    },
    flightStatus: {
      type: String,
      enum: ['On Time', 'Delayed', 'Cancelled', 'Boarding', 'Departed', 'Arrived'],
      default: 'On Time',
    },
    aircraft: {
      type: String,
      default: 'Boeing 737',
    },
    price: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for fast flight search queries
flightSchema.index({ sourceAirport: 1, destinationAirport: 1, departureTime: 1 });
// Note: flightNumber already has a unique index via the `unique: true` field option

module.exports = mongoose.model('Flight', flightSchema);
