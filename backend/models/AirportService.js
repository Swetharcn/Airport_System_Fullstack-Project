const mongoose = require('mongoose');

/**
 * AirportService Schema
 * Represents a service offered at the airport (restaurants, lounges, etc.).
 */
const airportServiceSchema = new mongoose.Schema(
  {
    serviceName: {
      type: String,
      required: [true, 'Service name is required'],
      trim: true,
      maxlength: [100, 'Service name cannot exceed 100 characters'],
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: ['Restaurant', 'Lounge', 'Terminal', 'Retail', 'Medical', 'Transport', 'Hotel', 'Banking'],
    },
    location: {
      type: String,
      required: [true, 'Location is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      maxlength: [500, 'Description cannot exceed 500 characters'],
    },
    openingHours: {
      type: String,
      default: '24/7',
    },
    contact: {
      type: String,
      default: '',
    },
    icon: {
      type: String,
      default: '🏢', // Emoji icon for the service category
    },
    rating: {
      type: Number,
      min: 0,
      max: 5,
      default: 4.0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Index for fast category-based filtering
airportServiceSchema.index({ category: 1, isActive: 1 });

module.exports = mongoose.model('AirportService', airportServiceSchema);
