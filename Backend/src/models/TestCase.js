const mongoose = require('mongoose');

const testCaseSchema = new mongoose.Schema({
  testCaseId: { type: String, unique: true },
  project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
  title: { type: String, required: true, trim: true, minlength: [3, 'Title must be at least 3 characters'], maxlength: [500, 'Title must be 500 characters or fewer'] },
  description: { type: String, default: '' },
  type: { type: String, enum: ['positive', 'negative', 'regression', 'smoke'], default: 'positive' },
  priority: { type: String, enum: ['urgent', 'high', 'medium', 'low'], default: 'medium' },
  severity: { type: String, enum: ['blocker', 'critical', 'major', 'minor', 'trivial'], default: 'minor' },
  status: { type: String, enum: ['draft', 'active', 'archived'], default: 'draft' },
  prerequisites: { type: String, default: '' },
  steps: [{ type: String, trim: true }],
  expectedResult: { type: String, default: '' },
  linkedDefects: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Defect' }],
  tags: [String],
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  isDeleted: { type: Boolean, default: false },
  deletedAt: Date,
  deletedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

// Auto-generate test case ID using atomic counter (same pattern as Defect)
testCaseSchema.pre('save', async function (next) {
  if (!this.testCaseId) {
    const project = await mongoose.model('Project').findById(this.project).select('key');
    const key = project ? project.key : 'TC';
    const Counter = mongoose.model('Counter');
    const counterId = `testcase_${this.project}`;

    const existing = await Counter.findById(counterId);
    if (!existing) {
      const currentCount = await mongoose.model('TestCase').countDocuments({ project: this.project });
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
    this.testCaseId = `${key}-TC-${String(counter.seq).padStart(4, '0')}`;
  }
  next();
});

testCaseSchema.index({ project: 1, status: 1 });
testCaseSchema.index({ project: 1, type: 1 });

module.exports = mongoose.model('TestCase', testCaseSchema);
