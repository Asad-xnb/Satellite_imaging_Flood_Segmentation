const mongoose = require('mongoose');

const comparisonSchema = new mongoose.Schema(
  {
    preImageId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Image',
      required: true
    },
    postImageId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Image',
      required: true
    },
    preSegmentationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'SegmentationResult',
      required: true
    },
    postSegmentationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'SegmentationResult',
      required: true
    },
    preFloodPixels: {
      type: Number,
      required: true
    },
    postFloodPixels: {
      type: Number,
      required: true
    },
    floodChangePercentage: {
      type: Number,
      required: true
    },
    floodChangePixels: {
      type: Number
    },
    description: String,
    location: String,
    dateRange: {
      start: Date,
      end: Date
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Comparison', comparisonSchema);
