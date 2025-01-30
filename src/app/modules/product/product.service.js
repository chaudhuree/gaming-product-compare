const prisma = require('../../utils/prisma');
const AppError = require('../../errors/AppError');
const calculatePagination = require('../../utils/calculatePagination');

const createProduct = async (productData) => {
  // Check if category exists
  const category = await prisma.category.findUnique({
    where: {
      id: productData.categoryId,
    },
  });

  if (!category) {
    throw new AppError('Category not found', 404);
  }

  // Check if brand exists
  const brand = await prisma.brand.findUnique({
    where: {
      id: productData.brandId,
    },
  });

  if (!brand) {
    throw new AppError('Brand not found', 404);
  }

  const result = await prisma.product.create({
    data: productData,
    include: {
      category: true,
      brand: true,
    },
  });

  return result;
};

const getAllProducts = async (filters, options) => {
  const { page, limit, skip } = calculatePagination(options);
  const { searchTerm, categoryId, brandId, minPrice, maxPrice, ...filterData } = filters;

  const andConditions = [];

  if (searchTerm) {
    andConditions.push({
      OR: ['name', 'description'].map((field) => ({
        [field]: {
          contains: searchTerm,
          mode: 'insensitive',
        },
      })),
    });
  }

  if (categoryId) {
    andConditions.push({
      categoryId: categoryId,
    });
  }

  if (brandId) {
    andConditions.push({
      brandId: brandId,
    });
  }

  if (minPrice !== undefined || maxPrice !== undefined) {
    const priceCondition = {};
    if (minPrice !== undefined) {
      priceCondition.gte = parseFloat(minPrice);
    }
    if (maxPrice !== undefined) {
      priceCondition.lte = parseFloat(maxPrice);
    }
    andConditions.push({
      price: priceCondition,
    });
  }

  if (Object.keys(filterData).length > 0) {
    andConditions.push({
      AND: Object.keys(filterData).map((key) => ({
        [key]: {
          equals: filterData[key],
        },
      })),
    });
  }

  const whereConditions = andConditions.length > 0 ? { AND: andConditions } : {};

  const result = await prisma.product.findMany({
    where: whereConditions,
    skip,
    take: limit,
    orderBy: options.sortBy && options.sortOrder
      ? { [options.sortBy]: options.sortOrder }
      : { createdAt: 'desc' },
    include: {
      category: true,
      brand: true,
    },
  });

  const total = await prisma.product.count({
    where: whereConditions,
  });

  return {
    meta: {
      page,
      limit,
      total,
      totalPage: Math.ceil(total / limit),
    },
    data: result,
  };
};

const getProductById = async (id) => {
  const result = await prisma.product.findUnique({
    where: {
      id,
    },
    include: {
      category: true,
      brand: true,
    },
  });

  if (!result) {
    throw new AppError('Product not found', 404);
  }

  return result;
};

const updateProduct = async (id, updateData) => {
  const exists = await prisma.product.findUnique({
    where: {
      id,
    },
  });

  if (!exists) {
    throw new AppError('Product not found', 404);
  }

  if (updateData.categoryId) {
    const category = await prisma.category.findUnique({
      where: {
        id: updateData.categoryId,
      },
    });

    if (!category) {
      throw new AppError('Category not found', 404);
    }
  }

  if (updateData.brandId) {
    const brand = await prisma.brand.findUnique({
      where: {
        id: updateData.brandId,
      },
    });

    if (!brand) {
      throw new AppError('Brand not found', 404);
    }
  }

  const result = await prisma.product.update({
    where: {
      id,
    },
    data: updateData,
    include: {
      category: true,
      brand: true,
    },
  });

  return result;
};

const deleteProduct = async (id) => {
  const exists = await prisma.product.findUnique({
    where: {
      id,
    },
  });

  if (!exists) {
    throw new AppError('Product not found', 404);
  }

  await prisma.product.delete({
    where: {
      id,
    },
  });

  return null;
};

const ProductService = {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
};

module.exports = { ProductService };
