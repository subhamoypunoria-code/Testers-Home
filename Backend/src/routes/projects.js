const express = require('express');
const router = express.Router();
const { protect, checkProjectAccess } = require('../middleware/auth');
const {
  createProject, getProjects, getProject, updateProject, deleteProject,
  addMember, removeMember, getProjectStats,
} = require('../controllers/projectController');

router.use(protect);

router.route('/').get(getProjects).post(createProject);
router.route('/:id').get(checkProjectAccess, getProject).put(checkProjectAccess, updateProject).delete(checkProjectAccess, deleteProject);
router.get('/:id/stats', checkProjectAccess, getProjectStats);
router.post('/:id/members', checkProjectAccess, addMember);
router.delete('/:id/members/:userId', checkProjectAccess, removeMember);

module.exports = router;
