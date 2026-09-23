export const SEVERITY_COLORS = {
  blocker: 'text-red-400 bg-red-400/10 border-red-400/20',
  critical: 'text-orange-400 bg-orange-400/10 border-orange-400/20',
  major: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20',
  minor: 'text-blue-400 bg-blue-400/10 border-blue-400/20',
  trivial: 'text-gray-400 bg-gray-400/10 border-gray-400/20',
};

export const PRIORITY_COLORS = {
  urgent: 'text-red-400',
  high: 'text-orange-400',
  medium: 'text-yellow-400',
  low: 'text-gray-400',
};

export const STATUS_COLORS = {
  new: 'text-blue-400 bg-blue-400/10',
  open: 'text-cyan-400 bg-cyan-400/10',
  assigned: 'text-purple-400 bg-purple-400/10',
  in_progress: 'text-orange-400 bg-orange-400/10',
  ready_for_qa: 'text-yellow-400 bg-yellow-400/10',
  retest: 'text-pink-400 bg-pink-400/10',
  verified: 'text-teal-400 bg-teal-400/10',
  closed: 'text-green-400 bg-green-400/10',
  reopened: 'text-red-400 bg-red-400/10',
  deferred: 'text-gray-400 bg-gray-400/10',
  duplicate: 'text-gray-400 bg-gray-400/10',
  cannot_reproduce: 'text-gray-400 bg-gray-400/10',
  rejected: 'text-red-400 bg-red-400/10',
  blocked: 'text-red-500 bg-red-500/10',
};

export const STATUS_LABELS = {
  new: 'New',
  open: 'Open',
  assigned: 'Assigned',
  in_progress: 'In Progress',
  ready_for_qa: 'Ready for QA',
  retest: 'Retest',
  verified: 'Verified',
  closed: 'Closed',
  reopened: 'Reopened',
  deferred: 'Deferred',
  duplicate: 'Duplicate',
  cannot_reproduce: 'Cannot Reproduce',
  rejected: 'Rejected',
  blocked: 'Blocked',
};

export const SEVERITY_OPTIONS = ['blocker', 'critical', 'major', 'minor', 'trivial'];
export const PRIORITY_OPTIONS = ['urgent', 'high', 'medium', 'low'];
export const STATUS_OPTIONS = Object.keys(STATUS_LABELS);
export const ROLE_OPTIONS = ['super_admin', 'project_admin', 'manager', 'tester', 'developer', 'viewer'];

// Test case specific constants
export const TESTCASE_TYPE_COLORS = {
  positive: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20',
  negative: 'text-red-400 bg-red-400/10 border-red-400/20',
  regression: 'text-blue-400 bg-blue-400/10 border-blue-400/20',
  smoke: 'text-purple-400 bg-purple-400/10 border-purple-400/20',
};

export const TESTCASE_STATUS_COLORS = {
  draft: 'text-yellow-400 bg-yellow-400/10',
  active: 'text-emerald-400 bg-emerald-400/10',
  archived: 'text-gray-400 bg-gray-400/10',
};

export const TESTCASE_TYPE_OPTIONS = ['positive', 'negative', 'regression', 'smoke'];
export const TESTCASE_STATUS_OPTIONS = ['draft', 'active', 'archived'];
