const prisma = require('../../utils/prisma');
const AppError = require('../../errors/AppError');
const calculatePagination = require('../../utils/calculatePagination');

const createBenchmark = async (data) => {
  const existingBenchmark = await prisma.benchmark.findUnique({
    where: {
      name: data.name,
    },
  });

  if (existingBenchmark) {
    throw new AppError('Benchmark with this name already exists', 400);
  }

  const result = await prisma.benchmark.create({
    data,
  });
  return result;
};

const getAllBenchmarks = async (filters = {}, options = {}) => {
  // Convert page and limit to numbers and set defaults
  const page = Number(options.page) || 1;
  const limit = Number(options.limit) || 10;
  const skip = (page - 1) * limit;

  // Create where condition for search
  const { searchTerm } = filters;
  const whereConditions = searchTerm ? {
    OR: [
      { name: { contains: searchTerm, mode: 'insensitive' } },
      { description: { contains: searchTerm, mode: 'insensitive' } },
    ],
  } : {};

  const benchmarks = await prisma.benchmark.findMany({
    where: whereConditions,
    skip,
    take: limit,
    orderBy: options.sortBy ? {
      [options.sortBy]: options.sortOrder || 'asc',
    } : {
      createdAt: 'desc',
    },
    include: {
      productBenchmarks: {
        include: {
          product: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      },
    },
  });

  const total = await prisma.benchmark.count({
    where: whereConditions,
  });

  const { totalPage, nextPage, previousPage } = calculatePagination(total, page, limit);

  return {
    meta: {
      page,
      limit,
      total,
      totalPage,
      nextPage,
      previousPage,
    },
    data: benchmarks,
  };
};

const getBenchmarkById = async (id) => {
  const result = await prisma.benchmark.findUnique({
    where: {
      id,
    },
    include: {
      productBenchmarks: {
        include: {
          product: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      },
    },
  });

  if (!result) {
    throw new AppError('Benchmark not found', 404);
  }

  return result;
};

const addProductBenchmark = async (data) => {
  const { productId, benchmarkId, score, maxScore = 100 } = data;

  // Check if product exists
  const product = await prisma.product.findUnique({
    where: { id: productId },
  });

  if (!product) {
    throw new AppError('Product not found', 404);
  }

  // Check if benchmark exists
  const benchmark = await prisma.benchmark.findUnique({
    where: { id: benchmarkId },
  });

  if (!benchmark) {
    throw new AppError('Benchmark not found', 404);
  }

  // Create or update product benchmark
  const result = await prisma.productBenchmark.upsert({
    where: {
      productId_benchmarkId: {
        productId,
        benchmarkId,
      },
    },
    update: {
      score: Number(score),
      maxScore: Number(maxScore),
    },
    create: {
      productId,
      benchmarkId,
      score: Number(score),
      maxScore: Number(maxScore),
    },
  });

  return {
    ...result,
    averagePercentScore: (result.score / result.maxScore) * 100,
  };
};

const compareProducts = async (productData) => {
  const { productOne, productTwo } = productData;

  // Fetch full product details
  const product1 = await prisma.product.findUnique({
    where: { id: productOne },
    include: {
      category: true,
      brand: true,
      productBenchmarks: {
        include: {
          benchmark: true,
        },
      },
    },
  });

  const product2 = await prisma.product.findUnique({
    where: { id: productTwo },
    include: {
      category: true,
      brand: true,
      productBenchmarks: {
        include: {
          benchmark: true,
        },
      },
    },
  });

  // Check if products exist
  if (!product1 || !product2) {
    throw new AppError('One or both products not found', 404);
  }

  // Check if products are in the same category
  if (product1.category.name !== product2.category.name) {
    throw new AppError(`Cannot compare products from different categories: ${product1.category.name} vs ${product2.category.name}`, 400);
  }

  // Transform product benchmarks
  const transformProduct = (product) => ({
    id: product.id,
    name: product.name,
    description: product.description,
    category: product.category.name,
    generalDetails: {
      brand: product.brand.name,
      series: product.series || null,
      generation: product.generation || null,
    },
    features: product.features || {},
    benchmarks: product.productBenchmarks.map(pb => ({
      benchmarkName: pb.benchmark.name,
      score: pb.score,
      averagePercentScore: (pb.score / pb.maxScore) * 100,
      maxScore: pb.maxScore,
    })),
  });

  return {
    product1: transformProduct(product1),
    product2: transformProduct(product2),
  };
};

const getProductBenchmarks = async (productId) => {
  const benchmarks = await prisma.productBenchmark.findMany({
    where: {
      productId,
    },
    include: {
      benchmark: true,
    },
  });

  return benchmarks.map(pb => ({
    ...pb,
    averagePercentScore: (pb.score / pb.maxScore) * 100,
  }));
};

const updateBenchmark = async (id, updateData) => {
  const exists = await prisma.benchmark.findUnique({
    where: {
      id,
    },
  });

  if (!exists) {
    throw new AppError('Benchmark not found', 404);
  }

  if (updateData.name) {
    const nameExists = await prisma.benchmark.findUnique({
      where: {
        name: updateData.name,
        NOT: {
          id,
        },
      },
    });

    if (nameExists) {
      throw new AppError('Benchmark with this name already exists', 400);
    }
  }

  const result = await prisma.benchmark.update({
    where: {
      id,
    },
    data: updateData,
    include: {
      productBenchmarks: {
        include: {
          product: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      },
    },
  });

  return result;
};

const deleteBenchmark = async (id) => {
  const exists = await prisma.benchmark.findUnique({
    where: {
      id,
    },
    include: {
      _count: {
        select: {
          productBenchmarks: true,
        },
      },
    },
  });

  if (!exists) {
    throw new AppError('Benchmark not found', 404);
  }

  if (exists._count.productBenchmarks > 0) {
    throw new AppError('Cannot delete benchmark with associated product scores', 400);
  }

  await prisma.benchmark.delete({
    where: {
      id,
    },
  });

  return null;
};

const updateProductBenchmark = async (productId, benchmarkId, updateData) => {
  // Check if product benchmark exists
  const exists = await prisma.productBenchmark.findUnique({
    where: {
      productId_benchmarkId: {
        productId,
        benchmarkId,
      },
    },
  });

  if (!exists) {
    throw new AppError('Product benchmark not found', 404);
  }

  const result = await prisma.productBenchmark.update({
    where: {
      productId_benchmarkId: {
        productId,
        benchmarkId,
      },
    },
    data: {
      score: Number(updateData.score),
      maxScore: updateData.maxScore ? Number(updateData.maxScore) : undefined,
    },
    include: {
      product: {
        select: {
          id: true,
          name: true,
        },
      },
      benchmark: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  return {
    ...result,
    averagePercentScore: (result.score / result.maxScore) * 100,
  };
};

const deleteProductBenchmark = async (productId, benchmarkId) => {
  // Check if product benchmark exists
  const exists = await prisma.productBenchmark.findUnique({
    where: {
      productId_benchmarkId: {
        productId,
        benchmarkId,
      },
    },
  });

  if (!exists) {
    throw new AppError('Product benchmark not found', 404);
  }

  await prisma.productBenchmark.delete({
    where: {
      productId_benchmarkId: {
        productId,
        benchmarkId,
      },
    },
  });

  return null;
};

const BenchmarkService = {
  createBenchmark,
  getAllBenchmarks,
  getBenchmarkById,
  addProductBenchmark,
  updateProductBenchmark,
  deleteProductBenchmark,
  compareProducts,
  getProductBenchmarks,
  updateBenchmark,
  deleteBenchmark,
};

module.exports = { BenchmarkService };
