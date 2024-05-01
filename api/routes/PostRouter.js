const express = require('express');
const router = express.Router();

const Post = require('../models/Post');
const CategoryModel = require('../models/Category');
const CommentModel = require('../models/Comment');

const multer = require('multer');
const uploadMiddleware = multer({ dest: 'uploads/' });
const fs = require('fs');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
dotenv.config();

const secret = process.env.SECRET;

//create a new post
router.post('/post', uploadMiddleware.single('file'), async (req, res) => {
    let newPath = null;

    if (req.file) {
        const { originalname, path } = req.file;
        const parts = originalname.split('.');
        const ext = parts[parts.length - 1];
        newPath = path + '.' + ext;
        fs.renameSync(path, newPath);
    }

    const { token } = req.cookies;
    jwt.verify(token, secret, {}, async (err, info) => {
        if (err) throw err;

        const { title, summary, content, isVisible, categories } = req.body;

        const postInfo = {
            title,
            summary,
            content,
            author: info.id,
            isVisible,
        };

        if (newPath) {
            postInfo.cover = newPath;
        }

        try {
            const postDoc = await Post.create(postInfo);
            const categoriesTab = JSON.parse(categories);

            const categoryIds = await Promise.all(
                categoriesTab.map(async (categoryName) => {
                    try {
                        const existingCategory = await CategoryModel.findOne({ name: categoryName });

                        if (existingCategory) {
                            return existingCategory._id;
                        } else {
                            const categoryDoc = await CategoryModel.create({ name: categoryName });
                            return categoryDoc._id;
                        }
                    } catch (categoryError) {
                        console.error('Error creating category:', categoryError);
                        throw categoryError;
                    }
                })
            );

            postDoc.categories = categoryIds;
            await postDoc.save();

            res.json(postDoc);
        } catch (error) {
            console.error('Error creating post:', error);
            res.status(500).json({ error: error.message });
        }
    });
});

//update a post
router.put('/post', uploadMiddleware.single('file'), async (req, res) => {
    let newPath = null;

    if (req.file) {
        const { originalname, path } = req.file;
        const parts = originalname.split('.');
        const ext = parts[parts.length - 1];
        newPath = path + '.' + ext;
        fs.renameSync(path, newPath);
    }

    try {
        const { token } = req.cookies;
        const { id, title, summary, content, isVisible, categories } = req.body;

        const info = jwt.verify(token, secret, {});
        const postDoc = await Post.findById(id);

        if (!postDoc) {
            return res.status(404).json('Post not found');
        }

        postDoc.title = title;
        postDoc.summary = summary;
        postDoc.content = content;
        postDoc.isVisible = isVisible;
        postDoc.cover = newPath || postDoc.cover;

        const categoriesTab = JSON.parse(categories);

        const categoryIds = await Promise.all(
            categoriesTab.map(async (categoryName) => {
                try {
                    const existingCategory = await CategoryModel.findOne({ name: categoryName });

                    if (existingCategory) {
                        return existingCategory._id;
                    } else {
                        const categoryDoc = await CategoryModel.create({ name: categoryName });
                        return categoryDoc._id;
                    }
                } catch (categoryError) {
                    console.error('Error creating category:', categoryError);
                    throw categoryError;
                }
            })
        );

        postDoc.categories = categoryIds;
        await postDoc.save();
        res.json(postDoc);
    } catch (err) {
        console.error('Error updating post:', err);
        res.status(500).json({ error: 'Internal Server Error', details: err.message });
    }
});

//delete a post
router.delete('/post/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const postDoc = await Post.findById(id);
        if (!postDoc) {
            return res.status(404).json('Post not found');
        }

        const { token } = req.cookies;
        const info = jwt.verify(token, secret, {});

        await Post.deleteOne({ _id: id });
        res.json('Post deleted successfully');
    } catch (err) {
        console.error('Error deleting post:', err);
        res.status(500).json({ error: 'Internal Server Error', details: err.message });
    }
});

