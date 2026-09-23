const multer = require('multer');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, process.env.UPLOAD_PATH || './uploads'),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${uuidv4()}${ext}`);
  },
});

const fileFilter = (req, file, cb) => {
  const allowedExt  = /jpeg|jpg|png|gif|pdf|xlsx|xls|csv|docx|doc|txt|mp4|webm|log|md/;
  const allowedMime = /jpeg|jpg|png|gif|pdf|xlsx|xls|csv|docx|doc|txt|mp4|webm|log|md|spreadsheet|msword|officedocument/;
  const ext  = allowedExt.test(path.extname(file.originalname).toLowerCase());
  const mime = allowedMime.test(file.mimetype);
  if (ext || mime) return cb(null, true);
  cb(new Error('File type not allowed'));
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024 },
});

module.exports = upload;
