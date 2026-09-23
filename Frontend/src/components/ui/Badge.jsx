import { STATUS_COLORS, STATUS_LABELS, SEVERITY_COLORS, PRIORITY_COLORS, TESTCASE_TYPE_COLORS, TESTCASE_STATUS_COLORS } from '../../utils/constants';
import { capitalize } from '../../utils/helpers';

export const StatusBadge = ({ status }) => (
  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold tracking-wide ${STATUS_COLORS[status] || 'text-gray-400 bg-gray-400/10'}`}>
    {STATUS_LABELS[status] || capitalize(status)}
  </span>
);

export const SeverityBadge = ({ severity }) => (
  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold tracking-wide border ${SEVERITY_COLORS[severity] || 'text-gray-400 bg-gray-400/10 border-gray-400/20'}`}>
    {capitalize(severity)}
  </span>
);

export const PriorityBadge = ({ priority }) => {
  const icons = { urgent: '↑↑', high: '↑', medium: '→', low: '↓' };
  return (
    <span className={`inline-flex items-center gap-1 text-[11px] font-semibold ${PRIORITY_COLORS[priority] || 'text-gray-400'}`}>
      <span>{icons[priority] || '→'}</span>
      {capitalize(priority)}
    </span>
  );
};

export const TestCaseTypeBadge = ({ type }) => (
  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold tracking-wide border ${TESTCASE_TYPE_COLORS[type] || 'text-gray-400 bg-gray-400/10 border-gray-400/20'}`}>
    {capitalize(type)}
  </span>
);

export const TestCaseStatusBadge = ({ status }) => (
  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold tracking-wide ${TESTCASE_STATUS_COLORS[status] || 'text-gray-400 bg-gray-400/10'}`}>
    {capitalize(status)}
  </span>
);
