const Category = require("./../models/category");
exports.getCategoryById = (req, res, next, id) => {
  Category.findById(id).exec((err, category) => {
    if (err) {
      return res.status(400).json({
        error: "Category Not Found!",
      });
    }
    req.category = category;
    next();
  });

  //   next();
};
exports.createCategory = (req, res) => {
  const category = new Category(req.body);
  category.save((err, category) => {
    if (err) {
      return res.status(400).json({
        error: "Category is Not able to save!",
      });
    }
    return res.json({ category });
  });
};

exports.getCategory = (req, res) => {
  return res.json(req.category);
};

exports.getAllCategories = (req, res) => {
  Category.find().exec((err, categories) => {
    if (err) {
      return res.status(400).json({
        error: "No categories found",
      });
    }
    return res.json(categories);
  });
};

exports.updateCategory = (req, res) => {
  const category = req.category; // grabbing req.category from middleware
  category.name = req.body.name;
  category.save((err, updatedCategory) => {
    if (err) {
      return res.status(400).json({
        error: "Failed to update the category!",
      });
    }
    return res.json(updatedCategory);
  });
};

exports.deleteCategory = (req, res) => {
  const category = req.category;
  category.remove((err, deletedCategory) => {
    if (err) {
      return res.status(400).json({
        error: "Failed to delete the category!",
      });
    }
    return res.json({
      message: `Deleted Category is ${deletedCategory.name}`,
    });
  });
};
