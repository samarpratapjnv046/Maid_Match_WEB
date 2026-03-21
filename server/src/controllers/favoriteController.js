import User from '../models/User.js';
import Worker from '../models/Worker.js';
import { AppError } from '../utils/errorHandler.js';

// @desc    Toggle a worker in/out of customer's favorites
// @route   POST /api/favorites/:workerId
// @access  Private (customer)
export const toggleFavorite = async (req, res, next) => {
  try {
    const { workerId } = req.params;

    const worker = await Worker.findById(workerId);
    if (!worker) return next(new AppError('Worker not found.', 404));

    const user = await User.findById(req.user._id);
    const alreadyFavorited = user.favorites.some(
      (id) => id.toString() === workerId
    );

    if (alreadyFavorited) {
      user.favorites = user.favorites.filter((id) => id.toString() !== workerId);
    } else {
      user.favorites.push(workerId);
    }

    await user.save({ validateBeforeSave: false });

    res.json({
      success: true,
      favorited: !alreadyFavorited,
      message: alreadyFavorited ? 'Removed from favorites.' : 'Added to favorites.',
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get all favorited workers for the logged-in customer
// @route   GET /api/favorites
// @access  Private (customer)
export const getFavorites = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).populate({
      path: 'favorites',
      populate: { path: 'user_id', select: 'name profilePhoto' },
    });

    res.json({ success: true, data: user.favorites });
  } catch (err) {
    next(err);
  }
};
