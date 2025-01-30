const catchAsync = require('../../utils/catchAsync');
const sendResponse = require('../../utils/sendResponse');
const { RatingService } = require('./rating.service');

const addRating = catchAsync(async (req, res) => {
  const { productId } = req.params;
  const result = await RatingService.addRating(productId, req.body);

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'Rating added successfully',
    data: result,
  });
});

const getProductRatings = catchAsync(async (req, res) => {
  const { productId } = req.params;
  const result = await RatingService.getProductRatings(productId);

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'Product ratings retrieved successfully',
    data: result,
  });
});

const RatingController = {
  addRating,
  getProductRatings,
};

module.exports = { RatingController };
