const Holiday = require("../models/Holiday");
const { getCompanyId } = require("./branchController");
const asyncHandler = require("../utils/asyncHandler");

// @desc    Get all holidays
// @route   GET /api/holidays
const getHolidays = asyncHandler(async (req, res) => {
  const companyId = await getCompanyId(req);
  const { search, category, branch, page = 1, limit = 10 } = req.query;

  const query = { company: companyId };
  if (search) {
    query.title = { $regex: search, $options: "i" };
  }
  if (category) {
    query.category = category;
  }
  if (branch) {
    query.branches = branch;
  }

  const pageNum = Math.max(parseInt(page, 10) || 1, 1);
  const limitNum = Math.max(parseInt(limit, 10) || 10, 1);
  const skip = (pageNum - 1) * limitNum;

  const [holidays, total] = await Promise.all([
    Holiday.find(query)
      .populate("branches", "name")
      .skip(skip)
      .limit(limitNum)
      .sort({ date: 1 }),
    Holiday.countDocuments(query),
  ]);

  res.json({
    success: true,
    data: holidays,
    pagination: {
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum),
    },
  });
});

// @desc    Get a single holiday
// @route   GET /api/holidays/:id
const getHoliday = asyncHandler(async (req, res) => {
  const companyId = await getCompanyId(req);
  const holiday = await Holiday.findOne({ _id: req.params.id, company: companyId }).populate("branches", "name");
  if (!holiday) {
    return res.status(404).json({ success: false, message: "Holiday not found" });
  }
  res.json({ success: true, data: holiday });
});

// @desc    Create holiday
// @route   POST /api/holidays
const createHoliday = asyncHandler(async (req, res) => {
  const companyId = await getCompanyId(req);
  const payload = { ...req.body, company: companyId };
  const holiday = await Holiday.create(payload);
  res.status(201).json({ success: true, data: holiday });
});

// @desc    Update holiday
// @route   PUT /api/holidays/:id
const updateHoliday = asyncHandler(async (req, res) => {
  const companyId = await getCompanyId(req);
  const holiday = await Holiday.findOneAndUpdate(
    { _id: req.params.id, company: companyId },
    req.body,
    { new: true, runValidators: true }
  );
  if (!holiday) {
    return res.status(404).json({ success: false, message: "Holiday not found" });
  }
  res.json({ success: true, data: holiday });
});

// @desc    Delete holiday
// @route   DELETE /api/holidays/:id
const deleteHoliday = asyncHandler(async (req, res) => {
  const companyId = await getCompanyId(req);
  const holiday = await Holiday.findOneAndDelete({ _id: req.params.id, company: companyId });
  if (!holiday) {
    return res.status(404).json({ success: false, message: "Holiday not found" });
  }
  res.json({ success: true, message: "Holiday deleted successfully" });
});

// @desc    Export holidays to iCal format
// @route   GET /api/holidays/export/ical
const exportICal = asyncHandler(async (req, res) => {
  const companyId = await getCompanyId(req);
  const holidays = await Holiday.find({ company: companyId });

  let icalContent = "BEGIN:VCALENDAR\r\nVERSION:2.0\r\nPRODID:-//HRMS//Holiday Calendar//EN\r\n";
  
  holidays.forEach((h) => {
    const d = new Date(h.date);
    const dateStr = d.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
    const dateStart = d.toISOString().slice(0, 10).replace(/-/g, "");
    
    icalContent += "BEGIN:VEVENT\r\n";
    icalContent += `UID:holiday_${h._id}@hrms.local\r\n`;
    icalContent += `DTSTAMP:${dateStr}\r\n`;
    icalContent += `DTSTART;VALUE=DATE:${dateStart}\r\n`;
    icalContent += `SUMMARY:${h.title}\r\n`;
    icalContent += `DESCRIPTION:Category: ${h.category}\r\n`;
    icalContent += "END:VEVENT\r\n";
  });

  icalContent += "END:VCALENDAR\r\n";

  res.setHeader("Content-Type", "text/calendar");
  res.setHeader("Content-Disposition", "attachment; filename=holidays.ics");
  res.send(icalContent);
});

// @desc    Export holidays to PDF/CSV format
// @route   GET /api/holidays/export/pdf (returns CSV formatted list for user download)
const exportPDF = asyncHandler(async (req, res) => {
  const companyId = await getCompanyId(req);
  const holidays = await Holiday.find({ company: companyId }).sort({ date: 1 });

  let csvContent = "Holiday Title,Date,Category\n";
  holidays.forEach((h) => {
    const formattedDate = new Date(h.date).toLocaleDateString();
    csvContent += `"${h.title.replace(/"/g, '""')}","${formattedDate}","${h.category}"\n`;
  });

  res.setHeader("Content-Type", "text/csv");
  res.setHeader("Content-Disposition", "attachment; filename=holidays_report.csv");
  res.send(csvContent);
});

module.exports = {
  getHolidays,
  getHoliday,
  createHoliday,
  updateHoliday,
  deleteHoliday,
  exportICal,
  exportPDF,
};
