import Post from '../models/Post.js';
import JoinRequest from '../models/JoinRequest.js';

// Create a new post
export const createPost = async (req, res) => {
    try {
        const post = await Post.create({
            ...req.body,
            user: req.user._id
        });
        res.status(201).json(post);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get all posts with filters (public - only open)
export const getPosts = async (req, res) => {
    try {
        const { type } = req.query;
        const filter = { status: 'open' };
        if (type) filter.type = type;

        const posts = await Post.find(filter)
            .populate('user', 'name avatar') // Get basic user info
            .sort({ createdAt: -1 });
        res.json(posts);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get current user's own posts (all statuses - dành cho lịch sử)
export const getMyPosts = async (req, res) => {
    try {
        const { type } = req.query;
        const filter = { user: req.user._id };
        if (type) filter.type = type;

        const posts = await Post.find(filter)
            .populate('user', 'name avatar')
            .sort({ createdAt: -1 });
        res.json(posts);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get single post details with join requests (if owner)
export const getPostById = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id).populate('user', 'name email phone avatar');
        if (!post) {
            return res.status(404).json({ message: 'Không tìm thấy bài đăng.' });
        }

        // If user is owner, fetch requests
        let requests = [];
        let myRequest = null;

        if (req.user) {
            if (post.user._id.toString() === req.user._id.toString()) {
                requests = await JoinRequest.find({ post: post._id }).populate('user', 'name avatar');
            } else {
                myRequest = await JoinRequest.findOne({ post: post._id, user: req.user._id });
            }
        }

        res.json({ post, requests, myRequest });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Update post
export const updatePost = async (req, res) => {
    try {
        const post = await Post.findOne({ _id: req.params.id, user: req.user._id });
        if (!post) {
            return res.status(404).json({ message: 'Không tìm thấy bài đăng hoặc bạn không có quyền thực hiện.' });
        }

        Object.assign(post, req.body);
        await post.save();

        res.json(post);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Delete post
export const deletePost = async (req, res) => {
    try {
        const post = await Post.findOneAndDelete({ _id: req.params.id, user: req.user._id });
        if (!post) {
            return res.status(404).json({ message: 'Post not found or unauthorized' });
        }
        // Delete associated requests
        await JoinRequest.deleteMany({ post: post._id });

        res.json({ message: 'Xóa bài đăng thành công.' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
