const mongoose = require('mongoose');

const segmentationResultSchema = new mongoose.Schema(
  {
    imageId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Image',
      required: true
    },
    binaryMaskId: {
      type: mongoose.Schema.Types.ObjectId
    },
    maskedImageId: {
      type: mongoose.Schema.Types.ObjectId
    },
    floodPixels: {
      type: Number,
      required: true
    },
    totalPixels: {
      type: Number,
      required: true
    },
    floodPercentage: {
      type: Number,
      required: true
    },
    thresholds: {
      hMin: { type: Number, default: 0.063 },
      hMax: { type: Number, default: 0.212 },
      sMin: { type: Number, default: 0.021 },
      sMax: { type: Number, default: 0.408 },
      vMin: { type: Number, default: 0.623 },
      vMax: { type: Number, default: 1.0 }
    },
    processingTime: {
      type: Number // milliseconds
    },
    processedAt: {
      type: Date,
      default: Date.now
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('SegmentationResult', segmentationResultSchema);
