import Worker from '../models/Worker.js';
import User from '../models/User.js';
import Booking from '../models/Booking.js';
import cloudinary, { uploadToCloudinary } from '../config/cloudinary.js';
import { AppError } from '../utils/errorHandler.js';
import { APIFeatures } from '../utils/apiFeatures.js';
import { notify } from '../utils/notificationHelper.js';

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
        await cloudinary.uploader.destroy(worker.aadhaar.public_id, { resource_type: 'image' });
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
    if (!worker) return res.json({ success: true, data: null });
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

// @desc    Toggle worker active/inactive availability
// @route   PATCH /api/workers/profile/availability
// @access  Private (worker)
export const toggleAvailability = async (req, res, next) => {
  try {
    const worker = await Worker.findOne({ user_id: req.user._id });
    if (!worker) return next(new AppError('Worker profile not found.', 404));
    if (!worker.is_verified) return next(new AppError('Only verified workers can change availability.', 403));

    worker.is_available = !worker.is_available;
    await worker.save();

    // In-app confirmation notification to the worker
    notify(req.user._id, {
      type: 'profile_status',
      title: worker.is_available ? 'You are now Active' : 'You are now Inactive',
      body: worker.is_available
        ? 'Your profile is visible to clients. You can now receive booking requests.'
        : 'Your profile is hidden from bookings. Toggle back to start receiving requests.',
      data: { is_available: worker.is_available },
    });

    res.json({
      success: true,
      is_available: worker.is_available,
      message: worker.is_available ? 'You are now Active. Clients can find and book you.' : 'You are now Inactive. Your profile is hidden from bookings.',
    });
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
      await cloudinary.uploader.destroy(worker.aadhaar.public_id, { resource_type: 'image' }).catch(() => {});
    }

    const result = await uploadToCloudinary(req.file.buffer, {
      folder: 'maidproject/aadhaar',
      resource_type: 'image',
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

// @desc    Send OTP to worker's email to verify bank account number
// @route   POST /api/workers/bank/send-otp
// @access  Private (worker)
// @desc    Submit bank details with passbook upload
// @route   POST /api/workers/bank
// @access  Private (worker or customer mode)
export const submitBankDetails = async (req, res, next) => {
  try {
    const worker = await Worker.findOne({ user_id: req.user._id });
    if (!worker) return next(new AppError('Worker profile not found.', 404));

    const { account_holder_name, account_number, ifsc_code, bank_name } = req.body;

    // Validate required fields
    if (!account_holder_name?.trim()) return next(new AppError('Account holder name is required.', 400));
    if (!account_number?.trim()) return next(new AppError('Account number is required.', 400));
    if (!ifsc_code?.trim()) return next(new AppError('IFSC code is required.', 400));
    if (!bank_name?.trim()) return next(new AppError('Bank name is required.', 400));

    // IFSC format: 4 letters + 0 + 6 alphanumeric
    if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(ifsc_code.toUpperCase())) {
      return next(new AppError('Invalid IFSC code format (e.g. SBIN0001234).', 400));
    }

    // Upload passbook if provided
    let passbookData = worker.bank_details?.passbook || {};
    if (req.file) {
      if (passbookData.public_id) {
        await cloudinary.uploader.destroy(passbookData.public_id, { resource_type: 'image' }).catch(() => {});
      }
      const uploaded = await uploadToCloudinary(req.file.buffer, {
        folder: 'maidproject/passbooks',
        resource_type: 'image',
      });
      passbookData = { url: uploaded.secure_url, public_id: uploaded.public_id };
    }

    worker.bank_details = {
      account_holder_name: account_holder_name.trim(),
      account_number: account_number.trim(),
      ifsc_code: ifsc_code.toUpperCase().trim(),
      bank_name: bank_name.trim(),
      passbook: passbookData,
      is_verified: true,
      submitted_at: new Date(),
    };

    await worker.save();

    res.json({
      success: true,
      message: 'Bank details saved and verified successfully.',
      data: {
        account_holder_name: worker.bank_details.account_holder_name,
        bank_name: worker.bank_details.bank_name,
        ifsc_code: worker.bank_details.ifsc_code,
        // Return masked account number for display
        account_number_masked: `xxxx xxxx ${worker.bank_details.account_number.slice(-4)}`,
        is_verified: true,
        submitted_at: worker.bank_details.submitted_at,
      },
    });
  } catch (err) {
    next(err);
  }
};
