/**
 * roleMiddleware
 * Factory function that returns an Express middleware enforcing role-based access.
 * Usage: router.post('/route', authMiddleware, requireRole('admin'), controller)
 *
 * @param {...string} roles - Allowed role(s) for the route
 */
const requireRole = (...roles) => {
  return (req, res, next) => {
    // authMiddleware must run before this
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required.',
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access forbidden. Required role: ${roles.join(' or ')}. Your role: ${req.user.role}.`,
      });
    }

    next();
  };
};

module.exports = { requireRole };
