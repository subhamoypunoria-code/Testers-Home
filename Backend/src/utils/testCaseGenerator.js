// Rule-based test-case generator. No external AI / API keys needed.
// Converts a defect into one positive and one negative test case.

function cleanLines(text = '') {
  return text
    .split(/\r?\n/)
    .map(l => l.trim().replace(/^[-\d\.\)\]]+\s*/, ''))
    .filter(Boolean);
}

function inferSteps(defect) {
  const { title = '', description = '', module = '' } = defect;
  const steps = [];
  if (module) steps.push(`Navigate to the ${module} section`);
  if (title) {
    // Try to extract a verb phrase from the title
    const match = title.match(/(cannot|can't|unable to|fails to|error when|bug in)\s+(.{3,60})/i);
    const action = match ? match[2] : title;
    steps.push(`Perform the action: ${action}`);
  }
  if (description) {
    // If we still have no steps, split description into sentences and use the first two
    const sentences = description.split(/[.!?]/).map(s => s.trim()).filter(Boolean).slice(0, 2);
    sentences.forEach(s => steps.push(s));
  }
  if (steps.length === 0) steps.push('Execute the related user workflow');
  return steps;
}

function buildPositiveTest(defect) {
  const steps = cleanLines(defect.stepsToReproduce).length
    ? cleanLines(defect.stepsToReproduce)
    : inferSteps(defect);

  const expected = defect.expectedResult?.trim()
    ? defect.expectedResult.trim()
    : `The feature under test works correctly without any error`;

  const feature = defect.title.replace(/(bug|error|issue|defect|fail|crash|broken|not working)/gi, '').trim();

  return {
    title: feature ? `Verify ${feature} works as expected` : `Verify ${defect.title}`,
    description: `Positive regression test derived from defect ${defect.defectId || ''}.`,
    type: 'positive',
    priority: defect.priority || 'medium',
    severity: defect.severity || 'minor',
    prerequisites: defect.environment ? `Environment: ${defect.environment}` : '',
    steps,
    expectedResult: expected,
    tags: [...(defect.tags || []), 'auto-generated', 'positive'],
  };
}

function buildNegativeTest(defect) {
  const steps = cleanLines(defect.stepsToReproduce).length
    ? cleanLines(defect.stepsToReproduce)
    : inferSteps(defect);

  const expected = defect.actualResult?.trim()
    ? `The system should handle the scenario gracefully. Specifically: ${defect.actualResult.trim()} should NOT occur.`
    : `The system should display a user-friendly error or validation message and prevent the issue.`;

  return {
    title: `Verify ${defect.title} is handled gracefully`,
    description: `Negative test to ensure the defect scenario described in ${defect.defectId || ''} no longer reproduces.`,
    type: 'negative',
    priority: defect.priority || 'medium',
    severity: defect.severity || 'minor',
    prerequisites: defect.environment ? `Environment: ${defect.environment}` : '',
    steps,
    expectedResult: expected,
    tags: [...(defect.tags || []), 'auto-generated', 'negative'],
  };
}

/**
 * Generate test cases from one or more defects.
 * @param {Object|Object[]} defects - Defect document(s)
 * @returns {Object[]} Array of raw test-case objects (not yet saved)
 */
function generateFromDefects(defects) {
  const list = Array.isArray(defects) ? defects : [defects];
  const generated = [];
  for (const defect of list) {
    generated.push(buildPositiveTest(defect));
    generated.push(buildNegativeTest(defect));
  }
  return generated;
}

module.exports = { generateFromDefects };