//get all non-archived posts
router.get('/post', async (req, res) => {
    res.json(
        await Post.find({ isVisible: true })
            .populate('author', ['username', 'cover', 'userRole'])
            .sort({ createdAt: -1 })
            .limit(20)
    );
});

//get all archived posts
router.get('/archive', async (req, res) => {
    try {
        const { token } = req.cookies;
        const info = jwt.verify(token, secret, {});
        const theAuthor = info.id;
        const userRole = info.userRole;

        let query = {
            $or: [
                { isVisible: false },
                { isVisible: { $exists: false } }
            ]
        };

        if (userRole === 'Admin') {
            query.author = { $ne: null };
        } else {
            query.author = theAuthor;
        }

        const archivedPosts = await Post.find(query)
            .populate('author', ['username', 'cover', 'userRole'])
            .sort({ createdAt: -1 });

        res.json(archivedPosts);
    } catch (error) {
        console.error('Error fetching archived posts:', error);
        res.status(500).json({ error: 'Internal Server Error', details: error.message });
    }
});

//get a post by id
router.get('/post/:id', async (req, res) => {
    const { id } = req.params;
    const { token } = req.cookies;
    try {
        let user;
        if (token) {
            user = jwt.verify(token, secret);
        }
        const postDoc = await Post.findById(id).populate('author', ['username', 'cover', 'userRole']);
        if (!postDoc) {
            return res.status(404).json('Post not found');
        }

        if (!postDoc.author) {
            return res.status(500).json({ error: 'Internal Server Error', details: 'Post author not found' });
        }

        if (!postDoc.viewedUsers) {
            postDoc.viewedUsers = [];
        }
        if (!postDoc.viewedIPs) {
            postDoc.viewedIPs = [];
        }

        if (user && !postDoc.viewedUsers.includes(user.id)) {
            postDoc.views += 1;
            postDoc.viewedUsers.push(user.id);
        } else if (!user && !postDoc.viewedIPs.includes(req.ip)) {
            postDoc.views += 1;
            postDoc.viewedIPs.push(req.ip);
        }
        await postDoc.save();
        const comments = await CommentModel.find({ postId: id }).populate('userId', ['username', 'cover', 'userRole']).sort({ createdAt: -1 });
        res.json({ postDoc, views: postDoc.views, comments });
    } catch (err) {
        console.error('Error fetching post:', err);
        res.status(500).json({ error: 'Internal Server Error', details: err.message });
    }
});


//search for posts by category
router.get('/postcategory/:id', async (req, res) => {
    const categoryId = req.params.id;
    try {
        const posts = await Post.find({ isVisible: true, categories: categoryId })
            .populate('author', ['username', 'cover', 'userRole'])
            .sort({ createdAt: -1 });

        res.json(posts);
    } catch (error) {
        console.error('Error fetching posts by category:', error);
        res.status(500).json({ error: 'Internal Server Error', details: error.message });
    }
});

//search for posts by title or category
router.get('/search/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const posts = await Post.find({
            isVisible: true,
            $or: [
                { title: { $regex: new RegExp(id, 'i') } },
                { categories: { $in: await getMatchingCategoryIds(id) } },
            ],
        })
            .populate('author', ['username', 'cover', 'userRole'])
            .sort({ createdAt: -1 })
            .limit(20);

        res.json(posts);
    } catch (error) {
        console.error('Error fetching posts:', error);
        res.status(500).json({ error: 'Internal Server Error', details: error.message });
    }
});

//check for matching categories by regrex
async function getMatchingCategoryIds(name) {
    try {
        const categories = await CategoryModel.find({ name: { $regex: new RegExp(name, 'i') } });
        return categories.map(category => category._id);
    } catch (error) {
        console.error('Error fetching matching category IDs:', error);
        return [];
    }
}

module.exports = router;
