const express = require('express');
const { RatingController } = require('./rating.controller');

const router = express.Router();

// Public routes for ratings
router.post(
  '/products/:productId',
  RatingController.addRating
);

router.get(
  '/products/:productId',
  RatingController.getProductRatings
);

module.exports = router;
