const { getNavigableNodes, findShortestPath } = require('../services/navigationService');

/**
 * @desc    Get all navigable locations in the airport
 * @route   GET /api/navigation/nodes
 * @access  Public (or Passenger)
 */
const getNodes = (req, res, next) => {
  try {
    const nodes = getNavigableNodes();
    res.status(200).json({ success: true, count: nodes.length, data: nodes });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get shortest path between two points (Dijkstra)
 * @route   GET /api/navigation/path?source=&destination=
 * @access  Public (or Passenger)
 */
const getPath = (req, res, next) => {
  try {
    const { source, destination } = req.query;

    if (!source || !destination) {
      return res.status(400).json({ success: false, message: 'Source and destination are required' });
    }

    if (source === destination) {
      return res.status(400).json({ success: false, message: 'Source and destination cannot be the same' });
    }

    const result = findShortestPath(source, destination);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    // If Dijkstra throws (e.g. invalid node name)
    if (error.message.includes('Invalid') || error.message.includes('No path')) {
      return res.status(400).json({ success: false, message: error.message });
    }
    next(error);
  }
};

module.exports = {
  getNodes,
  getPath
};
