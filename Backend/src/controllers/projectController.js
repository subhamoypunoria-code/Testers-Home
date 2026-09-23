const Project = require('../models/Project');
const User = require('../models/User');
const Defect = require('../models/Defect');

const ALLOWED_PROJECT_FIELDS = ['name', 'description', 'type', 'clientName', 'startDate', 'endDate', 'environment', 'techStack', 'priority', 'repositoryUrl', 'qaLead', 'devLead', 'status', 'tags', 'releaseVersion', 'testingType'];

exports.createProject = async (req, res) => {
  try {
    const { name, key } = req.body;
    if (!name || !name.trim()) return res.status(400).json({ success: false, message: 'Project name is required' });
    if (!key || !key.trim()) return res.status(400).json({ success: false, message: 'Project key is required' });
    if (key.trim().length < 2 || key.trim().length > 10) return res.status(400).json({ success: false, message: 'Project key must be 2–10 characters' });
    const project = await Project.create({ ...req.body, owner: req.user._id, members: [{ user: req.user._id, role: 'project_admin' }] });
    res.status(201).json({ success: true, project });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getProjects = async (req, res) => {
  try {
    const query = { isDeleted: false };
    if (req.user.role !== 'super_admin') {
      query.$or = [{ owner: req.user._id }, { 'members.user': req.user._id }];
    }
    const projects = await Project.find(query)
      .populate('owner', 'name email avatar')
      .populate('qaLead', 'name email avatar')
      .populate('devLead', 'name email avatar')
      .populate('members.user', 'name email avatar role')
      .sort('-createdAt');
    res.json({ success: true, count: projects.length, projects });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('owner', 'name email avatar')
      .populate('qaLead', 'name email avatar')
      .populate('devLead', 'name email avatar')
      .populate('members.user', 'name email avatar role');
    if (!project || project.isDeleted) return res.status(404).json({ success: false, message: 'Project not found' });
    res.json({ success: true, project });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.updateProject = async (req, res) => {
  try {
    const allowed = {};
    for (const key of ALLOWED_PROJECT_FIELDS) {
      if (req.body[key] !== undefined) allowed[key] = req.body[key];
    }
    const project = await Project.findByIdAndUpdate(req.params.id, allowed, { new: true, runValidators: true })
      .populate('owner', 'name email avatar')
      .populate('members.user', 'name email avatar role');
    if (!project) return res.status(404).json({ success: false, message: 'Project not found' });
    res.json({ success: true, project });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.deleteProject = async (req, res) => {
  try {
    await Project.findByIdAndUpdate(req.params.id, { isDeleted: true });
    res.json({ success: true, message: 'Project archived' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.addMember = async (req, res) => {
  try {
    const { email, role } = req.body;
    if (!email) return res.status(400).json({ success: false, message: 'Email is required' });
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    const project = await Project.findById(req.params.id);
    if (!project || project.isDeleted) return res.status(404).json({ success: false, message: 'Project not found' });
    const exists = project.members.find(m => m.user.toString() === user._id.toString());
    if (exists) return res.status(400).json({ success: false, message: 'User already a member' });

    project.members.push({ user: user._id, role: role || 'tester' });
    await project.save();

    await project.populate('members.user', 'name email avatar role');
    res.json({ success: true, project });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.removeMember = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project || project.isDeleted) return res.status(404).json({ success: false, message: 'Project not found' });
    project.members = project.members.filter(m => m.user.toString() !== req.params.userId);
    await project.save();
    res.json({ success: true, message: 'Member removed' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getProjectStats = async (req, res) => {
  try {
    const projectId = req.params.id;
    if (!require('mongoose').Types.ObjectId.isValid(projectId)) {
      return res.status(400).json({ success: false, message: 'Invalid project ID' });
    }
    const [total, open, closed, inProgress, critical, blocker] = await Promise.all([
      Defect.countDocuments({ project: projectId, isDeleted: false }),
      Defect.countDocuments({ project: projectId, isDeleted: false, status: { $in: ['new', 'open', 'assigned'] } }),
      Defect.countDocuments({ project: projectId, isDeleted: false, status: 'closed' }),
      Defect.countDocuments({ project: projectId, isDeleted: false, status: 'in_progress' }),
      Defect.countDocuments({ project: projectId, isDeleted: false, severity: 'critical' }),
      Defect.countDocuments({ project: projectId, isDeleted: false, severity: 'blocker' }),
    ]);

    const bySeverity = await Defect.aggregate([
      { $match: { project: require('mongoose').Types.ObjectId.createFromHexString(projectId), isDeleted: false } },
      { $group: { _id: '$severity', count: { $sum: 1 } } },
    ]);

    const byStatus = await Defect.aggregate([
      { $match: { project: require('mongoose').Types.ObjectId.createFromHexString(projectId), isDeleted: false } },
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);

    res.json({ success: true, stats: { total, open, closed, inProgress, critical, blocker, bySeverity, byStatus } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
