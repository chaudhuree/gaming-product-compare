const searchFilter = (filters, searchableFields) => {
  const { searchTerm, ...filterData } = filters;
  const andConditions = [];

  if (searchTerm) {
    andConditions.push({
      OR: searchableFields.map((field) => ({
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
        [key]: filterData[key],
      })),
    });
  }

  return andConditions.length > 0 ? { AND: andConditions } : {};
};

module.exports = { searchFilter };
