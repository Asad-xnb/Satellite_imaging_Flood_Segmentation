const mongoose = require('mongoose');

const imageSchema = new mongoose.Schema(
  {
    filename: {
      type: String,
      required: true
    },
    originalName: {
      type: String,
      required: true
    },
    mimeType: {
      type: String,
      default: 'image/jpeg'
    },
    size: {
      type: Number
    },
    gridFsId: {
      type: mongoose.Schema.Types.ObjectId
    },
    uploadedAt: {
      type: Date,
      default: Date.now
    },
    metadata: {
      width: Number,
      height: Number
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Image', imageSchema);
