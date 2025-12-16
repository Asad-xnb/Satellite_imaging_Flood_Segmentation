const fs = require('fs').promises;
const Image = require('../models/Image');
const SegmentationResult = require('../models/SegmentationResult');
const { segmentFlood, segmentFloodCustom } = require('../utils/imageProcessing');
const sharp = require('sharp');

// Upload image
exports.uploadImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    // Get image metadata
    const metadata = await sharp(req.file.path).metadata();

    const image = new Image({
      filename: req.file.filename,
      originalName: req.file.originalname,
      mimeType: req.file.mimetype,
      size: req.file.size,
      metadata: {
        width: metadata.width,
        height: metadata.height
      }
    });

    await image.save();

    res.json({
      success: true,
      message: 'Image uploaded successfully',
      image: {
        id: image._id,
        filename: image.originalName,
        width: metadata.width,
        height: metadata.height
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Segment a single image
exports.segmentImage = async (req, res) => {
  try {
    const { imageId } = req.params;

    const image = await Image.findById(imageId);
    if (!image) {
      return res.status(404).json({
        success: false,
        message: 'Image not found'
      });
    }

    // Read image file
    const imageBuffer = await fs.readFile(
      `./uploads/${image.filename}`
    );

    const startTime = Date.now();
    const result = await segmentFlood(imageBuffer);
    const processingTime = Date.now() - startTime;

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: 'Segmentation failed',
        error: result.error
      });
    }

    // Save binary mask
    const maskPath = `./uploads/mask-${image._id}.png`;
    await fs.writeFile(maskPath, result.binaryMask);

    // Save masked image
    const maskedPath = `./uploads/masked-${image._id}.png`;
    await fs.writeFile(maskedPath, result.maskedImage);

    // Store segmentation result in database
    const segmentation = new SegmentationResult({
      imageId: image._id,
      floodPixels: result.floodPixels,
      totalPixels: result.totalPixels,
      floodPercentage: result.floodPercentage,
      processingTime
    });

    await segmentation.save();

    res.json({
      success: true,
      message: 'Segmentation completed',
      result: {
        segmentationId: segmentation._id,
        imageId: image._id,
        floodPixels: result.floodPixels,
        totalPixels: result.totalPixels,
        floodPercentage: result.floodPercentage.toFixed(2),
        processingTime: `${processingTime}ms`
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get segmentation result
exports.getSegmentation = async (req, res) => {
  try {
    const { segmentationId } = req.params;

    const segmentation = await SegmentationResult.findById(segmentationId)
      .populate('imageId');

    if (!segmentation) {
      return res.status(404).json({
        success: false,
        message: 'Segmentation result not found'
      });
    }

    res.json({
      success: true,
      data: segmentation
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get segmentation history
exports.getHistory = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const results = await SegmentationResult.find()
      .populate('imageId')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await SegmentationResult.countDocuments();

    res.json({
      success: true,
      data: results,
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

// Get segmentation data for an image
exports.getImageSegmentation = async (req, res) => {
  try {
    const image = await Image.findById(req.params.imageId);
    if (!image) {
      return res.status(404).json({
        success: false,
        message: 'Image not found'
      });
    }

    const segmentation = await SegmentationResult.findOne({ imageId: image._id });
    if (!segmentation) {
      return res.status(404).json({
        success: false,
        message: 'No segmentation data available'
      });
    }

    res.json({
      success: true,
      data: segmentation.toObject()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Segment with custom HSV parameters (for calibration preview)
exports.segmentPreview = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    const {
      hueMin = 0.02,
      hueMax = 0.20,
      satMin = 0.05,
      satMax = 1.0,
      valMin = 0.10,
      valMax = 0.95
    } = req.body;

    const imageBuffer = await fs.readFile(req.file.path);

    const startTime = Date.now();
    const result = await segmentFloodCustom(imageBuffer, {
      hueMin: parseFloat(hueMin),
      hueMax: parseFloat(hueMax),
      satMin: parseFloat(satMin),
      satMax: parseFloat(satMax),
      valMin: parseFloat(valMin),
      valMax: parseFloat(valMax)
    });
    const processingTime = Date.now() - startTime;

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: 'Segmentation failed',
        error: result.error
      });
    }

    // Convert to base64 for preview
    const maskBase64 = result.binaryMask.toString('base64');

    res.json({
      success: true,
      mask: maskBase64,
      waterPixels: result.floodPixels,
      totalPixels: result.totalPixels,
      coverage: result.floodPercentage,
      processingTime: `${processingTime}ms`
    });

    // Clean up uploaded file
    await fs.unlink(req.file.path).catch(() => {});
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
