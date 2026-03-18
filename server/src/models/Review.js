import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema(
  {
    booking_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking',
      required: true,
      unique: true, // one review per booking
    },
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    worker_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Worker',
      required: true,
    },
    rating: {
      type: Number,
      required: [true, 'Rating is required'],
      min: [1, 'Rating must be at least 1'],
      max: [5, 'Rating cannot exceed 5'],
    },
    comment: {
      type: String,
      maxlength: [1000, 'Comment cannot exceed 1000 characters'],
      default: '',
    },
    is_visible: { type: Boolean, default: true },
  },
  { timestamps: true }
);

reviewSchema.index({ worker_id: 1 });
reviewSchema.index({ user_id: 1 });

// Recalculate worker's average rating after a review is saved
reviewSchema.post('save', async function () {
  const Worker = (await import('./Worker.js')).default;
  const stats = await this.constructor.aggregate([
    { $match: { worker_id: this.worker_id, is_visible: true } },
    { $group: { _id: '$worker_id', avgRating: { $avg: '$rating' }, count: { $sum: 1 } } },
  ]);
  if (stats.length > 0) {
    await Worker.findByIdAndUpdate(this.worker_id, {
      rating: Math.round(stats[0].avgRating * 10) / 10,
      total_reviews: stats[0].count,
    });
  }
});

const Review = mongoose.model('Review', reviewSchema);
export default Review;
