const express = require('express');
const { BlogController } = require('./blog.controller');
const auth = require('../../middlewares/auth');
const { RoleEnum } = require('@prisma/client');

const router = express.Router();

// Protected routes (Admin and Content Creator only)
router.post(
  '/create-blog',
  auth(RoleEnum.ADMIN, RoleEnum.CONTENT_CREATOR),
  BlogController.createBlog
);

router.patch(
  '/:id',
  auth(RoleEnum.ADMIN, RoleEnum.CONTENT_CREATOR),
  BlogController.updateBlog
);

router.delete(
  '/:id',
  auth(RoleEnum.ADMIN, RoleEnum.CONTENT_CREATOR),
  BlogController.deleteBlog
);

// Public routes
router.get('/', BlogController.getAllBlogs);
router.get('/:id', BlogController.getBlogById);

module.exports = router;
