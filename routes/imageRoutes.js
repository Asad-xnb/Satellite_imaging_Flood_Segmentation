const express = require('express');
const router = express.Router();
const imageController = require('../controllers/imageController');
const upload = require('../middleware/upload');
const fs = require('fs').promises;
const Image = require('../models/Image');

// Routes for image upload and segmentation
router.post('/upload', upload.single('image'), imageController.uploadImage);
router.post('/segment/:imageId', imageController.segmentImage);
router.get('/segmentation/:segmentationId', imageController.getSegmentation);
router.get('/history', imageController.getHistory);

// Serve segmented images
router.get('/mask/:imageId', async (req, res) => {
  try {
    const maskPath = `./uploads/mask-${req.params.imageId}.png`;
    const data = await fs.readFile(maskPath);
    res.type('image/png').send(data);
  } catch (error) {
    res.status(404).json({ success: false, message: 'Mask not found' });
  }
});

router.get('/masked/:imageId', async (req, res) => {
  try {
    const maskedPath = `./uploads/masked-${req.params.imageId}.png`;
    const data = await fs.readFile(maskedPath);
    res.type('image/png').send(data);
  } catch (error) {
    res.status(404).json({ success: false, message: 'Masked image not found' });
  }
});

// Serve original images
router.get('/original/:imageId', async (req, res) => {
  try {
    const image = await Image.findById(req.params.imageId);
    if (!image) {
      return res.status(404).json({ success: false, message: 'Image not found' });
    }
    const data = await fs.readFile(`./uploads/${image.filename}`);
    res.type(image.mimeType).send(data);
  } catch (error) {
    res.status(404).json({ success: false, message: 'Error loading image' });
  }
});

// Get all images with their segmentation data
router.get('/gallery/all', async (req, res) => {
  try {
    const images = await Image.find().sort({ uploadedAt: -1 });
    const SegmentationResult = require('../models/SegmentationResult');
    
    const gallery = await Promise.all(images.map(async (img) => {
      const segmentation = await SegmentationResult.findOne({ imageId: img._id });
      return {
        ...img.toObject(),
        segmentation: segmentation ? segmentation.toObject() : null
      };
    }));

    res.json({ success: true, data: gallery });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
