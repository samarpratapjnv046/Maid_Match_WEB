import Offer from '../models/Offer.js';
import { AppError } from '../utils/errorHandler.js';

// ─── PUBLIC ───────────────────────────────────────────────────────────────────

// @route GET /api/offers
// Returns only active, non-expired offers sorted by display_order
export const getActiveOffers = async (req, res, next) => {
  try {
    const now = new Date();
    const offers = await Offer.find({
      is_active: true,
      $or: [{ expires_at: null }, { expires_at: { $gt: now } }],
    })
      .sort({ display_order: 1, createdAt: -1 })
      .lean();

    res.json({ success: true, data: offers });
  } catch (err) { next(err); }
};

// ─── ADMIN ────────────────────────────────────────────────────────────────────

// @route GET /api/admin/offers
export const getAllOffers = async (req, res, next) => {
  try {
    const offers = await Offer.find().sort({ display_order: 1, createdAt: -1 }).lean();
    res.json({ success: true, data: offers });
  } catch (err) { next(err); }
};

// @route POST /api/admin/offers
export const createOffer = async (req, res, next) => {
  try {
    const {
      title, subtitle, description, badge_text, discount_percent,
      gradient, accent_color, video_url, image_url,
      cta_text, cta_link, is_active, expires_at, display_order,
    } = req.body;

    if (!title?.trim()) return next(new AppError('Offer title is required.', 400));

    const offer = await Offer.create({
      title: title.trim(),
      subtitle: subtitle?.trim() || '',
      description: description?.trim() || '',
      badge_text: badge_text?.trim() || '',
      discount_percent: Number(discount_percent) || 0,
      gradient: gradient || 'from-orange-500 to-red-500',
      accent_color: accent_color || '#f97316',
      video_url: video_url?.trim() || '',
      image_url: image_url?.trim() || '',
      cta_text: cta_text?.trim() || 'Book Now',
      cta_link: cta_link?.trim() || '/workers',
      is_active: is_active !== false,
      expires_at: expires_at ? new Date(expires_at) : null,
      display_order: Number(display_order) || 0,
    });

    res.status(201).json({ success: true, message: 'Offer created successfully.', data: offer });
  } catch (err) { next(err); }
};

// @route PATCH /api/admin/offers/:id
export const updateOffer = async (req, res, next) => {
  try {
    const offer = await Offer.findById(req.params.id);
    if (!offer) return next(new AppError('Offer not found.', 404));

    const fields = [
      'title', 'subtitle', 'description', 'badge_text', 'discount_percent',
      'gradient', 'accent_color', 'video_url', 'image_url',
      'cta_text', 'cta_link', 'is_active', 'expires_at', 'display_order',
    ];

    fields.forEach((f) => {
      if (req.body[f] !== undefined) offer[f] = req.body[f];
    });

    // Allow explicitly clearing expires_at
    if (req.body.expires_at === null || req.body.expires_at === '') {
      offer.expires_at = null;
    } else if (req.body.expires_at) {
      offer.expires_at = new Date(req.body.expires_at);
    }

    await offer.save();
    res.json({ success: true, message: 'Offer updated.', data: offer });
  } catch (err) { next(err); }
};

// @route DELETE /api/admin/offers/:id
export const deleteOffer = async (req, res, next) => {
  try {
    const offer = await Offer.findByIdAndDelete(req.params.id);
    if (!offer) return next(new AppError('Offer not found.', 404));
    res.json({ success: true, message: 'Offer deleted.' });
  } catch (err) { next(err); }
};

// @route PATCH /api/admin/offers/:id/toggle
export const toggleOffer = async (req, res, next) => {
  try {
    const offer = await Offer.findById(req.params.id);
    if (!offer) return next(new AppError('Offer not found.', 404));
    offer.is_active = !offer.is_active;
    await offer.save();
    res.json({ success: true, message: `Offer ${offer.is_active ? 'activated' : 'deactivated'}.`, data: offer });
  } catch (err) { next(err); }
};
