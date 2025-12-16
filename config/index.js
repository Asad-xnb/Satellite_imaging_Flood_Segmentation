require('dotenv').config();

module.exports = {
  mongoUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/flood-segmentation',
  port: process.env.PORT || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
  maxFileSize: process.env.MAX_FILE_SIZE || 10485760,
  uploadDir: process.env.UPLOAD_DIR || './uploads'
};
