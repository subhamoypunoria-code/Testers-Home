const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Project = require('../models/Project');

exports.protect = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }
  if (!token) return res.status(401).json({ success: false, message: 'Not authorized' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id);
    if (!req.user || !req.user.isActive) {
      return res.status(401).json({ success: false, message: 'User not found or inactive' });
    }
    next();
  } catch {
    return res.status(401).json({ success: false, message: 'Invalid token' });
  }
};

exports.authorize = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    return res.status(403).json({ success: false, message: 'Access denied' });
  }
  next();
};

exports.checkProjectAccess = async (req, res, next) => {
  const projectId = req.params.projectId || req.params.id;
  if (!projectId) return next();

  if (!require('mongoose').Types.ObjectId.isValid(projectId)) {
    return res.status(400).json({ success: false, message: 'Invalid project ID' });
  }

  const project = await Project.findById(projectId);
  if (!project || project.isDeleted) {
    return res.status(404).json({ success: false, message: 'Project not found' });
  }

  const isMember = project.owner.toString() === req.user._id.toString() ||
    project.members.some(m => m.user.toString() === req.user._id.toString());

  if (req.user.role !== 'super_admin' && !isMember) {
    return res.status(403).json({ success: false, message: 'Access denied' });
  }

  req.project = project;
  next();
};
