const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../config/cloudinary.config'); // Adjust the path as necessary

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'interview_videos',
    resource_type: 'video', // Important for video uploads
    format: async (req, file) => 'webm', // or 'mp4' depending on input
    public_id: (req, file) => `interview_${Date.now()}`,
  },
});

const upload = multer({ storage });

module.exports = upload;
