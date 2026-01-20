const express = require('express');
const router = express.Router();
const Post = require('../models/Post.model');
const User = require('../models/User.model');

// GET /api/posts - Get all posts (paginated)
router.get('/', async (req, res) => {
    try {
        const { type, page = 1, limit = 20 } = req.query;
        const query = {};
        if (type && type !== 'all') {
            query.type = type;
        }

        const posts = await Post.find(query)
            .sort({ isPinned: -1, createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);

        res.json(posts);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
});

// GET /api/posts/:id - Get single post
router.get('/:id', async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }
        res.json(post);
    } catch (error) {
        console.error(error);
        if (error.kind === 'ObjectId') {
            return res.status(404).json({ message: 'Post not found' });
        }
        res.status(500).json({ message: 'Server Error' });
    }
});

// POST /api/posts - Create a new post
router.post('/', async (req, res) => {
    try {
        const { content, image, type, tags } = req.body;
        const userId = req.user.id;

        const user = await User.findOne({ id: userId });
        if (!user) return res.status(404).json({ message: 'User not found' });

        const newPost = new Post({
            author: userId,
            authorName: user.profile?.displayName || user.username,
            authorUsername: user.username,
            authorAvatar: user.profile?.avatarUrl,
            content,
            image,
            type: type || 'global',
            tags: tags || [],
            isOfficial: user.role === 'host' || user.role === 'admin'
        });

        await newPost.save();
        res.status(201).json(newPost);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to create post' });
    }
});

// POST /api/posts/:id/like - Toggle like
router.post('/:id/like', async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) return res.status(404).json({ message: 'Post not found' });

        const userId = req.user.id;
        const index = post.likes.indexOf(userId);

        if (index === -1) {
            post.likes.push(userId);
        } else {
            post.likes.splice(index, 1);
        }

        await post.save();
        res.json(post.likes);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});

// POST /api/posts/:id/comment - Add comment
router.post('/:id/comment', async (req, res) => {
    try {
        const { text } = req.body;
        if (!text) return res.status(400).json({ message: 'Text required' });

        const post = await Post.findById(req.params.id);
        if (!post) return res.status(404).json({ message: 'Post not found' });

        const user = await User.findOne({ id: req.user.id });
        const comment = {
            user: user.id,
            username: user.username,
            avatar: user.profile?.avatarUrl,
            text,
            createdAt: new Date()
        };

        post.comments.push(comment);
        await post.save();

        res.json(post.comments);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});

// DELETE /api/posts/:id - Delete post (Owner only)
router.delete('/:id', async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) return res.status(404).json({ message: 'Not found' });

        if (post.author !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Unauthorized' });
        }

        await Post.findByIdAndDelete(req.params.id);
        res.json({ message: 'Deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Error' });
    }
});

module.exports = router;
