const LostItem = require('../models/LostItem');
const Notification = require('../models/Notification');

/**
 * @desc    Report a new lost item
 * @route   POST /api/lost-items
 * @access  Private (Passenger)
 */
const reportLostItem = async (req, res, next) => {
  try {
    req.body.userId = req.user._id;
    
    // Add initial status to history
    req.body.statusHistory = [{
      status: 'Reported',
      changedBy: 'User (Passenger)',
      note: 'Initial report filed'
    }];

    const item = await LostItem.create(req.body);

    res.status(201).json({ success: true, data: item });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all lost items reported by the logged-in user
 * @route   GET /api/lost-items/my
 * @access  Private
 */
const getMyLostItems = async (req, res, next) => {
  try {
    const items = await LostItem.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: items.length, data: items });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all lost items (Admin only)
 * @route   GET /api/lost-items
 * @access  Private/Admin
 */
const getAllLostItems = async (req, res, next) => {
  try {
    const items = await LostItem.find().populate('userId', 'name email').sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: items.length, data: items });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update lost item status (Admin only)
 * @route   PUT /api/lost-items/:id
 * @access  Private/Admin
 */
const updateLostItemStatus = async (req, res, next) => {
  try {
    const { status, adminNotes, foundLocation } = req.body;
    
    const item = await LostItem.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Item not found' });
    }

    const oldStatus = item.status;
    
    // Update fields
    if (status) item.status = status;
    if (adminNotes) item.adminNotes = adminNotes;
    if (foundLocation) item.foundLocation = foundLocation;

    // Add to history if status changed
    if (status && status !== oldStatus) {
      item.statusHistory.push({
        status,
        changedBy: 'Admin',
        note: adminNotes || `Status updated from ${oldStatus} to ${status}`
      });
      
      // Trigger an in-app notification for the user
      await Notification.create({
        userId: item.userId,
        title: `Lost Item Update: ${item.itemName}`,
        message: `The status of your lost item has been updated to: ${status}. ${adminNotes ? `Note: ${adminNotes}` : ''}`,
        type: 'lost-found',
        icon: '🧳',
        metadata: { trackingId: item.trackingId }
      });
    }

    await item.save();
    res.status(200).json({ success: true, data: item });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all public found items (Passenger dashboard)
 * @route   GET /api/lost-items/public
 * @access  Public
 */
const getPublicFoundItems = async (req, res, next) => {
  try {
    const items = await LostItem.find({ status: { $in: ['Found', 'Resolved'] } })
      .select('itemName category foundLocation status createdAt trackingId description')
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: items.length, data: items });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  reportLostItem,
  getMyLostItems,
  getAllLostItems,
  updateLostItemStatus,
  getPublicFoundItems
};
