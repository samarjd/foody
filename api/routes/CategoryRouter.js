const express = require('express');
const router = express.Router();
const CategoryModel = require('../models/Category');
const Post = require('../models/Post');

//get all categories for non-archived posts
router.get('/categories', async (req, res) => {
    try {
        const categories = await Post.distinct('categories', { isVisible: true });
        if (!categories || categories.length === 0) {
            return res.json([]);
        }

        const categoryDetails = await CategoryModel.find({ _id: { $in: categories } }, 'name').sort({ name: 1 });

        res.json(categoryDetails);
    } catch (error) {
        console.error('Error fetching categories:', error);
        res.status(500).json({ error: 'Internal Server Error', details: error.message });
    }
});

//get all categories used in any posts
router.get('/allCategories', async (req, res) => {
    try {
        const categories = await Post.distinct('categories');
        if (!categories || categories.length === 0) {
            return res.json([]);
        }

        const categoryDetails = await CategoryModel.find({ _id: { $in: categories } }, 'name').sort({ name: 1 });

        res.json(categoryDetails);
    } catch (error) {
        console.error('Error fetching categories:', error);
        res.status(500).json({ error: 'Internal Server Error', details: error.message });
    }
});

//get category by id
router.get('/categories/:id', async (req, res) => {
    const { id } = req.params;
    res.json(
        await CategoryModel.findById(id).sort({ createdAt: -1 })
    );
});

//get all categories for the admin management page
router.get('/manageCategories', async (req, res) => {
    try {
        const categoryData = await CategoryModel.aggregate([
            {
                $lookup: {
                    from: 'posts',
                    localField: '_id',
                    foreignField: 'categories',
                    as: 'posts',
                },
            },
            {
                $addFields: {
                    postCount: { $size: '$posts' },
                },
            },
            {
                $project: {
                    posts: 0,
                },
            },
        ]);

        res.json(categoryData);
    } catch (error) {
        console.error('Error fetching categories:', error);
        res.status(500).json({ error: 'Internal Server Error', details: error.message });
    }
});

//delete category by id
router.delete('/categories/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const categoryToDelete = await CategoryModel.findById(id);
        if (!categoryToDelete) {
            return res.status(404).json({ error: 'Category not found' });
        }

        await CategoryModel.deleteOne({ _id: id });
        await Post.updateMany(
            { categories: categoryToDelete._id },
            { $pull: { categories: categoryToDelete._id } }
        );

        res.json('Category deleted successfully');
    } catch (err) {
        console.error('Error deleting category:', err);
        res.status(500).json({ error: 'Internal Server Error', details: err.message });
    }
});

//update category by id
router.put("/categories/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const { name } = req.body;
        const updatedCategory = await CategoryModel.findByIdAndUpdate(
            id,
            { name },
            { new: true }
        );

        if (!updatedCategory) {
            return res.status(404).json({ message: "Category not found" });
        }
        res.json(updatedCategory);
    } catch (error) {
        console.error("Error updating category:", error);
        res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
});

module.exports = router;
