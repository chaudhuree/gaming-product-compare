const prisma = require('../../utils/prisma');
const AppError = require('../../errors/AppError');
const calculatePagination = require('../../utils/calculatePagination');

const createBlog = async (data) => {
  const result = await prisma.blog.create({
    data,
    include: {
      author: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });

  return result;
};

const getAllBlogs = async (filters, options) => {
  const { page, limit, skip } = calculatePagination(options);
  const { searchTerm, ...filterData } = filters;

  const andConditions = [];

  if (searchTerm) {
    andConditions.push({
      OR: ['title', 'description'].map((field) => ({
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

  const result = await prisma.blog.findMany({
    where: whereConditions,
    skip,
    take: limit,
    orderBy: options.sortBy && options.sortOrder
      ? { [options.sortBy]: options.sortOrder }
      : { createdAt: 'desc' },
    include: {
      author: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });

  const total = await prisma.blog.count({
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

const getBlogById = async (id) => {
  const result = await prisma.blog.findUnique({
    where: {
      id,
    },
    include: {
      author: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });

  if (!result) {
    throw new AppError('Blog not found', 404);
  }

  return result;
};

const updateBlog = async (id, updateData) => {
  const exists = await prisma.blog.findUnique({
    where: {
      id,
    },
  });

  if (!exists) {
    throw new AppError('Blog not found', 404);
  }

  const result = await prisma.blog.update({
    where: {
      id,
    },
    data: updateData,
    include: {
      author: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });

  return result;
};

const deleteBlog = async (id) => {
  const exists = await prisma.blog.findUnique({
    where: {
      id,
    },
  });

  if (!exists) {
    throw new AppError('Blog not found', 404);
  }

  await prisma.blog.delete({
    where: {
      id,
    },
  });

  return null;
};

const BlogService = {
  createBlog,
  getAllBlogs,
  getBlogById,
  updateBlog,
  deleteBlog,
};

module.exports = { BlogService };
