import cron from 'node-cron';
import Booking from '../models/Booking.js';
import logger from '../utils/logger.js';

/**
 * Runs every minute.
 * Finds all offer_pending bookings whose start_time has already passed
 * and marks them as 'expired' so they disappear from the worker dashboard.
 */
export const startAutoExpireJob = () => {
  cron.schedule('* * * * *', async () => {
    try {
      const now = new Date();

      const expired = await Booking.find({
        status: 'offer_pending',
        start_time: { $lte: now },
      }).select('_id status_history');

      if (expired.length === 0) return;

      const bulkOps = expired.map((booking) => ({
        updateOne: {
          filter: { _id: booking._id },
          update: {
            $set: { status: 'expired' },
            $push: {
              status_history: {
                status: 'expired',
                changed_at: now,
                note: 'Auto-expired: worker did not respond before service start time',
              },
            },
          },
        },
      }));

      const result = await Booking.bulkWrite(bulkOps);
      logger.info(`[AutoExpire] Expired ${result.modifiedCount} booking(s) past their start time.`);
    } catch (err) {
      logger.error('[AutoExpire] Error running auto-expire job:', err);
    }
  });

  logger.info('[AutoExpire] Auto-expire cron job scheduled (every minute).');
};
