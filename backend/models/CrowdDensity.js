const mongoose = require('mongoose');

/**
 * CrowdDensity Schema
 * Stores real-time (simulated) crowd density data for each airport zone.
 * Extensible for IoT sensor integration — just replace the simulation with sensor feeds.
 */
const crowdDensitySchema = new mongoose.Schema(
  {
    zone: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    // 0–100 scale (0=empty, 100=max capacity)
    densityLevel: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },
    category: {
      type: String,
      enum: ['Low', 'Moderate', 'High', 'Critical'],
      default: 'Low',
    },
    // Grid position for heatmap rendering on the frontend
    coordinates: {
      x: { type: Number, default: 0 },
      y: { type: Number, default: 0 },
    },
    // Human-readable terminal area
    terminal: {
      type: String,
      enum: ['Terminal A', 'Terminal B', 'Terminal C', 'Common Area'],
      default: 'Common Area',
    },
    capacity: {
      type: Number,
      default: 500, // Max people the zone can hold
    },
    currentCount: {
      type: Number,
      default: 0,
    },
    lastUpdated: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// Helper to derive category from density level
crowdDensitySchema.methods.updateCategory = function () {
  if (this.densityLevel <= 30) this.category = 'Low';
  else if (this.densityLevel <= 60) this.category = 'Moderate';
  else if (this.densityLevel <= 80) this.category = 'High';
  else this.category = 'Critical';
  return this;
};

module.exports = mongoose.model('CrowdDensity', crowdDensitySchema);
