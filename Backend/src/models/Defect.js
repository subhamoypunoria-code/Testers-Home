const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  text: { type: String, required: true },
  isInternal: { type: Boolean, default: false },
  mentions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
}, { timestamps: true });

const timeLogSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  startTime: Date,
  endTime: Date,
  duration: { type: Number, min: [0, 'Duration cannot be negative'] },
  description: String,
}, { timestamps: true });

const activitySchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  action: String,
  field: String,
  oldValue: String,
  newValue: String,
}, { timestamps: true });

const defectSchema = new mongoose.Schema({
  defectId: { type: String, unique: true },
  project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
  title: { type: String, required: true, trim: true, minlength: [3, 'Title must be at least 3 characters'], maxlength: [500, 'Title must be 500 characters or fewer'] },
  description: { type: String, default: '' },
  stepsToReproduce: { type: String, default: '' },
  expectedResult: { type: String, default: '' },
  actualResult: { type: String, default: '' },
  severity: { type: String, enum: ['blocker', 'critical', 'major', 'minor', 'trivial'], default: 'minor' },
  priority: { type: String, enum: ['urgent', 'high', 'medium', 'low'], default: 'medium' },
  environment: { type: String, default: '' },
  module: { type: String, default: '' },
  browser: { type: String, default: '' },
  device: { type: String, default: '' },
  buildVersion: { type: String, default: '' },
  attachments: [{ name: String, url: String, type: String, size: Number }],
  reporter: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  assignee: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  status: {
    type: String,
    enum: ['new','open','assigned','in_progress','ready_for_qa','retest','verified','closed','reopened','deferred','duplicate','cannot_reproduce','rejected','blocked'],
    default: 'new',
  },
  reproducibility: { type: String, enum: ['always', 'sometimes', 'rarely', 'unable'], default: 'always' },
  rootCause: { type: String, default: '' },
  tags: [String],
  linkedTestCase: { type: String, default: '' },
  linkedRequirement: { type: String, default: '' },
  closedAt: Date,
  dueDate: Date,
  comments: [commentSchema],
  timeLogs: [timeLogSchema],
  activity: [activitySchema],
  totalTimeSpent: { type: Number, default: 0 }, // minutes
  isDeleted: { type: Boolean, default: false },
  deletedAt: Date,
  deletedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  sprintId: { type: String, default: '' },
  releaseVersion: { type: String, default: '' },
}, { timestamps: true });

// Auto-generate defect ID using atomic counter to avoid race conditions during bulk inserts
defectSchema.pre('save', async function (next) {
  if (!this.defectId) {
    const project = await mongoose.model('Project').findById(this.project).select('key');
    const key = project ? project.key : 'DEF';
    const Counter = mongoose.model('Counter');
    const counterId = `defect_${this.project}`;

    // On first use, seed the counter from the real document count so IDs continue correctly
    const existing = await Counter.findById(counterId);
    if (!existing) {
      const currentCount = await mongoose.model('Defect').countDocuments({ project: this.project });
      await Counter.findOneAndUpdate(
        { _id: counterId },
        { $setOnInsert: { seq: currentCount } },
        { upsert: true, new: true }
      );
    }

    const counter = await Counter.findOneAndUpdate(
      { _id: counterId },
      { $inc: { seq: 1 } },
      { new: true }
    );
    this.defectId = `${key}-${String(counter.seq).padStart(4, '0')}`;
  }
  next();
});

defectSchema.index({ project: 1, status: 1 });
defectSchema.index({ assignee: 1 });

module.exports = mongoose.model('Defect', defectSchema);
