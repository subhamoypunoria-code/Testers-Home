const mongoose = require('mongoose');

const memberSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  role: { type: String, enum: ['project_admin', 'manager', 'tester', 'developer', 'viewer'], default: 'tester' },
  joinedAt: { type: Date, default: Date.now },
});

const projectSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  key: { type: String, required: true, uppercase: true, trim: true, minlength: [2, 'Key must be at least 2 characters'], maxlength: [10, 'Key must be 10 characters or fewer'] },
  description: { type: String, default: '' },
  type: { type: String, enum: ['web', 'mobile', 'api', 'desktop', 'other'], default: 'web' },
  clientName: { type: String, default: '' },
  startDate: Date,
  endDate: Date,
  environment: { type: String, default: 'staging' },
  techStack: [String],
  priority: { type: String, enum: ['low', 'medium', 'high', 'critical'], default: 'medium' },
  repositoryUrl: { type: String, default: '' },
  qaLead: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  devLead: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  members: [memberSchema],
  status: { type: String, enum: ['active', 'inactive', 'archived', 'completed'], default: 'active' },
  tags: [String],
  releaseVersion: { type: String, default: '1.0.0' },
  testingType: [String],
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  defectCount: { type: Number, default: 0 },
  isDeleted: { type: Boolean, default: false },
}, { timestamps: true });

projectSchema.index({ key: 1, owner: 1 }, { unique: true });

module.exports = mongoose.model('Project', projectSchema);
