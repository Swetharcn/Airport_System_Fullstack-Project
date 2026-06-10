const mongoose = require('mongoose');

/**
 * LostItem Schema
 * Full lost and found management — passengers report, admins resolve.
 */
const lostItemSchema = new mongoose.Schema(
  {
    itemName: {
      type: String,
      required: [true, 'Item name is required'],
      trim: true,
      maxlength: 100,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      maxlength: 500,
    },
    category: {
      type: String,
      enum: ['Electronics', 'Bag', 'Document', 'Clothing', 'Jewellery', 'Keys', 'Other'],
      default: 'Other',
    },
    location: {
      type: String,
      required: [true, 'Location where item was lost is required'],
      trim: true,
    },
    status: {
      type: String,
      enum: ['Reported', 'In Progress', 'Found', 'Resolved', 'Closed'],
      default: 'Reported',
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    contactEmail: {
      type: String,
      trim: true,
      lowercase: true,
    },
    contactPhone: {
      type: String,
      trim: true,
    },
    // Admin fills in when item is found
    foundLocation: {
      type: String,
      trim: true,
    },
    adminNotes: {
      type: String,
      maxlength: 500,
    },
    // Optional: base64 or URL image
    imageUrl: {
      type: String,
    },
    // Track all status changes with timestamps
    statusHistory: [
      {
        status:    String,
        changedAt: { type: Date, default: Date.now },
        changedBy: String,
        note:      String,
      },
    ],
    trackingId: {
      type: String,
      unique: true,
    },
  },
  { timestamps: true }
);

// Auto-generate tracking ID before saving
lostItemSchema.pre('save', function (next) {
  if (!this.trackingId) {
    this.trackingId = 'LF-' + Date.now().toString(36).toUpperCase();
  }
  next();
});

module.exports = mongoose.model('LostItem', lostItemSchema);
