const prisma = require('../../utils/prisma');
const AppError = require('../../errors/AppError');

const addRating = async (productId, ratingData) => {
  const { rating, comment } = ratingData;

  // Validate rating
  const ratingValue = Number(rating);
  if (isNaN(ratingValue) || ratingValue < 0 || ratingValue > 5) {
    throw new AppError('Rating must be a number between 0 and 5', 400);
  }

  // Start transaction
  const result = await prisma.$transaction(async (tx) => {
    // Create new rating entry
    const newRating = await tx.productRating.create({
      data: {
        productId,
        rating: ratingValue,
        comment,
      },
    });

    // Calculate new average rating
    const allRatings = await tx.productRating.findMany({
      where: {
        productId,
      },
      select: {
        rating: true,
      },
    });

    const totalRatings = allRatings.length;
    const averageRating = allRatings.reduce((sum, r) => sum + r.rating, 0) / totalRatings;

    // Update product with new average rating
    const updatedProduct = await tx.product.update({
      where: {
        id: productId,
      },
      data: {
        rating: averageRating,
        totalRatings,
      },
      select: {
        id: true,
        name: true,
        rating: true,
        totalRatings: true,
      },
    });

    return {
      rating: newRating,
      product: updatedProduct,
    };
  });

  return result;
};

const getProductRatings = async (productId) => {
  const ratings = await prisma.productRating.findMany({
    where: {
      productId,
    },
    orderBy: {
      createdAt: 'desc',
    },
    select: {
      id: true,
      rating: true,
      comment: true,
      createdAt: true,
    },
  });

  const product = await prisma.product.findUnique({
    where: {
      id: productId,
    },
    select: {
      id: true,
      name: true,
      rating: true,
      totalRatings: true,
    },
  });

  if (!product) {
    throw new AppError('Product not found', 404);
  }

  return {
    product,
    ratings,
  };
};

const RatingService = {
  addRating,
  getProductRatings,
};

module.exports = { RatingService };
