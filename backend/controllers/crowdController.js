const CrowdDensity = require('../models/CrowdDensity');
const { getAlternativeSuggestion } = require('../services/crowdService');

/**
 * @desc    Get real-time crowd density for all zones (heatmap data)
 * @route   GET /api/crowd-density
 * @access  Public
 */
const getCrowdDensity = async (req, res, next) => {
  try {
    const zones = await CrowdDensity.find().sort({ densityLevel: -1 });
    res.status(200).json({ success: true, count: zones.length, data: zones });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get alternative less-crowded route suggestion
 * @route   GET /api/crowd-density/alternatives?zone=
 * @access  Public
 */
const getAlternatives = async (req, res, next) => {
  try {
    const { zone } = req.query;
    if (!zone) {
      return res.status(400).json({ success: false, message: 'Zone query parameter is required' });
    }

    const suggestion = await getAlternativeSuggestion(zone);
    res.status(200).json({ 
      success: true, 
      hasAlternative: !!suggestion,
      data: suggestion 
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCrowdDensity,
  getAlternatives
};
