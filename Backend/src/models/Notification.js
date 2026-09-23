const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: {
    type: String,
    enum: ['defect_assigned', 'defect_updated', 'defect_commented', 'defect_closed', 'defect_reopened', 'mention', 'project_invite', 'sla_breach'],
    required: true,
  },
  title: { type: String, required: true },
  message: { type: String, required: true },
  link: { type: String, default: '' },
  isRead: { type: Boolean, default: false },
  relatedDefect: { type: mongoose.Schema.Types.ObjectId, ref: 'Defect' },
  relatedProject: { type: mongoose.Schema.Types.ObjectId, ref: 'Project' },
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

notificationSchema.index({ user: 1, isRead: 1 });

module.exports = mongoose.model('Notification', notificationSchema);
