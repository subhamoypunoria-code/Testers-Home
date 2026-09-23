const Defect = require('../models/Defect');
const Notification = require('../models/Notification');
const mongoose = require('mongoose');
const fs = require('fs');
const { parseDefectsFromFile } = require('../utils/defectParser');

const createNotification = async (userId, type, title, message, link, defectId, projectId, senderId) => {
  try {
    await Notification.create({ user: userId, type, title, message, link, relatedDefect: defectId, relatedProject: projectId, sender: senderId });
  } catch (_) {}
};

exports.createDefect = async (req, res) => {
  try {
    const { title } = req.body;
    if (!title || !title.trim()) return res.status(400).json({ success: false, message: 'Title is required' });
    const safeBody = { ...req.body };
    delete safeBody.defectId;
    delete safeBody._id;
    delete safeBody.id;
    delete safeBody.project;
    delete safeBody.reporter;

    const defect = await Defect.create({ ...safeBody, reporter: req.user._id, project: req.params.projectId });
    await defect.populate('reporter', 'name email avatar');
    await defect.populate('assignee', 'name email avatar');

    if (defect.assignee) {
      await createNotification(defect.assignee._id, 'defect_assigned', 'New defect assigned', `${defect.defectId}: ${defect.title}`, `/projects/${defect.project}/defects/${defect._id}`, defect._id, defect.project, req.user._id);
    }

    const io = req.app.get('io');
    if (io) io.to(`project_${defect.project}`).emit('defect_created', defect);

    res.status(201).json({ success: true, defect });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getDefects = async (req, res) => {
  try {
    const { status, severity, priority, assignee, reporter, search, sort = '-createdAt' } = req.query;
    const page  = Math.max(1, parseInt(req.query.page)  || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 20));
    const query = { project: req.params.projectId, isDeleted: false };

    if (status) query.status = { $in: status.split(',') };
    if (severity) query.severity = { $in: severity.split(',') };
    if (priority) query.priority = { $in: priority.split(',') };
    if (assignee) query.assignee = assignee;
    if (reporter) query.reporter = reporter;
    if (search) query.$or = [
      { title: { $regex: search, $options: 'i' } },
      { defectId: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
    ];

    const total = await Defect.countDocuments(query);
    const defects = await Defect.find(query)
      .populate('reporter', 'name email avatar')
      .populate('assignee', 'name email avatar')
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(limit);

    res.json({ success: true, count: defects.length, total, pages: Math.ceil(total / limit), defects });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getDefect = async (req, res) => {
  try {
    const defect = await Defect.findById(req.params.id)
      .populate('reporter', 'name email avatar')
      .populate('assignee', 'name email avatar')
      .populate('comments.user', 'name email avatar')
      .populate('timeLogs.user', 'name email avatar')
      .populate('activity.user', 'name email avatar');
    if (!defect || defect.isDeleted) return res.status(404).json({ success: false, message: 'Defect not found' });
    res.json({ success: true, defect });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.updateDefect = async (req, res) => {
  try {
    const old = await Defect.findById(req.params.id);
    if (!old || old.isDeleted) return res.status(404).json({ success: false, message: 'Not found' });
    if (String(old.project) !== req.params.projectId) {
      return res.status(403).json({ success: false, message: 'Defect does not belong to this project' });
    }

    const activity = [];
    const tracked = ['status', 'assignee', 'severity', 'priority'];
    tracked.forEach(field => {
      if (req.body[field] && req.body[field] !== String(old[field])) {
        activity.push({ user: req.user._id, action: 'updated', field, oldValue: String(old[field]), newValue: String(req.body[field]) });
      }
    });

    if (req.body.status === 'closed' && old.status !== 'closed') req.body.closedAt = new Date();

    const defect = await Defect.findByIdAndUpdate(
      req.params.id,
      { ...req.body, $push: { activity: { $each: activity } } },
      { new: true, runValidators: true }
    ).populate('reporter', 'name email avatar').populate('assignee', 'name email avatar');

    const io = req.app.get('io');
    if (io) io.to(`project_${defect.project}`).emit('defect_updated', defect);

    if (req.body.assignee && req.body.assignee !== String(old.assignee)) {
      await createNotification(req.body.assignee, 'defect_assigned', 'Defect assigned to you', `${defect.defectId}: ${defect.title}`, `/projects/${defect.project}/defects/${defect._id}`, defect._id, defect.project, req.user._id);
    }

    res.json({ success: true, defect });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.deleteDefect = async (req, res) => {
  try {
    await Defect.findByIdAndUpdate(req.params.id, { isDeleted: true, deletedAt: new Date(), deletedBy: req.user._id });
    res.json({ success: true, message: 'Moved to trash' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.addComment = async (req, res) => {
  try {
    const { text, isInternal, mentions } = req.body;
    if (!text || !text.trim()) return res.status(400).json({ success: false, message: 'Comment text is required' });
    if (text.length > 5000) return res.status(400).json({ success: false, message: 'Comment must be 5000 characters or fewer' });
    const defect = await Defect.findByIdAndUpdate(
      req.params.id,
      { $push: { comments: { user: req.user._id, text, isInternal: isInternal || false, mentions: mentions || [] } } },
      { new: true }
    ).populate('comments.user', 'name email avatar');

    if (defect.assignee && String(defect.assignee) !== String(req.user._id)) {
      await createNotification(defect.assignee, 'defect_commented', 'New comment on defect', `${req.user.name}: ${text.substring(0, 80)}`, `/projects/${defect.project}/defects/${defect._id}`, defect._id, defect.project, req.user._id);
    }

    const io = req.app.get('io');
    if (io) io.to(`defect_${defect._id}`).emit('comment_added', defect.comments[defect.comments.length - 1]);

    res.json({ success: true, comments: defect.comments });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.logTime = async (req, res) => {
  try {
    const { description, startTime, endTime } = req.body;
    const duration = parseFloat(req.body.duration);
    if (isNaN(duration) || duration <= 0) return res.status(400).json({ success: false, message: 'Duration must be a positive number (minutes)' });
    const defect = await Defect.findByIdAndUpdate(
      req.params.id,
      {
        $push: { timeLogs: { user: req.user._id, duration, description, startTime, endTime } },
        $inc: { totalTimeSpent: duration },
      },
      { new: true }
    );
    res.json({ success: true, timeLogs: defect.timeLogs, totalTimeSpent: defect.totalTimeSpent });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.uploadAttachment = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded' });
    const attachment = { name: req.file.originalname, url: `/uploads/${req.file.filename}`, type: req.file.mimetype, size: req.file.size };
    const defect = await Defect.findByIdAndUpdate(req.params.id, { $push: { attachments: attachment } }, { new: true });
    res.json({ success: true, attachments: defect.attachments });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getTrash = async (req, res) => {
  try {
    const defects = await Defect.find({ project: req.params.projectId, isDeleted: true })
      .populate('reporter', 'name email avatar')
      .populate('deletedBy', 'name email avatar')
      .sort('-deletedAt');
    res.json({ success: true, defects });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.restoreDefect = async (req, res) => {
  try {
    await Defect.findByIdAndUpdate(req.params.id, { isDeleted: false, deletedAt: null, deletedBy: null });
    res.json({ success: true, message: 'Defect restored' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.bulkRestore = async (req, res) => {
  try {
    const { ids } = req.body;
    if (!ids?.length) return res.status(400).json({ success: false, message: 'No ids provided' });
    await Defect.updateMany({ _id: { $in: ids } }, { isDeleted: false, deletedAt: null, deletedBy: null });
    res.json({ success: true, message: `${ids.length} defect${ids.length > 1 ? 's' : ''} restored` });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.permanentDelete = async (req, res) => {
  try {
    await Defect.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Permanently deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.bulkPermanentDelete = async (req, res) => {
  try {
    const { ids } = req.body;
    if (!ids?.length) return res.status(400).json({ success: false, message: 'No ids provided' });
    await Defect.deleteMany({ _id: { $in: ids } });
    res.json({ success: true, message: `${ids.length} defect${ids.length > 1 ? 's' : ''} permanently deleted` });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.bulkUpdate = async (req, res) => {
  try {
    const { ids, update } = req.body;
    if (!ids?.length) return res.status(400).json({ success: false, message: 'No ids provided' });
    await Defect.updateMany({ _id: { $in: ids } }, update);
    res.json({ success: true, message: `${ids.length} defects updated` });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.bulkDelete = async (req, res) => {
  try {
    const { ids } = req.body;
    if (!ids?.length) return res.status(400).json({ success: false, message: 'No ids provided' });
    const result = await Defect.updateMany(
      { _id: { $in: ids } },
      { isDeleted: true, deletedAt: new Date(), deletedBy: req.user._id }
    );
    res.json({ success: true, message: `${ids.length} defect${ids.length > 1 ? 's' : ''} moved to trash`, matched: result.matchedCount, modified: result.modifiedCount });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.bulkUploadPreview = async (req, res) => {
  const filePath = req.file?.path;
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded' });
    const { parseDefectsFromFile, getRawText } = require('../utils/defectParser');
    const rawText = await getRawText(filePath, req.file.mimetype);
    const parsed  = await parseDefectsFromFile(filePath, req.file.mimetype);
    res.json({ success: true, rawText: rawText.slice(0, 3000), parsed, count: parsed.length });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  } finally {
    if (filePath) fs.unlink(filePath, () => {});
  }
};

exports.bulkUploadFromFile = async (req, res) => {
  const filePath = req.file?.path;
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded' });

    const parsed = await parseDefectsFromFile(filePath, req.file.mimetype);

    if (!parsed.length) {
      return res.status(422).json({ success: false, message: 'No defects found in the file. Check the format guide.' });
    }

    const created = [];
    const failed  = [];

    for (const item of parsed) {
      try {
        // never let the file override the auto-generated defectId
        const { defectId: _ignored, _id: _id2, id: _id3, ...safeItem } = item;
        const defect = await Defect.create({
          ...safeItem,
          project:  req.params.projectId,
          reporter: req.user._id,
        });
        await defect.populate('reporter', 'name email avatar');
        created.push(defect);

        const io = req.app.get('io');
        if (io) io.to(`project_${defect.project}`).emit('defect_created', defect);
      } catch (e) {
        failed.push({ title: item.title || '(untitled)', reason: e.message });
      }
    }

    res.status(201).json({
      success: true,
      created: created.length,
      failed:  failed.length,
      failures: failed,
      defects: created,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  } finally {
    if (filePath) fs.unlink(filePath, () => {});
  }
};
