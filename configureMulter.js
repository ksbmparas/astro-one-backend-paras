const multer = require('multer');
const { v4: uuidv4 } = require('uuid');

function configureMulter(destinationFolder, fields) {
  const multer = require('multer');
  const { v4: uuidv4 } = require('uuid');
  const path = require('path');

  const getFileExtension = (filename) => path.extname(filename);

  const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      const fileType = file.mimetype.startsWith('audio') ? 'audio' : 'images'; 
      cb(null, `${destinationFolder}/${fileType}`);
    },
    filename: function (req, file, cb) {
      const uniqueFilename = `${uuidv4()}${getFileExtension(file.originalname)}`;
      cb(null, uniqueFilename);
    },
  });

  const upload = multer({
    storage: storage,
    limits: { fileSize: 50 * 1024 * 1024 }, // Max file size: 50MB
  });

  return upload.fields([
    { name: "image", maxCount: 5 }, // Expect one image file
    { name: "selectMusic", maxCount: 5 }, // Expect one music file
  ]);

  // Use .fields() for multiple file fields
  return function (req, res, next) {
    upload.fields(fields)(req, res, function (err) {
      if (err instanceof multer.MulterError) {
        return res.status(500).json({ success: false, message: 'Multer error', error: err });
      } else if (err) {
        return res.status(500).json({ success: false, message: 'Error uploading file', error: err });
      }
      next();
    });
  };
}


function getFileExtension(filename) {
  return filename.slice(((filename.lastIndexOf('.') - 1) >>> 0) + 1);
}

module.exports = configureMulter;
