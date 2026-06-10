/**
 * AI Flight Delay & Gate Change Prediction Service
 * 
 * Uses a rule-based expert system to predict delay probability and gate change risk.
 * This is structured to allow a real ML model (e.g. Logistic Regression) to 
 * replace the rule engine in production without changing the API interface.
 * 
 * Scoring Model:
 * Each risk factor contributes a weighted score (0-100 total possible).
 * The final score maps to: delayProbability, expectedDelay (minutes), gateChangeRisk.
 */

const CrowdDensity = require('../models/CrowdDensity');

// ── Historical delay rates by route category (simulated data) ──────────────────
const ROUTE_DELAY_HISTORY = {
  'domestic-short': { rate: 18, avg_delay: 12 },  // < 1hr routes
  'domestic-medium': { rate: 28, avg_delay: 22 }, // 1-3hr routes
  'international': { rate: 35, avg_delay: 45 },   // international
  'long-haul': { rate: 42, avg_delay: 72 },        // > 6hr routes
};

// ── Aircraft reliability scores (simulated) ────────────────────────────────────
const AIRCRAFT_RELIABILITY = {
  'Boeing 787': 92, 'Airbus A380': 94, 'Boeing 747': 85,
  'Airbus A350': 91, 'Airbus A320': 88, 'Boeing 737': 83,
  'ATR 72': 78, 'default': 80,
};

/**
 * Classify route type from source/destination airport strings
 */
const classifyRoute = (source, destination) => {
  const intlKeywords = ['Dubai', 'Frankfurt', 'London', 'New York', 'Singapore', 'Doha', 'DXB', 'FRA', 'LHR', 'JFK', 'SIN', 'DOH'];
  const isInternational = intlKeywords.some(k => source.includes(k) || destination.includes(k));
  if (isInternational) return 'international';
  return 'domestic-medium';
};

/**
 * Check if the given hour is a peak airport traffic hour
 */
const isPeakHour = (hour) => {
  return (hour >= 6 && hour <= 9) || (hour >= 17 && hour <= 20);
};

/**
 * Check if the date falls on a weekend
 */
const isWeekend = (date) => {
  const day = new Date(date).getDay();
  return day === 0 || day === 6;
};

/**
 * Main prediction function
 * @param {Object} flight - Mongoose Flight document
 * @returns {Object} { delayProbability, expectedDelayMinutes, gateChangeRisk, confidence, insights }
 */
const predictDelay = async (flight) => {
  let score = 0;
  const insights = [];

  // Factor 1: Current flight status (highest weight)
  if (flight.flightStatus === 'Delayed') {
    score += 55;
    insights.push({ type: 'danger', text: 'Flight is currently marked as Delayed by the airline.' });
  } else if (flight.flightStatus === 'Cancelled') {
    score += 90;
    insights.push({ type: 'danger', text: 'Flight has been cancelled.' });
  } else if (flight.flightStatus === 'Boarding' || flight.flightStatus === 'Departed') {
    score += 5;
    insights.push({ type: 'success', text: 'Flight is on schedule — boarding or already departed.' });
  }

  // Factor 2: Peak hour departure
  const depHour = new Date(flight.departureTime).getHours();
  if (isPeakHour(depHour)) {
    score += 18;
    insights.push({ type: 'warning', text: `Departure at ${depHour}:00 falls within peak traffic hours (06-09 or 17-20).` });
  }

  // Factor 3: Weekend travel
  if (isWeekend(flight.departureTime)) {
    score += 8;
    insights.push({ type: 'warning', text: 'Weekend travel typically sees higher passenger volumes.' });
  }

  // Factor 4: Route historical delay rate
  const routeType = classifyRoute(flight.sourceAirport, flight.destinationAirport);
  const routeHistory = ROUTE_DELAY_HISTORY[routeType];
  if (routeHistory.rate > 30) {
    score += 15;
    insights.push({ type: 'warning', text: `${routeType === 'international' ? 'International' : 'Long-haul'} routes have a ${routeHistory.rate}% historical delay rate.` });
  } else {
    score += Math.floor(routeHistory.rate / 4);
    insights.push({ type: 'info', text: `Historical delay rate for this route type: ${routeHistory.rate}%.` });
  }

  // Factor 5: Aircraft reliability
  const reliability = AIRCRAFT_RELIABILITY[flight.aircraft] || AIRCRAFT_RELIABILITY['default'];
  if (reliability < 85) {
    score += 12;
    insights.push({ type: 'warning', text: `${flight.aircraft} has a lower on-time reliability score (${reliability}/100).` });
  } else {
    insights.push({ type: 'success', text: `${flight.aircraft} has a high reliability score (${reliability}/100).` });
  }

  // Factor 6: Airport congestion from crowd data
  try {
    const securityZones = await CrowdDensity.find({ zone: { $regex: /security/i } });
    const avgCongestion = securityZones.length
      ? securityZones.reduce((sum, z) => sum + z.densityLevel, 0) / securityZones.length
      : 30;

    if (avgCongestion > 70) {
      score += 15;
      insights.push({ type: 'warning', text: `Security checkpoints are currently ${Math.round(avgCongestion)}% congested, causing processing delays.` });
    } else if (avgCongestion > 50) {
      score += 7;
      insights.push({ type: 'info', text: `Moderate security congestion (${Math.round(avgCongestion)}%) detected.` });
    } else {
      insights.push({ type: 'success', text: `Security checkpoints are operating smoothly (${Math.round(avgCongestion)}% capacity).` });
    }
  } catch (e) {
    insights.push({ type: 'info', text: 'Crowd congestion data unavailable for this calculation.' });
  }

  // Clamp score to 0–100
  score = Math.max(0, Math.min(100, score));

  // Map score to delay estimate (non-linear: higher scores = exponentially worse)
  const expectedDelayMinutes = score < 20 ? 0
    : score < 40 ? Math.floor(score * 0.5)
    : score < 60 ? Math.floor(score * 1.2)
    : Math.floor(score * 1.8);

  // Gate change risk
  const gateChangeRisk = score >= 55 ? 'High' : score >= 30 ? 'Medium' : 'Low';

  // Confidence level (simulated based on data availability)
  const confidence = 78; // In production this would come from model validation metrics

  return {
    delayProbability: score,
    expectedDelayMinutes,
    gateChangeRisk,
    confidence,
    routeType,
    historicalDelayRate: routeHistory.rate,
    insights,
  };
};

/**
 * Get just the gate change prediction
 */
const predictGateChange = async (flight) => {
  const full = await predictDelay(flight);
  return {
    gateChangeRisk: full.gateChangeRisk,
    probability: Math.floor(full.delayProbability * 0.6),
    reasons: full.insights.filter(i => i.type === 'warning' || i.type === 'danger'),
  };
};

module.exports = { predictDelay, predictGateChange };
