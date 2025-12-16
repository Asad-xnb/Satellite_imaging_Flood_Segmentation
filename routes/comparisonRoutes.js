const express = require('express');
const router = express.Router();
const comparisonController = require('../controllers/comparisonController');

// Routes for image comparison
router.post('/compare', comparisonController.compareImages);
router.get('/comparisons', comparisonController.getComparisons);
router.get('/comparison/:comparisonId', comparisonController.getComparison);

module.exports = router;
