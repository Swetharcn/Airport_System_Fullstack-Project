const Flight = require('../models/Flight');

// ─── Get All Flights (with filtering) ────────────────────────────────────────
/**
 * GET /api/flights
 * Public route. Supports query params: source, destination, date, status.
 */
const getFlights = async (req, res, next) => {
  try {
    const { source, destination, date, status, limit = 50, page = 1 } = req.query;
    const filter = {};

    if (source)      filter.sourceAirport      = { $regex: source,      $options: 'i' };
    if (destination) filter.destinationAirport = { $regex: destination, $options: 'i' };
    if (status)      filter.flightStatus       = status;

    // Filter by date (full day range)
    if (date) {
      const start = new Date(date);
      const end   = new Date(date);
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);
      filter.departureTime = { $gte: start, $lte: end };
    }

    const skip  = (parseInt(page) - 1) * parseInt(limit);
    const total = await Flight.countDocuments(filter);
    const flights = await Flight.find(filter)
      .sort({ departureTime: 1 })
      .skip(skip)
      .limit(parseInt(limit));

    res.status(200).json({
      success: true,
      count: flights.length,
      total,
      pages: Math.ceil(total / parseInt(limit)),
      currentPage: parseInt(page),
      data: flights,
    });
  } catch (error) {
    next(error);
  }
};

// ─── Get Single Flight ────────────────────────────────────────────────────────
const getFlightById = async (req, res, next) => {
  try {
    const flight = await Flight.findById(req.params.id);
    if (!flight) {
      return res.status(404).json({ success: false, message: 'Flight not found.' });
    }
    res.status(200).json({ success: true, data: flight });
  } catch (error) {
    next(error);
  }
};

// ─── Create Flight (Admin Only) ───────────────────────────────────────────────
/**
 * POST /api/flights
 */
const createFlight = async (req, res, next) => {
  try {
    const flight = await Flight.create(req.body);
    res.status(201).json({ success: true, message: 'Flight created successfully.', data: flight });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ success: false, message: `Flight number '${req.body.flightNumber}' already exists.` });
    }
    next(error);
  }
};

// ─── Update Flight (Admin Only) ───────────────────────────────────────────────
/**
 * PUT /api/flights/:id
 */
const updateFlight = async (req, res, next) => {
  try {
    const flight = await Flight.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!flight) {
      return res.status(404).json({ success: false, message: 'Flight not found.' });
    }
    res.status(200).json({ success: true, message: 'Flight updated successfully.', data: flight });
  } catch (error) {
    next(error);
  }
};

// ─── Delete Flight (Admin Only) ───────────────────────────────────────────────
/**
 * DELETE /api/flights/:id
 */
const deleteFlight = async (req, res, next) => {
  try {
    const flight = await Flight.findByIdAndDelete(req.params.id);
    if (!flight) {
      return res.status(404).json({ success: false, message: 'Flight not found.' });
    }
    res.status(200).json({ success: true, message: 'Flight deleted successfully.' });
  } catch (error) {
    next(error);
  }
};

module.exports = { getFlights, getFlightById, createFlight, updateFlight, deleteFlight };
