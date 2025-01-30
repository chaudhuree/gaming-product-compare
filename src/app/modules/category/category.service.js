const prisma = require('../../utils/prisma');
const AppError = require('../../errors/AppError');
const calculatePagination = require('../../utils/calculatePagination');

const createCategory = async (categoryData) => {
  const existingCategory = await prisma.category.findUnique({
    where: {
      name: categoryData.name,
    },
  });

  if (existingCategory) {
    throw new AppError('Category with this name already exists', 400);
  }

  const result = await prisma.category.create({
    data: categoryData,
  });

  return result;
};

const getAllCategories = async (filters, options) => {
  const { page, limit, skip } = calculatePagination(options);
  const { searchTerm, ...filterData } = filters;

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

  const result = await prisma.category.findMany({
    where: whereConditions,
    skip,
    take: limit,
    orderBy: options.sortBy && options.sortOrder
      ? { [options.sortBy]: options.sortOrder }
      : { createdAt: 'desc' },
    include: {
      _count: {
        select: {
          products: true,
        },
      },
    },
  });

  const total = await prisma.category.count({
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

const getCategoryById = async (id) => {
  const result = await prisma.category.findUnique({
    where: {
      id,
    },
    include: {
      products: true,
    },
  });

  if (!result) {
    throw new AppError('Category not found', 404);
  }

  return result;
};

const updateCategory = async (id, updateData) => {
  const exists = await prisma.category.findUnique({
    where: {
      id,
    },
  });

  if (!exists) {
    throw new AppError('Category not found', 404);
  }

  if (updateData.name) {
    const nameExists = await prisma.category.findUnique({
      where: {
        name: updateData.name,
        NOT: {
          id,
        },
      },
    });

    if (nameExists) {
      throw new AppError('Category with this name already exists', 400);
    }
  }

  const result = await prisma.category.update({
    where: {
      id,
    },
    data: updateData,
  });

  return result;
};

const deleteCategory = async (id) => {
  const exists = await prisma.category.findUnique({
    where: {
      id,
    },
    include: {
      _count: {
        select: {
          products: true,
        },
      },
    },
  });

  if (!exists) {
    throw new AppError('Category not found', 404);
  }

  if (exists._count.products > 0) {
    throw new AppError('Cannot delete category with associated products', 400);
  }

  await prisma.category.delete({
    where: {
      id,
    },
  });

  return null;
};

const CategoryService = {
  createCategory,
  getAllCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
};

module.exports = { CategoryService };
