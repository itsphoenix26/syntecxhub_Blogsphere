const express = require("express");
const Post = require("../models/Post");
const protect = require("../middleware/authMiddleware");

const router = express.Router();

// GET ALL POSTS
router.get("/", async (req, res) => {
    try {
        const posts = await Post.find()
            .populate("author", "name email")
            .sort({ createdAt: -1 });

        res.json(posts);
    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch posts",
            error: error.message
        });
    }
});

// GET SINGLE POST
router.get("/:id", async (req, res) => {
    try {
        const post = await Post.findById(req.params.id)
            .populate("author", "name email");

        if (!post) {
            return res.status(404).json({
                message: "Post not found"
            });
        }

        res.json(post);
    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch post",
            error: error.message
        });
    }
});

// CREATE POST
router.post("/", protect, async (req, res) => {
    try {
        const { title, content, image } = req.body;

        if (!title || !content) {
            return res.status(400).json({
                message: "Title and content are required"
            });
        }

        const post = await Post.create({
            title,
            content,
            image: image || "",
            author: req.user.userId
        });

        const populatedPost = await Post.findById(post._id)
            .populate("author", "name email");

        res.status(201).json({
            message: "Post created successfully",
            post: populatedPost
        });
    } catch (error) {
        res.status(500).json({
            message: "Failed to create post",
            error: error.message
        });
    }
});

// UPDATE POST
router.put("/:id", protect, async (req, res) => {
    try {
        const { title, content, image } = req.body;

        const post = await Post.findById(req.params.id);

        if (!post) {
            return res.status(404).json({
                message: "Post not found"
            });
        }

        if (post.author.toString() !== req.user.userId) {
            return res.status(403).json({
                message: "You can only edit your own posts"
            });
        }

        post.title = title || post.title;
        post.content = content || post.content;

        if (image !== undefined) {
            post.image = image;
        }

        await post.save();

        const updatedPost = await Post.findById(post._id)
            .populate("author", "name email");

        res.json({
            message: "Post updated successfully",
            post: updatedPost
        });
    } catch (error) {
        res.status(500).json({
            message: "Failed to update post",
            error: error.message
        });
    }
});

// DELETE POST
router.delete("/:id", protect, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);

        if (!post) {
            return res.status(404).json({
                message: "Post not found"
            });
        }

        if (post.author.toString() !== req.user.userId) {
            return res.status(403).json({
                message: "You can only delete your own posts"
            });
        }

        await Post.findByIdAndDelete(req.params.id);

        res.json({
            message: "Post deleted successfully"
        });
    } catch (error) {
        res.status(500).json({
            message: "Failed to delete post",
            error: error.message
        });
    }
});

module.exports = router;