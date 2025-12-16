const fs = require('fs').promises;
const Comparison = require('../models/Comparison');
const SegmentationResult = require('../models/SegmentationResult');
const Image = require('../models/Image');
const { calculateFloodChange } = require('../utils/imageProcessing');

// Compare two segmented images
exports.compareImages = async (req, res) => {
  try {
    const { preSegmentationId, postSegmentationId } = req.body;

    if (!preSegmentationId || !postSegmentationId) {
      return res.status(400).json({
        success: false,
        message: 'Both pre and post segmentation IDs are required'
      });
    }

    const preSeg = await SegmentationResult.findById(preSegmentationId)
      .populate('imageId');
    const postSeg = await SegmentationResult.findById(postSegmentationId)
      .populate('imageId');

    if (!preSeg || !postSeg) {
      return res.status(404).json({
        success: false,
        message: 'One or both segmentation results not found'
      });
    }

    // Calculate flood change percentage
    const floodChangePercentage = calculateFloodChange(
      preSeg.floodPixels,
      postSeg.floodPixels
    );

    const floodChangePixels = postSeg.floodPixels - preSeg.floodPixels;

    // Store comparison in database
    const comparison = new Comparison({
      preImageId: preSeg.imageId._id,
      postImageId: postSeg.imageId._id,
      preSegmentationId: preSeg._id,
      postSegmentationId: postSeg._id,
      preFloodPixels: preSeg.floodPixels,
      postFloodPixels: postSeg.floodPixels,
      floodChangePercentage,
      floodChangePixels,
      dateRange: {
        start: preSeg.imageId.uploadedAt,
        end: postSeg.imageId.uploadedAt
      }
    });

    await comparison.save();

    res.json({
      success: true,
      message: 'Comparison completed',
      result: {
        comparisonId: comparison._id,
        preImage: {
          name: preSeg.imageId.originalName,
          floodPixels: preSeg.floodPixels,
          floodPercentage: preSeg.floodPercentage.toFixed(2)
        },
        postImage: {
          name: postSeg.imageId.originalName,
          floodPixels: postSeg.floodPixels,
          floodPercentage: postSeg.floodPercentage.toFixed(2)
        },
        floodChangePercentage: floodChangePercentage.toFixed(2),
        floodChangePixels,
        interpretation:
          floodChangePercentage > 0
            ? `Water increased by ${Math.abs(floodChangePercentage).toFixed(2)}%`
            : `Water decreased by ${Math.abs(floodChangePercentage).toFixed(2)}%`
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get comparison history
exports.getComparisons = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const comparisons = await Comparison.find()
      .populate('preImageId postImageId')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Comparison.countDocuments();

    res.json({
      success: true,
      data: comparisons,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get specific comparison
exports.getComparison = async (req, res) => {
  try {
    const { comparisonId } = req.params;

    const comparison = await Comparison.findById(comparisonId)
      .populate('preImageId postImageId preSegmentationId postSegmentationId');

    if (!comparison) {
      return res.status(404).json({
        success: false,
        message: 'Comparison not found'
      });
    }

    res.json({
      success: true,
      data: comparison
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
