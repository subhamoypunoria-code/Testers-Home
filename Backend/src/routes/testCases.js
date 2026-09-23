const express = require('express');
const router = express.Router({ mergeParams: true });
const { protect, checkProjectAccess } = require('../middleware/auth');
const {
  generatePreview,
  createFromGenerated,
  getTestCases,
  getTestCase,
  updateTestCase,
  deleteTestCase,
} = require('../controllers/testCaseController');

router.use(protect);
router.use(checkProjectAccess);

router.route('/').get(getTestCases);
router.post('/generate', generatePreview);
router.post('/generate/save', createFromGenerated);
router.route('/:id').get(getTestCase).put(updateTestCase).delete(deleteTestCase);

module.exports = router;
