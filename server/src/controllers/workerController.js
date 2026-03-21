import Worker from '../models/Worker.js';
import User from '../models/User.js';
import Booking from '../models/Booking.js';
import cloudinary, { uploadToCloudinary } from '../config/cloudinary.js';
import { AppError } from '../utils/errorHandler.js';
import { APIFeatures } from '../utils/apiFeatures.js';

// @desc    Create worker profile (after registration as worker)
// @route   POST /api/workers/profile
// @access  Private (worker)
export const createWorkerProfile = async (req, res, next) => {
  try {
    const existingProfile = await Worker.findOne({ user_id: req.user._id });
    if (existingProfile) {
      return next(new AppError('Worker profile already exists. Use PATCH to update.', 409));
    }

    const profileData = { ...req.body, user_id: req.user._id };

    // Handle Aadhaar upload
    if (req.file) {
      const result = await uploadToCloudinary(req.file.buffer, {
        folder: 'maidproject/aadhaar',
        resource_type: 'auto',
      });
      profileData.aadhaar = { url: result.secure_url, public_id: result.public_id };
    }

    const worker = await Worker.create(profileData);
    res.status(201).json({ success: true, data: worker });
  } catch (err) {
    next(err);
  }
};

// @desc    Update worker profile
// @route   PATCH /api/workers/profile
// @access  Private (worker)
export const updateWorkerProfile = async (req, res, next) => {
  try {
    const worker = await Worker.findOne({ user_id: req.user._id });
    if (!worker) return next(new AppError('Worker profile not found.', 404));

    // If new Aadhaar uploaded, delete old from cloudinary
    if (req.file) {
      if (worker.aadhaar?.public_id) {
        await cloudinary.uploader.destroy(worker.aadhaar.public_id, { resource_type: 'raw' });
      }
      const result = await uploadToCloudinary(req.file.buffer, {
        folder: 'maidproject/aadhaar',
        resource_type: 'auto',
      });
      req.body.aadhaar = { url: result.secure_url, public_id: result.public_id, verified: false };
    }

    const updated = await Worker.findOneAndUpdate(
      { user_id: req.user._id },
      { $set: req.body },
      { new: true, runValidators: true }
    );

    res.json({ success: true, data: updated });
  } catch (err) {
    next(err);
  }
};

// @desc    Upload/update profile photo
// @route   POST /api/workers/profile/photo
// @access  Private (worker)
export const uploadProfilePhoto = async (req, res, next) => {
  try {
    if (!req.file) return next(new AppError('No file uploaded.', 400));

    const result = await uploadToCloudinary(req.file.buffer, {
      folder: 'maidproject/profiles',
      transformation: [{ width: 400, height: 400, crop: 'fill', gravity: 'face' }],
    });

    await User.findByIdAndUpdate(req.user._id, {
      'profilePhoto.url': result.secure_url,
      'profilePhoto.public_id': result.public_id,
    });

    res.json({ success: true, message: 'Profile photo updated.', url: result.secure_url });
  } catch (err) {
    next(err);
  }
};

// @desc    Get my worker profile
// @route   GET /api/workers/profile/me
// @access  Private (worker)
export const getMyWorkerProfile = async (req, res, next) => {
  try {
    const worker = await Worker.findOne({ user_id: req.user._id })
      .select('-aadhaar.number -aadhaar.public_id')
      .populate('user_id', 'name email phone profilePhoto');
    if (!worker) return next(new AppError('Worker profile not found.', 404));
    res.json({ success: true, data: worker });
  } catch (err) {
    next(err);
  }
};

