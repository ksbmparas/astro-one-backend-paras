const multer = require('multer');
const { v4: uuidv4 } = require('uuid');

function configureMulter(destinationFolder, fields, maxCount) {
  const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      const fileType = file.mimetype.startsWith('audio')
        ? 'audio'
        : file.mimetype === 'image/gif'
        ? 'gifs'
        : 'images'; 
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

  if (Array.isArray(fields)) {
    // Use .fields() if fields is an array of objects
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
  } else if (typeof fields === 'string') {
    // Use .array() if fields is a single string (name of the field)
    return function (req, res, next) {
      upload.array(fields, maxCount)(req, res, function (err) {
        if (err instanceof multer.MulterError) {
          return res.status(500).json({ success: false, message: 'Multer error', error: err });
        } else if (err) {
          return res.status(500).json({ success: false, message: 'Error uploading file', error: err });
        }
        next();
      });
    };
  }

  // Default case if no fields are passed (single file upload)
  return function (req, res, next) {
    upload.single('file')(req, res, function (err) {
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
