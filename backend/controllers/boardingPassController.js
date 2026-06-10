const BoardingPass = require('../models/BoardingPass');
const PushSubscription = require('../models/PushSubscription');
const AirportService = require('../models/AirportService');
const Flight = require('../models/Flight');
const { getGateZone } = require('../services/boardingScheduler');

/**
 * @desc    Add a new boarding pass
 * @route   POST /api/boarding-pass
 * @access  Private (Passenger)
 */
const addBoardingPass = async (req, res, next) => {
  try {
    const { flightId, passengerName, seatNumber, boardingClass, boardingTime, gate, passCode } = req.body;

    if (!flightId || !passengerName || !boardingTime) {
      return res.status(400).json({ success: false, message: 'Flight, passenger name, and boarding time are required.' });
    }

    const flight = await Flight.findById(flightId);
    if (!flight) return res.status(404).json({ success: false, message: 'Flight not found.' });

    // Auto-use flight gate if not provided
    const resolvedGate = gate || flight.gate;

    // Generate a simple barcode-style pass code if not provided
    const resolvedPassCode = passCode || `BP-${flight.flightNumber}-${Date.now().toString(36).toUpperCase()}`;

    const pass = await BoardingPass.create({
      userId: req.user._id,
      flightId,
      passengerName,
      seatNumber: seatNumber || 'TBA',
      boardingClass: boardingClass || 'Economy',
      boardingTime: new Date(boardingTime),
      gate: resolvedGate,
      passCode: resolvedPassCode,
    });

    const populated = await BoardingPass.findById(pass._id)
      .populate('flightId', 'flightNumber airlineName sourceAirport destinationAirport departureTime terminal gate aircraft');

    res.status(201).json({ success: true, data: populated });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all boarding passes for the logged-in user
 * @route   GET /api/boarding-pass
 * @access  Private (Passenger)
 */
const getUserBoardingPasses = async (req, res, next) => {
  try {
    const passes = await BoardingPass.find({ userId: req.user._id })
      .populate('flightId', 'flightNumber airlineName sourceAirport destinationAirport departureTime arrivalTime terminal gate flightStatus aircraft')
      .sort({ boardingTime: 1 });

    // Attach nearby services for each pass
    const enriched = await Promise.all(
      passes.map(async (pass) => {
        const passObj = pass.toObject();
        const gateZone = getGateZone(pass.gate);
        passObj.gateZone = gateZone;

        // Find services in same terminal
        if (gateZone?.terminal) {
          const services = await AirportService.find({
            location: { $regex: gateZone.terminal, $options: 'i' },
          }).limit(6).select('serviceName category location description icon rating');
          passObj.nearbyServices = services;
        } else {
          passObj.nearbyServices = [];
        }

        return passObj;
      })
    );

    res.status(200).json({ success: true, count: enriched.length, data: enriched });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete a boarding pass
 * @route   DELETE /api/boarding-pass/:id
 * @access  Private (Passenger)
 */
const deleteBoardingPass = async (req, res, next) => {
  try {
    const pass = await BoardingPass.findOne({ _id: req.params.id, userId: req.user._id });
    if (!pass) return res.status(404).json({ success: false, message: 'Boarding pass not found.' });
    await pass.deleteOne();
    res.status(200).json({ success: true, message: 'Boarding pass deleted.' });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Register a push subscription for the current device
 * @route   POST /api/boarding-pass/push-subscribe
 * @access  Private (Passenger)
 */
const subscribePush = async (req, res, next) => {
  try {
    const { subscription, deviceHint } = req.body;
    if (!subscription?.endpoint || !subscription?.keys?.p256dh || !subscription?.keys?.auth) {
      return res.status(400).json({ success: false, message: 'Invalid push subscription object.' });
    }

    // Upsert: update if same endpoint exists, otherwise create
    await PushSubscription.findOneAndUpdate(
      { userId: req.user._id, 'subscription.endpoint': subscription.endpoint },
      { subscription, deviceHint: deviceHint || 'Unknown Device', active: true },
      { upsert: true, new: true }
    );

    res.status(200).json({ success: true, message: 'Push subscription registered.' });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Unsubscribe a push endpoint
 * @route   POST /api/boarding-pass/push-unsubscribe
 * @access  Private (Passenger)
 */
const unsubscribePush = async (req, res, next) => {
  try {
    const { endpoint } = req.body;
    await PushSubscription.findOneAndUpdate(
      { userId: req.user._id, 'subscription.endpoint': endpoint },
      { active: false }
    );
    res.status(200).json({ success: true, message: 'Unsubscribed from push notifications.' });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get the VAPID public key for client-side subscription setup
 * @route   GET /api/boarding-pass/vapid-public-key
 * @access  Public
 */
const getVapidPublicKey = (req, res) => {
  res.json({ success: true, publicKey: process.env.VAPID_PUBLIC_KEY });
};

/**
 * @desc    Send a test push to all user devices (for demo/testing)
 * @route   POST /api/boarding-pass/test-push
 * @access  Private (Passenger)
 */
const sendTestPush = async (req, res, next) => {
  try {
    const { sendPushToUser } = require('../services/pushService');
    const count = await sendPushToUser(req.user._id.toString(), {
      title: '✅ AirAssist Push Test',
      body: 'Your device is successfully subscribed! You will receive boarding alerts 30 minutes before departure.',
      icon: '/icons/icon-192x192.png',
      data: { url: '/boarding-pass' },
    });
    res.json({ success: true, message: `Test push sent to ${count} device(s).`, count });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  addBoardingPass,
  getUserBoardingPasses,
  deleteBoardingPass,
  subscribePush,
  unsubscribePush,
  getVapidPublicKey,
  sendTestPush,
};
