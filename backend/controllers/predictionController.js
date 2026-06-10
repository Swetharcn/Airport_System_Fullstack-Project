const Flight = require('../models/Flight');
const { predictDelay, predictGateChange } = require('../services/predictionService');

/**
 * @desc    Get full delay prediction for a flight
 * @route   GET /api/prediction/delay/:flightId
 * @access  Private (Passenger)
 */
const getDelayPrediction = async (req, res, next) => {
  try {
    const flight = await Flight.findById(req.params.flightId);
    if (!flight) {
      return res.status(404).json({ success: false, message: 'Flight not found.' });
    }

    const prediction = await predictDelay(flight);

    res.status(200).json({
      success: true,
      data: {
        flight: {
          id: flight._id,
          flightNumber: flight.flightNumber,
          airlineName: flight.airlineName,
          route: `${flight.sourceAirport} → ${flight.destinationAirport}`,
          departureTime: flight.departureTime,
          status: flight.flightStatus,
          aircraft: flight.aircraft,
        },
        prediction,
        disclaimer: 'This is a predicted value based on historical trends, rule-based analysis, and real-time congestion data. Actual outcomes may differ.',
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get gate change prediction for a flight
 * @route   GET /api/prediction/gate-change/:flightId
 * @access  Private (Passenger)
 */
const getGateChangePrediction = async (req, res, next) => {
  try {
    const flight = await Flight.findById(req.params.flightId);
    if (!flight) {
      return res.status(404).json({ success: false, message: 'Flight not found.' });
    }

    const prediction = await predictGateChange(flight);

    res.status(200).json({
      success: true,
      data: {
        flightNumber: flight.flightNumber,
        currentGate: flight.gate,
        gateChangeRisk: prediction.gateChangeRisk,
        probability: prediction.probability,
        reasons: prediction.reasons,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Search flights and get predictions (by flight number)
 * @route   GET /api/prediction/search?q=AI202
 * @access  Private (Passenger)
 */
const searchAndPredict = async (req, res, next) => {
  try {
    const { q } = req.query;
    if (!q) {
      return res.status(400).json({ success: false, message: 'Search query is required.' });
    }

    const flights = await Flight.find({
      flightNumber: { $regex: q, $options: 'i' },
    }).limit(5);

    if (!flights.length) {
      return res.status(404).json({ success: false, message: 'No flights found matching that query.' });
    }

    // Return first match with full prediction
    const flight = flights[0];
    const prediction = await predictDelay(flight);

    res.status(200).json({
      success: true,
      data: {
        flight: {
          id: flight._id,
          flightNumber: flight.flightNumber,
          airlineName: flight.airlineName,
          route: `${flight.sourceAirport} → ${flight.destinationAirport}`,
          departureTime: flight.departureTime,
          status: flight.flightStatus,
          aircraft: flight.aircraft,
          gate: flight.gate,
          terminal: flight.terminal,
        },
        prediction,
        disclaimer: 'This is a predicted value based on historical trends, rule-based analysis, and real-time congestion data.',
      },
      otherMatches: flights.slice(1).map(f => ({
        id: f._id,
        flightNumber: f.flightNumber,
        route: `${f.sourceAirport} → ${f.destinationAirport}`,
      })),
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getDelayPrediction, getGateChangePrediction, searchAndPredict };
