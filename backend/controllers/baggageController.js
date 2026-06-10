const Baggage = require('../models/Baggage');
const Flight = require('../models/Flight');
const { generateBaggageId, advanceBaggageStatus, STATUS_STAGES } = require('../services/baggageService');

/**
 * @desc    Register new baggage for a flight
 * @route   POST /api/baggage/register
 * @access  Private (Passenger)
 */
const registerBaggage = async (req, res, next) => {
  try {
    const { flightId, description, tagNumber, weight } = req.body;

    if (!flightId || !description) {
      return res.status(400).json({ success: false, message: 'Flight and description are required.' });
    }

    const flight = await Flight.findById(flightId);
    if (!flight) {
      return res.status(404).json({ success: false, message: 'Flight not found.' });
    }

    const baggageId = generateBaggageId();

    const baggage = await Baggage.create({
      baggageId,
      userId: req.user._id,
      flightId,
      description,
      tagNumber: tagNumber || baggageId,
      weight: weight || 0,
      status: 'Checked-in',
      currentLocation: 'Check-in Counter',
      statusHistory: [
        {
          status: 'Checked-in',
          location: 'Check-in Counter',
          note: 'Baggage registered at check-in.',
          updatedBy: req.user.name || 'Passenger',
          timestamp: new Date(),
        },
      ],
    });

    const populated = await Baggage.findById(baggage._id)
      .populate('flightId', 'flightNumber airlineName sourceAirport destinationAirport departureTime gate terminal')
      .populate('userId', 'name email');

    res.status(201).json({ success: true, data: populated, stages: STATUS_STAGES });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all baggage for the logged-in user
 * @route   GET /api/baggage/user/me
 * @access  Private (Passenger)
 */
const getUserBaggage = async (req, res, next) => {
  try {
    const items = await Baggage.find({ userId: req.user._id })
      .populate('flightId', 'flightNumber airlineName sourceAirport destinationAirport departureTime gate terminal flightStatus')
      .populate('lostItemId', 'trackingId status')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: items.length, data: items, stages: STATUS_STAGES });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update baggage status (Admin)
 * @route   PUT /api/baggage/:id/status
 * @access  Private (Admin)
 */
const updateBaggageStatus = async (req, res, next) => {
  try {
    const { status, location, note } = req.body;

    const validStatuses = [
      'Checked-in', 'Security Screening', 'Loaded on Aircraft',
      'In Transit', 'Arrived at Destination', 'At Baggage Claim Belt',
      'Collected', 'Missing',
    ];

    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: `Invalid status. Must be one of: ${validStatuses.join(', ')}` });
    }

    const baggage = await Baggage.findById(req.params.id);
    if (!baggage) {
      return res.status(404).json({ success: false, message: 'Baggage not found.' });
    }

    const updated = await advanceBaggageStatus(
      baggage, status, location,
      note || `Status updated to ${status}`,
      req.user.name || 'Admin'
    );

    const populated = await Baggage.findById(updated._id)
      .populate('flightId', 'flightNumber airlineName')
      .populate('userId', 'name email')
      .populate('lostItemId', 'trackingId status');

    res.status(200).json({ success: true, data: populated });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all baggage for a specific flight (Admin)
 * @route   GET /api/baggage/flight/:flightId
 * @access  Private (Admin)
 */
const getFlightBaggage = async (req, res, next) => {
  try {
    const items = await Baggage.find({ flightId: req.params.flightId })
      .populate('userId', 'name email')
      .populate('flightId', 'flightNumber airlineName')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: items.length, data: items });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all baggage (Admin overview)
 * @route   GET /api/baggage
 * @access  Private (Admin)
 */
const getAllBaggage = async (req, res, next) => {
  try {
    const items = await Baggage.find()
      .populate('userId', 'name email')
      .populate('flightId', 'flightNumber airlineName departureTime')
      .sort({ createdAt: -1 })
      .limit(100);

    res.status(200).json({ success: true, count: items.length, data: items, stages: STATUS_STAGES });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  registerBaggage,
  getUserBaggage,
  updateBaggageStatus,
  getFlightBaggage,
  getAllBaggage,
};
