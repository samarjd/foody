const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');

const CommentModel = require('../models/Comment');

dotenv.config();
const secret = process.env.SECRET;

//create a new comment
router.post('/comment', async (req, res) => {
    let userId = null;
    const { token } = req.cookies;
    const { content, postId } = req.body;
    if (token) {
        try {
            const info = jwt.verify(token, secret, {});
            userId = info.id;
        } catch (error) {
            console.warn('Invalid or expired JWT token:', error.message);
        }
    }

    try {
        if (!postId) {
            return res.status(400).json({ error: 'postId is required' });
        }
        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const newComment = new CommentModel({
            content,
            postId,
            userId,
        });
        await newComment.save();
        const foundComments = await CommentModel.find({ postId: postId }).populate('userId', ['username', 'cover', 'userRole']);
        res.status(201).json(foundComments);
    } catch (error) {
        console.error('Error creating comment:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

//update a comment {like, dislike, flag}
router.put('/comment', async (req, res) => {
    try {
        const { action, commentId } = req.body;
        const { token } = req.cookies;
        let userId = null;

        if (token) {
            try {
                const info = jwt.verify(token, secret, {});
                userId = info.id;
            } catch (error) {
                console.warn('Invalid or expired JWT token:', error.message);
                return res.status(401).json({ error: 'Unauthorized' });
            }
        }

        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const comment = await CommentModel.findById(commentId);
        if (!comment) {
            return res.status(404).json({ error: 'Comment not found' });
        }

        const alreadyLiked = comment.likedBy.includes(userId);
        const alreadyDisliked = comment.dislikedBy.includes(userId);
        const alreadyFlagged = comment.flaggedBy.includes(userId);

        switch (action) {
            case 'like':
                if (!alreadyLiked) {
                    comment.likedBy.push(userId);
                    comment.likes += 1;
                    if (alreadyDisliked) {
                        comment.dislikedBy.pull(userId);
                        comment.dislikes -= 1;
                    }
                } else {
                    comment.likedBy.pull(userId);
                    comment.likes -= 1;
                }
                break;
            case 'dislike':
                if (!alreadyDisliked) {
                    comment.dislikedBy.push(userId);
                    comment.dislikes += 1;
                    // Remove like if already liked
                    if (alreadyLiked) {
                        comment.likedBy.pull(userId);
                        comment.likes -= 1;
                    }
                } else {
                    comment.dislikedBy.pull(userId);
                    comment.dislikes -= 1;
                }
                break;
            case 'flag':
                if (!alreadyFlagged) {
                    comment.flaggedBy.push(userId);
                    comment.flags += 1;
                } else {
                    comment.flaggedBy.pull(userId);
                    comment.flags -= 1;
                }
                if (comment.flags === 0) {
                    comment.flagged = false;
                } else {
                    comment.flagged = true;
                }
                break;
            default:
                return res.status(400).json({ error: 'Invalid action' });
        }

        await comment.save();
        const populatedComment = await CommentModel.findOne({ _id: commentId }).populate('userId', ['username', 'cover', 'userRole'])
        res.status(200).json({ message: 'Action updated successfully', 'comment': populatedComment });
    } catch (error) {
        console.error('Error updating action for comment:', error);
        res.status(500).json({ error: 'Internal Server Error', details: error.message });
    }
});

//get all comments for a post
router.get('/comment/:id', async (req, res) => {
    const { id } = req.params;
    try {
        if (!id) {
            return res.status(400).json({ error: 'postId is required' });
        }
        const comments = await CommentModel.find({ postId: id })
            .populate('userId', ['username', 'cover', 'userRole'])
            .sort({ createdAt: -1 });
        if (!comments) {
            return res.status(404).json({ error: 'Comments not found' });
        }
        res.status(200).json({ message: 'Comments fetched successfully', comments });
    } catch (error) {
        console.error('Error fetching comments:', error);
        res.status(500).json({ error: 'Internal Server Error', details: error.message });
    }
});

//delete a comment by id
router.delete('/comment/:id', async (req, res) => {
    const { id } = req.params;
    try {
        if (!id) {
            return res.status(400).json({ error: 'commentId is required' });
        }
        const comment = await CommentModel.findById(id);
        if (!comment) {
            return res.status(404).json({ error: 'Comment not found' });
        } else {
            await CommentModel.deleteOne({ _id: id });
            res.status(200).json({ message: 'Comment deleted successfully' });
        }
    } catch (error) {
        console.error('Error fetching comments:', error);
        res.status(500).json({ error: 'Internal Server Error', details: error.message });
    }
});

//get all flagged comments for the admin management page
router.get('/comment', async (req, res) => {
    try {
        const flaggedComments = await CommentModel.find({ flagged: true })
            .populate('userId', ['username', 'cover', 'userRole'])
            .populate('postId', 'title')
            .populate('flaggedBy', ['username', 'cover']);
        res.json(flaggedComments);
    } catch (error) {
        console.error('Error fetching flagged comments:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

//unflagged comment by id
router.put('/commentsManage/:commentId', async (req, res) => {
    const { commentId } = req.params;
    try {
        if (!commentId) {
            return res.status(400).json({ error: 'commentId is required' });
        }
        const comment = await CommentModel.findById(commentId);

        if (!comment) {
            return res.status(404).json({ error: 'Comment not found' });
        } else {
            comment.flagged = false;
            comment.flags = 0;
            comment.flaggedBy = [];

            await comment.save();
            res.status(200).json({ message: 'Comment unfalgged successfully' });
        }
    } catch (error) {
        console.error('Error fetching comments:', error);
        res.status(500).json({ error: 'Internal Server Error', details: error.message });
    }
});

module.exports = router;
