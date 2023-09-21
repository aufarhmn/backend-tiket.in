const multer = require('multer');

exports.uploadImage = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 2 * 1024 * 1024,
        files: 1
    },
    fileFilter: (req, file, cb) => {
        const fileTypes = /jpeg|jpg|png/;
        const mimeType = fileTypes.test(file.mimetype);

        if (mimeType) {
            cb(null, true);
        } else {
            cb(new Error('Only support image file!'), false);
        }
    }
})