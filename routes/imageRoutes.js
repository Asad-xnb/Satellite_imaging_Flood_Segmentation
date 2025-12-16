const express = require('express');
const router = express.Router();
const imageController = require('../controllers/imageController');
const upload = require('../middleware/upload');

// Routes for image upload and segmentation
router.post('/upload', upload.single('image'), imageController.uploadImage);
router.post('/segment/:imageId', imageController.segmentImage);
router.get('/segmentation/:segmentationId', imageController.getSegmentation);
router.get('/history', imageController.getHistory);

module.exports = router;
