const TestCase = require('../models/TestCase');
const Defect = require('../models/Defect');
const { generateFromDefects } = require('../utils/testCaseGenerator');

exports.generatePreview = async (req, res) => {
  try {
    const { defectIds } = req.body;
    if (!Array.isArray(defectIds) || defectIds.length === 0) {
      return res.status(400).json({ success: false, message: 'defectIds array is required' });
    }

    const defects = await Defect.find({ _id: { $in: defectIds }, project: req.params.projectId, isDeleted: false })
      .select('title description stepsToReproduce expectedResult actualResult severity priority environment module tags defectId');

    if (!defects.length) {
      return res.status(404).json({ success: false, message: 'No defects found' });
    }

    const generated = generateFromDefects(defects).map(tc => ({
      ...tc,
      linkedDefects: defects.map(d => d._id),
      project: req.params.projectId,
      createdBy: req.user._id,
      isDeleted: false,
    }));

    res.json({ success: true, count: generated.length, generated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.createFromGenerated = async (req, res) => {
  try {
    const { testCases } = req.body;
    if (!Array.isArray(testCases) || testCases.length === 0) {
      return res.status(400).json({ success: false, message: 'testCases array is required' });
    }

    const created = [];
    const failed = [];

    for (const item of testCases) {
      try {
        const safe = {
          title: item.title,
          description: item.description || '',
          type: item.type || 'positive',
          priority: item.priority || 'medium',
          severity: item.severity || 'minor',
          status: item.status || 'draft',
          prerequisites: item.prerequisites || '',
          steps: Array.isArray(item.steps) ? item.steps : [],
          expectedResult: item.expectedResult || '',
          linkedDefects: item.linkedDefects || [],
          tags: Array.isArray(item.tags) ? item.tags : [],
          project: req.params.projectId,
          createdBy: req.user._id,
        };
        const tc = await TestCase.create(safe);
        created.push(tc);
      } catch (e) {
        failed.push({ title: item.title || '(untitled)', reason: e.message });
      }
    }

    res.status(201).json({
      success: true,
      created: created.length,
      failed: failed.length,
      failures: failed,
      testCases: created,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getTestCases = async (req, res) => {
  try {
    const { status, type, priority, search, sort = '-createdAt' } = req.query;
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 20));
    const query = { project: req.params.projectId, isDeleted: false };

    if (status) query.status = status;
    if (type) query.type = type;
    if (priority) query.priority = priority;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { testCaseId: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    const total = await TestCase.countDocuments(query);
    const testCases = await TestCase.find(query)
      .populate('createdBy', 'name email avatar')
      .populate('linkedDefects', 'defectId title')
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(limit);

    res.json({ success: true, count: testCases.length, total, pages: Math.ceil(total / limit), testCases });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getTestCase = async (req, res) => {
  try {
    const testCase = await TestCase.findById(req.params.id)
      .populate('createdBy', 'name email avatar')
      .populate('linkedDefects', 'defectId title status');
    if (!testCase || testCase.isDeleted) return res.status(404).json({ success: false, message: 'Test case not found' });
    if (String(testCase.project) !== req.params.projectId) {
      return res.status(403).json({ success: false, message: 'Test case does not belong to this project' });
    }
    res.json({ success: true, testCase });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.updateTestCase = async (req, res) => {
  try {
    const old = await TestCase.findById(req.params.id);
    if (!old || old.isDeleted) return res.status(404).json({ success: false, message: 'Not found' });
    if (String(old.project) !== req.params.projectId) {
      return res.status(403).json({ success: false, message: 'Test case does not belong to this project' });
    }

    const allowed = ['title', 'description', 'type', 'priority', 'severity', 'status', 'prerequisites', 'steps', 'expectedResult', 'tags', 'linkedDefects'];
    const updates = {};
    for (const key of allowed) {
      if (req.body[key] !== undefined) updates[key] = req.body[key];
    }

    const testCase = await TestCase.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true })
      .populate('createdBy', 'name email avatar')
      .populate('linkedDefects', 'defectId title status');

    res.json({ success: true, testCase });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.deleteTestCase = async (req, res) => {
  try {
    await TestCase.findByIdAndUpdate(req.params.id, { isDeleted: true, deletedAt: new Date(), deletedBy: req.user._id });
    res.json({ success: true, message: 'Test case deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
