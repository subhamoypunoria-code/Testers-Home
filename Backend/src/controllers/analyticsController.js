const Defect = require('../models/Defect');
const mongoose = require('mongoose');

exports.getProjectAnalytics = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.projectId)) {
      return res.status(400).json({ success: false, message: 'Invalid project ID' });
    }
    const pid = mongoose.Types.ObjectId.createFromHexString(req.params.projectId);

    const [bySeverity, byStatus, byPriority, byAssignee, trend] = await Promise.all([
      Defect.aggregate([
        { $match: { project: pid, isDeleted: false } },
        { $group: { _id: '$severity', count: { $sum: 1 } } },
      ]),
      Defect.aggregate([
        { $match: { project: pid, isDeleted: false } },
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]),
      Defect.aggregate([
        { $match: { project: pid, isDeleted: false } },
        { $group: { _id: '$priority', count: { $sum: 1 } } },
      ]),
      Defect.aggregate([
        { $match: { project: pid, isDeleted: false, assignee: { $exists: true, $ne: null } } },
        { $group: { _id: '$assignee', total: { $sum: 1 }, closed: { $sum: { $cond: [{ $eq: ['$status', 'closed'] }, 1, 0] } }, open: { $sum: { $cond: [{ $ne: ['$status', 'closed'] }, 1, 0] } } } },
        { $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'user' } },
        { $unwind: '$user' },
        { $project: { name: '$user.name', email: '$user.email', avatar: '$user.avatar', total: 1, closed: 1, open: 1 } },
      ]),
      Defect.aggregate([
        { $match: { project: pid, isDeleted: false, createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } } },
        { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, created: { $sum: 1 }, closed: { $sum: { $cond: [{ $eq: ['$status', 'closed'] }, 1, 0] } } } },
        { $sort: { _id: 1 } },
      ]),
    ]);

    const totals = await Defect.countDocuments({ project: pid, isDeleted: false });
    const closedTotal = await Defect.countDocuments({ project: pid, isDeleted: false, status: 'closed' });
    const reopened = await Defect.countDocuments({ project: pid, isDeleted: false, status: 'reopened' });
    const avgResolution = await Defect.aggregate([
      { $match: { project: pid, isDeleted: false, status: 'closed', closedAt: { $exists: true } } },
      { $project: { resolutionTime: { $subtract: ['$closedAt', '$createdAt'] } } },
      { $group: { _id: null, avg: { $avg: '$resolutionTime' } } },
    ]);

    res.json({
      success: true,
      analytics: {
        totals,
        closedTotal,
        openTotal: totals - closedTotal,
        reopened,
        avgResolutionHours: avgResolution[0] ? Math.round(avgResolution[0].avg / 3600000) : 0,
        bySeverity,
        byStatus,
        byPriority,
        byAssignee,
        trend,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getDashboardStats = async (req, res) => {
  try {
    const userId = req.user._id;
    const userIdObj = mongoose.Types.ObjectId.createFromHexString(String(userId));

    const [myAssigned, myReported, recentDefects] = await Promise.all([
      Defect.countDocuments({ assignee: userId, isDeleted: false, status: { $nin: ['closed', 'rejected'] } }),
      Defect.countDocuments({ reporter: userId, isDeleted: false }),
      Defect.find({ $or: [{ assignee: userId }, { reporter: userId }], isDeleted: false })
        .sort('-updatedAt').limit(10)
        .populate('project', 'name key')
        .populate('reporter', 'name avatar')
        .populate('assignee', 'name avatar'),
    ]);

    res.json({ success: true, stats: { myAssigned, myReported, recentDefects } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
