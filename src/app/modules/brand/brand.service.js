const prisma = require('../../utils/prisma');
const AppError = require('../../errors/AppError');
const calculatePagination = require('../../utils/calculatePagination');

const createBrand = async (data) => {
  const existingBrand = await prisma.brand.findUnique({
    where: {
      name: data.name,
    },
  });

  if (existingBrand) {
    throw new AppError('Brand with this name already exists', 400);
  }

  const result = await prisma.brand.create({
    data,
  });

  return result;
};

const getAllBrands = async (filters, options) => {
  const { page, limit, skip } = calculatePagination(options);
  const { searchTerm, ...filterData } = filters;

  const andConditions = [];

  if (searchTerm) {
    andConditions.push({
      OR: ['name'].map((field) => ({
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

  const result = await prisma.brand.findMany({
    where: whereConditions,
    skip,
    take: limit,
    orderBy: options.sortBy && options.sortOrder
      ? { [options.sortBy]: options.sortOrder }
      : { createdAt: 'desc' },
  });

  const total = await prisma.brand.count({
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

const getBrandById = async (id) => {
  const result = await prisma.brand.findUnique({
    where: {
      id,
    },
  });

  if (!result) {
    throw new AppError('Brand not found', 404);
  }

  return result;
};

const updateBrand = async (id, updateData) => {
  const exists = await prisma.brand.findUnique({
    where: {
      id,
    },
  });

  if (!exists) {
    throw new AppError('Brand not found', 404);
  }

  const result = await prisma.brand.update({
    where: {
      id,
    },
    data: updateData,
  });

  return result;
};

const deleteBrand = async (id) => {
  const exists = await prisma.brand.findUnique({
    where: {
      id,
    },
  });

  if (!exists) {
    throw new AppError('Brand not found', 404);
  }

  const result = await prisma.brand.delete({
    where: {
      id,
    },
  });

  return result;
};
const BrandService = {
  createBrand,
  getAllBrands,
  getBrandById,
  updateBrand,
  deleteBrand,
};

module.exports = { BrandService };
