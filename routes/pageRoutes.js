const express = require('express');
const router = express.Router();

// Render pages
router.get('/', (req, res) => {
  res.render('index');
});

router.get('/upload', (req, res) => {
  res.render('upload');
});

router.get('/results', (req, res) => {
  res.render('results');
});

router.get('/compare', (req, res) => {
  res.render('compare');
});

router.get('/history', (req, res) => {
  res.render('history');
});

module.exports = router;
