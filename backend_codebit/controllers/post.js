const Post = require("../models/CommunityFeatures");
const { cloudinary } = require("../config/cloudinary");

exports.addPost = async (req, res) => {
    try {
        const { content, tags } = req.body;
       console.log(content);
       
        
        const userId = req.user.id;
        const userName = req.user.userName;
        const files = req.files?.media;

        let mediaArray = [];

        if (files) {
            const filesArray = Array.isArray(files) ? files : [files];

            for (let file of filesArray) {
                console.log(`Uploading ${file.name}...`);

                const uploadedMedia = await new Promise((resolve, reject) => {
                    const stream = cloudinary.uploader.upload_stream(
                        { resource_type: file.mimetype.startsWith("video") ? "video" : "image", folder: "posts" },
                        (error, result) => {
                            if (error) return reject(error);
                            resolve(result);
                        }
                    );
                    stream.end(file.data);
                });
 console.log("uploaded");
 
                mediaArray.push({
                    type: file.mimetype.startsWith("video") ? "video" : "image",
                    url: uploadedMedia.secure_url
                });
            }
        }

        if (!content && mediaArray.length === 0) {
            return res.status(400).json({ message: "Post must contain text or media" });
        }

        const newPost = new Post({
            user: userId,
            userName, // Added username
            content,
            media: mediaArray,
            tags,
        });

        await newPost.save();
        res.status(200).json(
          {success:true,  newPost});
    } catch (error) {
        console.error("Post creation failed:", error);
        res.status(500).json({ error: "Server error" });
    }
};

exports.addComment = async (req, res) => {
    try {
        const { content } = req.body;
        const userId = req.user.id;
        const userName = req.user.userName;  // Added username

        if (!content) {
            return res.status(400).json({ message: "Comment must contain text" });
        }

        const postId = req.params.postId;
        const post = await Post.findById(postId);
        if (!post) return res.status(404).json({ message: "Post not found" });

        const newComment = {
            user: userId,
            userName, // Added username
            content,
            likes: [],
        };

        post.comments.push(newComment);
        await post.save();
        res.status(200).json({ success:true,  message: "Comment added", comment: newComment });
    } catch (error) {
        console.error("Error adding comment:", error);
        res.status(500).json({ error: "Server error" });
    }
};

exports.deleteComment = async (req, res) => {
    try {
        const { postId, commentId } = req.params;
        const post = await Post.findById(postId);
        if (!post) return res.status(404).json({ message: "Post not found" });

        const commentIndex = post.comments.findIndex(c => c._id.toString() === commentId);
        if (commentIndex === -1) return res.status(404).json({ message: "Comment not found" });

        if (post.comments[commentIndex].user.toString() !== req.user.id) {
            return res.status(403).json({ message: "Not authorized to delete this comment" });
        }

        post.comments.splice(commentIndex, 1);
        await post.save();
        res.status(200).json({success:true, message: "Comment deleted" });
    } catch (error) {
        console.error("Delete comment error:", error);
        res.status(500).json({ error: "Server error" });
    }
};

exports.getComments = async (req, res) => {
    try {
        const postId = req.params.postId;
        const post = await Post.findById(postId);
        if (!post) return res.status(404).json({ message: "Post not found" });

        res.status(200).json({success:true, comments: post.comments });
    } catch (error) {
        console.error("Get comments error:", error);
        res.status(500).json({ error: "Server error" });
    }
};

exports.likeUnlikePost = async (req, res) => {
    try {
        const post = await Post.findById(req.params.postId);
        if (!post) return res.status(404).json({ message: "Post not found" });

        const userId = req.user.id;
        const userName = req.user.userName; // Added username
        const likeIndex = post.likes.findIndex(like => like.user.toString() === userId);

        if (likeIndex === -1) {
            post.likes.push({ user: userId, userName });
            await post.save();
            return res.status(200).json({success:true, message: "Post liked" });
        } else {
            post.likes.splice(likeIndex, 1);
            await post.save();
            return res.status(200).json({success:true, message: "Post unliked" });
        }
    } catch (error) {
        console.error("Like/Unlike post error:", error);
        res.status(500).json({ error: "Server error" });
    }
};
exports.deletePost = async (req, res) => {
    try {
        const post = await Post.findById(req.params.postId);
        if (!post) return res.status(404).json({ message: "Post not found" });

        if (post.user.toString() !== req.user.id) {
            return res.status(403).json({ message: "Not authorized to delete this post" });
        }
        
        
        if (post.media && post.media.length > 0) {
        
            const deletePromises = post.media.map(async (mediaUrl) => {
               
               mediaUrl=mediaUrl.url;
                const publicId = mediaUrl.split('/').pop().split('.')[0];
                return cloudinary.uploader.destroy(publicId);
            });

            await Promise.all(deletePromises); 
        }

        await post.deleteOne();
        res.status(200).json({success:true, message: "Post deleted successfully" });
    } catch (error) {
        console.error("Delete post error:", error);
        res.status(500).json({ error: "Server error" });
    }
};

exports.getFeedPosts = async (req, res) => {
    try {
        let { startIndex = 0 } = req.query;
        startIndex = parseInt(startIndex) || 0;
        const limit = 2;

        const posts = await Post.find()
            .sort({ likes: -1 })
            .skip(startIndex)
            .limit(limit);

        const totalPosts = await Post.countDocuments();
        const nextIndex = startIndex + posts.length;
        const hasMore = nextIndex < totalPosts;

        res.status(200).json({ success: true, posts, hasMore, nextIndex });
    } catch (error) {
        console.error("Error fetching feed:", error);
        res.status(500).json({ error: "Server error" });
    }
};
exports.getUserPosts = async (req, res) => {
    try {
        let { startIndex = 0 } = req.query;
        startIndex = parseInt(startIndex) || 0;
        limit =  15;

        const userName = req.params.userName;

        const posts = await Post.find({ userName:userName })
            .sort({ likes: -1 }) 
            .skip(startIndex)
            .limit(limit);
     
        const totalPosts = await Post.countDocuments({ userName: userName });
        const nextIndex = startIndex + posts.length;
        const hasMore = nextIndex < totalPosts;

        res.status(200).json({
            success: true,
            posts,
            hasMore,
            nextIndex,
            message: "User posts fetched successfully"
        });
    } catch (error) {
        console.error("Error fetching user posts:", error);
        res.status(500).json({ error: "Server error" });
    }
};

exports.getLatestPosts = async (req, res) => {
    try {
        const latestPosts = await Post.find()
            .sort({ createdAt: -1 }) 
            .limit(4); 

        if (latestPosts.length === 0) {
            return res.status(404).json({ success: false, message: "No posts found" });
        }

        const formattedPosts = latestPosts.map((post, index) => ({
            id: post._id,
            title: post.content.substring(0, 50) + (post.content.length > 50 ? "..." : ""), // Generate title from content
            excerpt: post.content.substring(0, 100) + (post.content.length > 100 ? "..." : ""), // Short description
            author: post.userName,
            authorAvatar: post.userName.charAt(0).toUpperCase(), // First letter as avatar
            date: new Date(post.createdAt).toLocaleDateString("en-US", {
                month: "short",
                day: "2-digit",
                year: "numeric",
            }),
            image: post.media.length > 0 ? post.media[0].type : "DefaultImage", // Use media type if available
            likes: post.likes.length,
            comments: post.comments.length,
        }));

        res.status(200).json({ success: true, posts: formattedPosts });
    } catch (error) {
        console.error("Error fetching latest posts:", error);
        res.status(500).json({ error: "Server error" });
    }
};


