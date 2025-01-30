const express = require('express');
const { CategoryController } = require('./category.controller');
const auth = require('../../middlewares/auth');
const { RoleEnum } = require('@prisma/client');

const router = express.Router();

router.post(
  '/create-category',
  auth(RoleEnum.ADMIN),
  CategoryController.createCategory
);

router.get('/', CategoryController.getAllCategories);
router.get('/:id', CategoryController.getCategoryById);

router.patch(
  '/:id',
  auth(RoleEnum.ADMIN),
  CategoryController.updateCategory
);

router.delete(
  '/:id',
  auth(RoleEnum.ADMIN),
  CategoryController.deleteCategory
);

module.exports = router;