// @desc    Search workers (public)
// @route   GET /api/workers/search
// @access  Public
export const searchWorkers = async (req, res, next) => {
  try {
    const q = req.query;
    // Accept both snake_case and camelCase param names from frontend
    const city         = q.city;
    const pincode      = q.pincode;
    const servicesRaw  = q.services || q.service; // comma-sep or single
    const min_price    = q.min_price;
    const max_price    = q.max_price;
    const duration_type = q.duration_type || q.durationType;
    const min_rating   = q.min_rating   || q.minRating;
    const page         = q.page;
    const limit        = q.limit;
    const sort         = q.sort;
    const lat          = q.lat;
    const lng          = q.lng;
    const radius_km    = q.radius_km;

    const filter = { is_verified: true, is_available: true };

    if (city) filter['location.city'] = { $regex: city, $options: 'i' };
    if (pincode) filter['location.pincode'] = pincode.trim();

    if (servicesRaw) {
      const serviceList = servicesRaw.split(',').map((s) => s.trim()).filter(Boolean);
      filter.services = serviceList.length === 1 ? serviceList[0] : { $in: serviceList };
    }

    if (min_rating) filter.rating = { $gte: parseFloat(min_rating) };

    if (min_price || max_price) {
      const priceField = `pricing.${duration_type || 'hourly'}`;
      filter[priceField] = {};
      if (min_price) filter[priceField].$gte = parseFloat(min_price);
      if (max_price) filter[priceField].$lte = parseFloat(max_price);
    }

    // Geospatial search (if coordinates provided)
    if (lat && lng) {
      const radiusMeters = (parseFloat(radius_km) || 10) * 1000;
      filter['location.coordinates'] = {
        $near: {
          $geometry: { type: 'Point', coordinates: [parseFloat(lng), parseFloat(lat)] },
          $maxDistance: radiusMeters,
        },
      };
    }

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = Math.min(parseInt(limit, 10) || 10, 50);
    const skip = (pageNum - 1) * limitNum;

    const sortMap = {
      rating: { rating: -1 },
      price_asc: { [`pricing.${duration_type || 'hourly'}`]: 1 },
      price_desc: { [`pricing.${duration_type || 'hourly'}`]: -1 },
      experience: { experience_years: -1 },
    };
    const sortQuery = sortMap[sort] || { rating: -1 };

    const [workers, total] = await Promise.all([
      Worker.find(filter)
        .select('-aadhaar')
        .populate('user_id', 'name profilePhoto')
        .sort(sortQuery)
        .skip(skip)
        .limit(limitNum),
      Worker.countDocuments(filter),
    ]);

    res.json({
      success: true,
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum),
      data: workers,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Check worker availability for a time slot
// @route   GET /api/workers/:id/availability
// @access  Public
export const checkWorkerAvailability = async (req, res, next) => {
  try {
    const { start_time, end_time } = req.query;
    if (!start_time || !end_time) return next(new AppError('start_time and end_time are required.', 400));

    const start = new Date(start_time);
    const end = new Date(end_time);
    if (isNaN(start) || isNaN(end) || end <= start) {
      return next(new AppError('Invalid time range.', 400));
    }

    const worker = await Worker.findById(req.params.id);
    if (!worker) return next(new AppError('Worker not found.', 404));

    // Find bookings that overlap with the requested slot
    // Overlap condition: existing.start_time < requested.end AND existing.end_time > requested.start
    const conflicts = await Booking.find({
      worker_id: worker._id,
      status: { $in: ['offer_pending', 'accepted', 'pending_payment', 'paid'] },
      start_time: { $lt: end },
      end_time: { $gt: start },
    }).select('start_time end_time service_type duration_type');

    if (conflicts.length === 0) {
      return res.json({ success: true, available: true });
    }

    res.json({
      success: true,
      available: false,
      conflicts: conflicts.map((b) => ({
        start_time: b.start_time,
        end_time: b.end_time,
        service_type: b.service_type,
        duration_type: b.duration_type,
      })),
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single worker profile (public)
// @route   GET /api/workers/:id
// @access  Public
export const getWorkerById = async (req, res, next) => {
  try {
    const worker = await Worker.findById(req.params.id)
      .select('-aadhaar')
      .populate('user_id', 'name profilePhoto');

    if (!worker) return next(new AppError('Worker not found.', 404));
    res.json({ success: true, data: worker });
  } catch (err) {
    next(err);
  }
};

// @desc    Upload / update Aadhaar document and number for identity verification
// @route   POST /api/workers/aadhaar
// @access  Private (worker, customer-in-setup)
export const submitAadhaar = async (req, res, next) => {
  try {
    const worker = await Worker.findOne({ user_id: req.user._id });
    if (!worker) return next(new AppError('Worker profile not found. Create your profile first.', 404));

    const { aadhaar_number } = req.body;

    // Validate Aadhaar number (12 digits)
    if (!aadhaar_number || !/^\d{12}$/.test(aadhaar_number.replace(/\s/g, ''))) {
      return next(new AppError('Aadhaar number must be exactly 12 digits.', 400));
    }

    if (!req.file) {
      return next(new AppError('Please upload your Aadhaar document.', 400));
    }

    // Delete old Aadhaar from Cloudinary if exists
    if (worker.aadhaar?.public_id) {
      await cloudinary.uploader.destroy(worker.aadhaar.public_id, { resource_type: 'raw' }).catch(() => {});
    }

    const result = await uploadToCloudinary(req.file.buffer, {
      folder: 'maidproject/aadhaar',
      resource_type: 'auto',
    });

    worker.aadhaar = {
      url: result.secure_url,
      public_id: result.public_id,
      number: aadhaar_number.replace(/\s/g, ''),
      verified: false,
      submitted_at: new Date(),
    };
    worker.verification_status = 'under_review';
    await worker.save();

    res.json({
      success: true,
      message: 'Aadhaar submitted. Your profile is now under admin review.',
      data: {
        submitted: true,
        verification_status: worker.verification_status,
        submitted_at: worker.aadhaar.submitted_at,
      },
    });
  } catch (err) {
    next(err);
  }
};
