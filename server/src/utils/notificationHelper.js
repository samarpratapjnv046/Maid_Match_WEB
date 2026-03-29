import Notification from '../models/Notification.js';
import { getIO } from './socketInstance.js';
import logger from './logger.js';

/**
 * Creates a persistent notification in the DB and emits it via Socket.io.
 * Always fire-and-forget — never throws to callers.
 *
 * @param {string|ObjectId} userId   Recipient's User._id
 * @param {{ type, title, body, data? }} payload
 */
export const notify = async (userId, { type, title, body, data = {} }) => {
  try {
    const notif = await Notification.create({ user_id: userId, type, title, body, data });
    const io = getIO();
    if (io) {
      io.to(`user:${userId.toString()}`).emit('notification', notif.toObject());
    }
  } catch (err) {
    logger.error('[Notification] Failed to create/emit notification:', err.message);
  }
};
