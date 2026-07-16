const Announcement = require("../models/Announcement");
const asyncHandler = require("../utils/asyncHandler");

// @desc    Create an announcement
// @route   POST /api/announcements
// @access  Private (admin, hr_manager)
const createAnnouncement = asyncHandler(async (req, res) => {
  const { title, description, date } = req.body;
  const announcement = await Announcement.create({
    title,
    description,
    date,
    createdBy: req.user._id,
  });
  res.status(201).json({ success: true, data: announcement });
});

// @desc    Get announcements (most recent first)
// @route   GET /api/announcements?limit=
// @access  Private
const getAnnouncements = asyncHandler(async (req, res) => {
  const { limit } = req.query;
  let query = Announcement.find().sort({ date: -1 }).populate("createdBy", "name");
  if (limit) query = query.limit(parseInt(limit, 10));
  const announcements = await query;
  res.json({ success: true, count: announcements.length, data: announcements });
});

// @desc    Update an announcement
// @route   PUT /api/announcements/:id
// @access  Private (admin, hr_manager)
const updateAnnouncement = asyncHandler(async (req, res) => {
  const announcement = await Announcement.findByIdAndUpdate(
    req.params.id,
    { title: req.body.title, description: req.body.description, date: req.body.date },
    { new: true, runValidators: true }
  );
  if (!announcement) {
    return res.status(404).json({ success: false, message: "Announcement not found" });
  }
  res.json({ success: true, data: announcement });
});

// @desc    Delete an announcement
// @route   DELETE /api/announcements/:id
// @access  Private (admin, hr_manager)
const deleteAnnouncement = asyncHandler(async (req, res) => {
  const announcement = await Announcement.findByIdAndDelete(req.params.id);
  if (!announcement) {
    return res.status(404).json({ success: false, message: "Announcement not found" });
  }
  res.json({ success: true, message: "Announcement deleted" });
});

module.exports = { createAnnouncement, getAnnouncements, updateAnnouncement, deleteAnnouncement };
