const multer = require('multer');

// Configure multer for memory storage
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
      fileSize: 5 * 1024 * 1024, // 5MB limit
    },
    fileFilter(req, file, cb) {
      // You can add file type validation here if needed
      cb(null, true);
    }
});

module.exports = { upload };
