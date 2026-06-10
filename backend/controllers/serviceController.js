const AirportService = require('../models/AirportService');

// ─── Get All Services (with optional category filter) ─────────────────────────
/**
 * GET /api/services
 * Public route. Supports query param: category.
 */
const getServices = async (req, res, next) => {
  try {
    const { category } = req.query;
    const filter = { isActive: true };

    if (category && category !== 'All') {
      filter.category = category;
    }

    const services = await AirportService.find(filter).sort({ category: 1, serviceName: 1 });

    res.status(200).json({
      success: true,
      count: services.length,
      data: services,
    });
  } catch (error) {
    next(error);
  }
};

// ─── Get Single Service ───────────────────────────────────────────────────────
const getServiceById = async (req, res, next) => {
  try {
    const service = await AirportService.findById(req.params.id);
    if (!service) {
      return res.status(404).json({ success: false, message: 'Service not found.' });
    }
    res.status(200).json({ success: true, data: service });
  } catch (error) {
    next(error);
  }
};

// ─── Create Service (Admin Only) ──────────────────────────────────────────────
const createService = async (req, res, next) => {
  try {
    const service = await AirportService.create(req.body);
    res.status(201).json({ success: true, message: 'Service created successfully.', data: service });
  } catch (error) {
    next(error);
  }
};

// ─── Update Service (Admin Only) ──────────────────────────────────────────────
const updateService = async (req, res, next) => {
  try {
    const service = await AirportService.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!service) {
      return res.status(404).json({ success: false, message: 'Service not found.' });
    }
    res.status(200).json({ success: true, message: 'Service updated successfully.', data: service });
  } catch (error) {
    next(error);
  }
};

// ─── Delete Service (Admin Only) ──────────────────────────────────────────────
const deleteService = async (req, res, next) => {
  try {
    // Soft delete: set isActive to false rather than removing
    const service = await AirportService.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );
    if (!service) {
      return res.status(404).json({ success: false, message: 'Service not found.' });
    }
    res.status(200).json({ success: true, message: 'Service removed successfully.' });
  } catch (error) {
    next(error);
  }
};

module.exports = { getServices, getServiceById, createService, updateService, deleteService };
