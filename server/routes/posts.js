import express from 'express';
import admin from 'firebase-admin';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();
const db = admin.firestore();

// GET /api/posts - Get posts filtered by date
router.get('/', async (req, res) => {
    try {
        const { startDate, limit: queryLimit } = req.query;

        let query = db.collection('posts');

        // Filter by date if provided
        if (startDate) {
            const date = new Date(startDate);
            query = query.where('createdAt', '>=', admin.firestore.Timestamp.fromDate(date));
        }

        // Order by creation date (newest first)
        query = query.orderBy('createdAt', 'desc');

        // Apply limit
        const limitNum = queryLimit ? parseInt(queryLimit) : 10;
        query = query.limit(limitNum);

        const snapshot = await query.get();
        const posts = [];

        snapshot.forEach(doc => {
            posts.push({
                id: doc.id,
                ...doc.data()
            });
        });

        res.json({ posts });
    } catch (error) {
        console.error('Error fetching posts:', error);
        res.status(500).json({ error: 'Failed to fetch posts' });
    }
});

// GET /api/posts/:id - Get single post
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const doc = await db.collection('posts').doc(id).get();

        if (!doc.exists) {
            return res.status(404).json({ error: 'Post not found' });
        }

        res.json({
            id: doc.id,
            ...doc.data()
        });
    } catch (error) {
        console.error('Error fetching post:', error);
        res.status(500).json({ error: 'Failed to fetch post' });
    }
});

// POST /api/posts/:id/like - Toggle like on post
router.post('/:id/like', authenticateToken, async (req, res) => {
    try {
        const { uid, name } = req.user;
        const { id } = req.params;

        const postRef = db.collection('posts').doc(id);

        await db.runTransaction(async (transaction) => {
            const postDoc = await transaction.get(postRef);

            if (!postDoc.exists) {
                throw new Error('Post not found');
            }

            const post = postDoc.data();
            const likes = post.likes || [];

            if (likes.includes(uid)) {
                // Unlike - remove user from likes array
                transaction.update(postRef, {
                    likes: admin.firestore.FieldValue.arrayRemove(uid),
                    updatedAt: admin.firestore.FieldValue.serverTimestamp()
                });
            } else {
                // Like - add user to likes array
                transaction.update(postRef, {
                    likes: admin.firestore.FieldValue.arrayUnion(uid),
                    updatedAt: admin.firestore.FieldValue.serverTimestamp()
                });
            }
        });

        res.json({ success: true, message: 'Like toggled successfully' });
    } catch (error) {
        console.error('Error toggling like:', error);
        res.status(400).json({ error: error.message || 'Failed to toggle like' });
    }
});

// POST /api/posts/:id/comment - Add comment to post
router.post('/:id/comment', authenticateToken, async (req, res) => {
    try {
        const { uid, name } = req.user;
        const { id } = req.params;
        const { content } = req.body;

        // Validation
        if (!content || typeof content !== 'string' || content.trim().length === 0) {
            return res.status(400).json({ error: 'Comment content is required' });
        }

        if (content.length > 500) {
            return res.status(400).json({ error: 'Comment is too long (max 500 characters)' });
        }

        const postRef = db.collection('posts').doc(id);

        await db.runTransaction(async (transaction) => {
            const postDoc = await transaction.get(postRef);

            if (!postDoc.exists) {
                throw new Error('Post not found');
            }

            // Create comment object
            const comment = {
                id: `cmt_${Date.now()}_${uid.substring(0, 8)}`,
                userId: uid,
                userName: name || 'Anonymous',
                content: content.trim(),
                createdAt: admin.firestore.Timestamp.now()
            };

            // Add comment to post
            transaction.update(postRef, {
                comments: admin.firestore.FieldValue.arrayUnion(comment),
                updatedAt: admin.firestore.FieldValue.serverTimestamp()
            });
        });

        res.json({ success: true, message: 'Comment added successfully' });
    } catch (error) {
        console.error('Error adding comment:', error);
        res.status(400).json({ error: error.message || 'Failed to add comment' });
    }
});

// POST /api/posts/:id/share - Share a post
router.post('/:id/share', authenticateToken, async (req, res) => {
    try {
        const { uid } = req.user;
        const { id } = req.params;

        const postRef = db.collection('posts').doc(id);

        await db.runTransaction(async (transaction) => {
            const postDoc = await transaction.get(postRef);

            if (!postDoc.exists) {
                throw new Error('Post not found');
            }

            const post = postDoc.data();
            const shares = post.shares || [];

            // Prevent multiple shares from same user if desired, or allow re-shares
            if (!shares.includes(uid)) {
                transaction.update(postRef, {
                    shares: admin.firestore.FieldValue.arrayUnion(uid),
                    updatedAt: admin.firestore.FieldValue.serverTimestamp()
                });
            }
        });

        res.json({ success: true, message: 'Post shared successfully' });
    } catch (error) {
        console.error('Error sharing post:', error);
        res.status(400).json({ error: error.message || 'Failed to share post' });
    }
});

// POST /api/posts/create - Create new post (authenticated)
router.post('/create', authenticateToken, async (req, res) => {
    try {
        const { uid, name, photoURL } = req.user;
        const { content, imageUrl } = req.body;

        // Validation
        if (!content || typeof content !== 'string' || content.trim().length === 0) {
            return res.status(400).json({ error: 'Post content is required' });
        }

        if (content.length > 1000) {
            return res.status(400).json({ error: 'Post is too long (max 1000 characters)' });
        }

        // Create post
        const postData = {
            userId: uid,
            userName: name || 'Anonymous',
            userAvatar: photoURL || null,
            content: content.trim(),
            imageUrl: imageUrl || null,
            likes: [],
            comments: [],
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
        };

        const postRef = await db.collection('posts').add(postData);

        res.status(201).json({
            postId: postRef.id,
            message: 'Post created successfully'
        });
    } catch (error) {
        console.error('Error creating post:', error);
        res.status(500).json({ error: 'Failed to create post' });
    }
});

export default router;
