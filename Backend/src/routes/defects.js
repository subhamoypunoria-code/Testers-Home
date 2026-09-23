const express = require('express');
const router = express.Router({ mergeParams: true });
const { protect, checkProjectAccess } = require('../middleware/auth');
const upload = require('../middleware/upload');
const {
  createDefect, getDefects, getDefect, updateDefect, deleteDefect,
  addComment, logTime, uploadAttachment, getTrash, restoreDefect, permanentDelete,
  bulkUpdate, bulkDelete, bulkUploadFromFile, bulkUploadPreview, bulkPermanentDelete, bulkRestore,
} = require('../controllers/defectController');

router.use(protect);
router.use(checkProjectAccess);

router.route('/').get(getDefects).post(createDefect);
router.route('/bulk').put(bulkUpdate);
router.post('/bulk-delete', bulkDelete);
router.post('/bulk-permanent-delete', bulkPermanentDelete);
router.post('/bulk-restore', bulkRestore);
router.post('/bulk-upload', upload.single('file'), bulkUploadFromFile);
router.post('/bulk-upload/preview', upload.single('file'), bulkUploadPreview);
router.route('/trash').get(getTrash);
router.route('/:id').get(getDefect).put(updateDefect).delete(deleteDefect);
router.post('/:id/comments', addComment);
router.post('/:id/time', logTime);
router.post('/:id/attachments', upload.single('file'), uploadAttachment);
router.put('/:id/restore', restoreDefect);
router.delete('/:id/permanent', permanentDelete);

module.exports = router;
