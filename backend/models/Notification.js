const mongoose = require('mongoose');

/**
 * Notification Schema
 * Stores in-app notifications for users (boarding reminders, lost-found updates, etc.)
 */
const notificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      maxlength: 100,
    },
    message: {
      type: String,
      required: true,
      maxlength: 500,
    },
    type: {
      type: String,
      enum: ['boarding', 'gate-change', 'delay', 'cancellation', 'lost-found', 'system'],
      default: 'system',
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    // Additional context (flightNumber, gate, trackingId, etc.)
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    // Icon/emoji for the notification type
    icon: {
      type: String,
      default: '🔔',
    },
  },
  { timestamps: true }
);

// Index for efficient unread count queries
notificationSchema.index({ userId: 1, isRead: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);
