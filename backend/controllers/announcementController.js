const Announcement = require("../models/Announcement");
const { getCompanyId } = require("./branchController");
const asyncHandler = require("../utils/asyncHandler");

// Create an announcement
// POST /api/announcements
// Private (admin, hr_manager)
const createAnnouncement = asyncHandler(async (req, res) => {
  const companyId = await getCompanyId(req);
  const { title, description, date, publishDate, expiryDate, isPinned } = req.body;
  const announcement = await Announcement.create({
    company: companyId,
    title,
    description,
    date,
    publishDate,
    expiryDate,
    isPinned,
    createdBy: req.user._id,
  });
  res.status(201).json({ success: true, data: announcement });
});

// Get announcements (pinned first, then date descending)
// GET /api/announcements
// Private
const getAnnouncements = asyncHandler(async (req, res) => {
  const companyId = await getCompanyId(req);
  const { limit } = req.query;

  // Query valid announcements (published, and not expired)
  const now = new Date();
  const query = {
    company: companyId,
    publishDate: { $lte: now },
    $or: [
      { expiryDate: { $exists: false } },
      { expiryDate: null },
      { expiryDate: { $gte: now } }
    ]
  };

  // If user is Admin or HR Manager, we show all announcements including future and expired ones
  if (["admin", "hr_manager"].includes(req.user.role)) {
    delete query.publishDate;
    delete query.$or;
  }

  let dbQuery = Announcement.find(query).sort({ isPinned: -1, date: -1 }).populate("createdBy", "name");
  if (limit) dbQuery = dbQuery.limit(parseInt(limit, 10));
  
  const announcements = await dbQuery;
  res.json({ success: true, count: announcements.length, data: announcements });
});

// Update an announcement
// PUT /api/announcements/:id
// Private (admin, hr_manager)
const updateAnnouncement = asyncHandler(async (req, res) => {
  const companyId = await getCompanyId(req);
  const announcement = await Announcement.findOneAndUpdate(
    { _id: req.params.id, company: companyId },
    {
      title: req.body.title,
      description: req.body.description,
      date: req.body.date,
      publishDate: req.body.publishDate,
      expiryDate: req.body.expiryDate,
      isPinned: req.body.isPinned
    },
    { new: true, runValidators: true }
  );

  if (!announcement) {
    return res.status(404).json({ success: false, message: "Announcement not found" });
  }
  res.json({ success: true, data: announcement });
});

// Mark an announcement as read
// POST /api/announcements/:id/read
// Private
const markRead = asyncHandler(async (req, res) => {
  const companyId = await getCompanyId(req);
  const announcement = await Announcement.findOneAndUpdate(
    { _id: req.params.id, company: companyId },
    { $addToSet: { readBy: req.user._id } },
    { new: true }
  );
  if (!announcement) {
    return res.status(404).json({ success: false, message: "Announcement not found" });
  }
  res.json({ success: true, data: announcement });
});

// Delete an announcement
// DELETE /api/announcements/:id
// Private (admin, hr_manager)
const deleteAnnouncement = asyncHandler(async (req, res) => {
  const companyId = await getCompanyId(req);
  const announcement = await Announcement.findOneAndDelete({ _id: req.params.id, company: companyId });
  if (!announcement) {
    return res.status(404).json({ success: false, message: "Announcement not found" });
  }
  res.json({ success: true, message: "Announcement deleted" });
});

module.exports = {
  createAnnouncement,
  getAnnouncements,
  updateAnnouncement,
  markRead,
  deleteAnnouncement
};
