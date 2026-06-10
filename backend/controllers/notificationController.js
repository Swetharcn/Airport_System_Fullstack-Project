const FlightBooking = require('../models/FlightBooking');
const Notification = require('../models/Notification');
const Flight = require('../models/Flight');

/**
 * @desc    Register to receive boarding reminders for a flight
 * @route   POST /api/notifications/register-flight
 * @access  Private
 */
const registerFlight = async (req, res, next) => {
  try {
    const { flightId, seatNumber } = req.body;

    if (!flightId) {
      return res.status(400).json({ success: false, message: 'Flight ID is required' });
    }

    const flight = await Flight.findById(flightId);
    if (!flight) {
      return res.status(404).json({ success: false, message: 'Flight not found' });
    }

    // Check if already registered
    const existing = await FlightBooking.findOne({ userId: req.user._id, flightId });
    if (existing) {
      return res.status(400).json({ success: false, message: 'You are already registered for reminders for this flight' });
    }

    const booking = await FlightBooking.create({
      userId: req.user._id,
      flightId: flight._id,
      flightNumber: flight.flightNumber,
      seatNumber: seatNumber || 'Not specified'
    });

    // Send an immediate welcome notification
    await Notification.create({
      userId: req.user._id,
      title: 'Flight Registration Successful',
      message: `You will now receive boarding reminders for flight ${flight.flightNumber}.`,
      type: 'system',
      icon: '✅',
      metadata: { bookingRef: booking.bookingRef }
    });

    res.status(201).json({ success: true, data: booking });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all active flight registrations for logged-in user
 * @route   GET /api/notifications/my-flights
 * @access  Private
 */
const getMyFlights = async (req, res, next) => {
  try {
    const bookings = await FlightBooking.find({ userId: req.user._id, isActive: true })
      .populate('flightId')
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: bookings.length, data: bookings });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all in-app notifications for logged-in user
 * @route   GET /api/notifications
 * @access  Private
 */
const getMyNotifications = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit, 10) || 50;
    const notifications = await Notification.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .limit(limit);
    
    // Get unread count
    const unreadCount = await Notification.countDocuments({ userId: req.user._id, isRead: false });

    res.status(200).json({ 
      success: true, 
      count: notifications.length, 
      unreadCount,
      data: notifications 
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Mark a notification as read
 * @route   PUT /api/notifications/:id/read
 * @access  Private
 */
const markAsRead = async (req, res, next) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { isRead: true },
      { new: true, runValidators: true }
    );

    if (!notification) {
      return res.status(404).json({ success: false, message: 'Notification not found' });
    }

    res.status(200).json({ success: true, data: notification });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Mark all notifications as read
 * @route   PUT /api/notifications/read-all
 * @access  Private
 */
const markAllAsRead = async (req, res, next) => {
  try {
    await Notification.updateMany(
      { userId: req.user._id, isRead: false },
      { isRead: true }
    );
    res.status(200).json({ success: true, message: 'All notifications marked as read' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  registerFlight,
  getMyFlights,
  getMyNotifications,
  markAsRead,
  markAllAsRead
};
