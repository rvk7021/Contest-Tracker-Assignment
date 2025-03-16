import React, { useState, useEffect } from 'react';
import { FaHeart, FaRegHeart, FaComment, FaPlus, FaEllipsisV } from 'react-icons/fa';
import { AiOutlineClose } from 'react-icons/ai';
import { useSelector } from 'react-redux';

const Post = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newPostContent, setNewPostContent] = useState('');
  const [showNewPost, setShowNewPost] = useState(false);
  const [file, setFile] = useState(null);
  const [commentInputs, setCommentInputs] = useState({});
  const [activeCommentPost, setActiveCommentPost] = useState(null);
  const [showLikes, setShowLikes] = useState(null);
  const [hasMore, setHasMore] = useState(false);
  const [nextIndex, setNextIndex] = useState(0);
  const [showMenu, setShowMenu] = useState(null);
  const { user } = useSelector(state => state.profile);

  // Fetch posts on component mount
  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      setLoading(true);

      let response = await fetch(`${process.env.REACT_APP_BASE_URL}/getposts?startIndex=${nextIndex}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      response = await response.json();

      if (response.success) {
        setPosts(prev => [...prev, ...response.posts]);
        setHasMore(response.hasMore);
        setNextIndex(response.nextIndex);
        setLoading(false);
      }
      else {
        setLoading(false);
      }
    } catch (error) {
      setLoading(false);
    }
  };

  const handleLike = async (postId) => {
    try {
      let response = await fetch(`${process.env.REACT_APP_BASE_URL}/post/like/${postId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include"
      });
      response = await response.json();

      if (response.success) {
        setPosts(posts.map(post =>
          post._id === postId
            ? {
              ...post,
              likes: post.likes.find(like => like.user === user._id)
                ? post.likes.filter(like => like.user !== user._id)
                : [...post.likes, { user: user._id, userName: user.userName }]
            }
            : post
        ));
      }
    } catch (error) {
      console.error('Error liking post:', error);
    }
  };

  const handleShowLikes = (postId) => {
    if (showLikes === postId) {
      setShowLikes(null);
    } else {
      setShowLikes(postId);
    }
  };

  const handleComment = async (postId) => {
    if (!commentInputs[postId] || commentInputs[postId].trim() === '') return;

    try {
      let response = await fetch(`${process.env.REACT_APP_BASE_URL}/post/comment/${postId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",

        },
        body: JSON.stringify({ content: commentInputs[postId] }),
        credentials: 'include'
      });
      response = await response.json();

      if (response.success) {
        // Update posts with new comment
        setPosts(posts.map(post =>
          post._id === postId
            ? {
              ...post,
              comments: [...post.comments, response.comment]
            }
            : post
        ));

        // Clear just this post's comment
        setCommentInputs(prev => ({
          ...prev,
          [postId]: ''
        }));
      }
    } catch (error) {
      console.error('Error commenting on post:', error);
    }
  };

  const handleCommentInputChange = (postId, value) => {
    setCommentInputs(prev => ({
      ...prev,
      [postId]: value
    }));
  };

  const discardComment = (postId) => {
    setCommentInputs(prev => ({
      ...prev,
      [postId]: ''
    }));
  };

  const handleDeletePost = async (postId) => {
    try {
      let response = await fetch(`${process.env.REACT_APP_BASE_URL}/post/${postId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",

        },
        credentials: 'include'
      });

      response = await response.json();

      if (response.success) {
        setPosts(posts.filter(post => post._id !== postId));
      }
      setShowMenu(null);
    } catch (error) {
      console.error('Error deleting post:', error);
    }
  };

  const handleSubmitPost = async (e) => {
    e.preventDefault();

    if (!newPostContent && !file) return;

    try {
      const formData = new FormData();
      formData.append('content', newPostContent);

      if (file) {
        formData.append('media', file);
      }

      const response = await fetch(`${process.env.REACT_APP_BASE_URL}/post`, {
        method: "POST",
        body: formData,
        credentials: 'include'
      });
      const result = await response.json();

      if (result.success) {
        setPosts([result.newPost, ...posts]);
        setNewPostContent('');
        setShowNewPost(false);
        setFile(null);
      }
    } catch (error) {
      console.error('Error creating post:', error);
    }
  };

  const isUserPost = (post) => {
    return post.user === user._id;
  };

  const togglePostMenu = (postId) => {
    setShowMenu(showMenu === postId ? null : postId);
  };

  // Click outside to close menus
  useEffect(() => {
    const handleClickOutside = () => {
      setShowMenu(null);
    };

    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);

  return (
    <div className="bg-gradient-to-br  from-slate-950 via-indigo-950 to-slate-950 min-h-screen p-4 mt-[60px] sm:mt-[70px]">
      {/* New Post Button */}
      <div className="fixed bottom-6 right-6 z-10">
        <button
          onClick={() => setShowNewPost(!showNewPost)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-full p-3 shadow-lg"
        >
          <FaPlus size={24} />
        </button>
      </div>

      {/* New Post Modal */}
      {showNewPost && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-20">
          <div className="bg-slate-800 rounded-lg w-full max-w-lg p-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-white">Create New Post</h2>
              <button onClick={() => setShowNewPost(false)} className="text-gray-400 hover:text-white">
                <AiOutlineClose size={24} />
              </button>
            </div>
            <form onSubmit={handleSubmitPost}>
              <textarea
                className="w-full bg-slate-700 text-white rounded p-3 mb-4"
                rows="4"
                placeholder="What's on your mind?"
                value={newPostContent}
                onChange={(e) => setNewPostContent(e.target.value)}
              ></textarea>
              <div className="mb-4">
                <input
                  type="file"
                  id="media"
                  className="hidden"
                  onChange={(e) => setFile(e.target.files[0])}
                />
                <label
                  htmlFor="media"
                  className="cursor-pointer inline-block bg-indigo-900 text-white px-4 py-2 rounded"
                >
                  Add Media
                </label>
                {file && (
                  <span className="ml-2 text-gray-300">
                    {file.name}
                    <button
                      type="button"
                      className="ml-2 text-red-400"
                      onClick={() => setFile(null)}
                    >
                      ✕
                    </button>
                  </span>
                )}
              </div>
              <button
                type="submit"
                className="bg-indigo-600 hover:bg-indigo-700 text-white rounded px-4 py-2 font-bold"
              >
                Post
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Posts List */}
      <div className="max-w-2xl mx-auto space-y-6">
        {posts.map((post, index) => (
          <div key={index} className="bg-slate-900/50 rounded-lg shadow-lg overflow-hidden">
            {/* Post Header */}
            <div className="px-4 py-3 border-b border-slate-800 flex justify-between items-center">
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-indigo-700 flex items-center justify-center">
                  <span className="text-white font-bold">{post.userName?.charAt(0)}</span>
                </div>
                <div className="ml-3">
                  <h3 className="text-white font-semibold">{post.userName}</h3>
                </div>
              </div>

              {/* Three-dot menu for post actions */}
              {isUserPost(post) && (
                <div className="relative">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      togglePostMenu(post._id);
                    }}
                    className="text-gray-400 hover:text-white p-1"
                  >
                    <FaEllipsisV size={18} />
                  </button>

                  {/* Post actions dropdown */}
                  {showMenu === post._id && (
                    <div className="absolute right-0 mt-1 w-32 bg-slate-800 rounded-lg shadow-lg overflow-hidden z-10">
                      <button
                        onClick={() => handleDeletePost(post._id)}
                        className="w-full text-left px-4 py-2 text-red-400 hover:bg-slate-700 flex items-center"
                      >
                        <AiOutlineClose size={16} className="mr-2" />
                        Delete Post
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Post Content */}
            <div className="p-4">
              <p className="text-white mb-3">{post.content}</p>

              {/* Media Display */}
              {post.media && post.media.length > 0 && (
                <div className="mb-3">
                  {post.media.map((media, index) => (
                    <div key={index} className="rounded overflow-hidden">
                      {media.type === 'image' ? (
                        <img src={media.url} alt="Post media" className="w-full h-auto" />
                      ) : (
                        <video src={media.url} controls className="w-full h-auto" />
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Like and Comment Counts */}
              <div className="flex justify-between items-center text-gray-400 text-sm mt-2 mb-3">
                <button
                  className="flex items-center hover:text-gray-300"
                  onClick={() => handleShowLikes(post._id)}
                >
                  <span>{post.likes.length} likes</span>
                </button>
                <button
                  className="flex items-center hover:text-gray-300"
                  onClick={() => setActiveCommentPost(activeCommentPost === post._id ? null : post._id)}
                >
                  <span>{post.comments.length} comments</span>
                </button>
              </div>

              {/* Like and Comment Buttons */}
              <div className="flex justify-around border-t border-b border-slate-800 py-2">
                <button
                  className="flex items-center space-x-1 text-gray-400 hover:text-indigo-400 transition-all duration-200"
                  onClick={() => handleLike(post._id)}
                >
                  {post.likes.some(like => like.user === user._id) ? (
                    <FaHeart className="text-red-500 transform scale-110 transition-transform duration-200" />
                  ) : (
                    <FaRegHeart className="transition-transform duration-200" />
                  )}
                  <span>Like</span>
                </button>
                <button
                  className="flex items-center space-x-1 text-gray-400 hover:text-indigo-400"
                  onClick={() => setActiveCommentPost(activeCommentPost === post._id ? null : post._id)}
                >
                  <FaComment />
                  <span>Comment</span>
                </button>
              </div>

              {/* Likes Modal */}
              {showLikes === post._id && post.likes.length > 0 && (
                <div className="mt-3 bg-slate-800 rounded p-3">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="text-white font-semibold">Likes</h4>
                    <button
                      onClick={() => setShowLikes(null)}
                      className="text-gray-400 hover:text-white"
                    >
                      <AiOutlineClose size={16} />
                    </button>
                  </div>
                  <div className="max-h-40 overflow-y-auto">
                    {post.likes.map((like, idx) => (
                      <div key={idx} className="flex items-center py-2 border-t border-slate-700">
                        <div className="w-8 h-8 rounded-full bg-indigo-700 flex items-center justify-center">
                          <span className="text-white font-bold">{like.userName?.charAt(0)}</span>
                        </div>
                        <span className="ml-2 text-white">{like.userName}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Comments Section */}
              {activeCommentPost === post._id && (
                <div className="mt-3">
                  {/* Comment form */}
                  <div className="flex space-x-2 mb-3">
                    <input
                      type="text"
                      className="flex-grow bg-slate-800 text-white rounded px-3 py-2"
                      placeholder="Write a comment..."
                      value={commentInputs[post._id] || ''}
                      onChange={(e) => handleCommentInputChange(post._id, e.target.value)}
                    />
                    <div className="flex space-x-1">
                      {commentInputs[post._id] && (
                        <button
                          onClick={() => discardComment(post._id)}
                          className="bg-gray-600 hover:bg-gray-700 text-white rounded px-3 py-1"
                        >
                          Discard
                        </button>
                      )}
                      <button
                        onClick={() => handleComment(post._id)}
                        className={`bg-indigo-600 hover:bg-indigo-700 text-white rounded px-3 py-1 ${!commentInputs[post._id] ? 'opacity-50 cursor-not-allowed' : ''}`}
                        disabled={!commentInputs[post._id]}
                      >
                        Post
                      </button>
                    </div>
                  </div>

                  {/* Comments list with improved borders */}
                  {post.comments.length > 0 && (
                    <div className="max-h-60 overflow-y-auto space-y-2">
                      {post.comments.map((comment, idx) => (
                        <div key={idx} className="bg-slate-800 rounded p-3 border-l-4 border-indigo-500">
                          <div className="flex items-center mb-1">
                            <div className="w-6 h-6 rounded-full bg-indigo-700 flex items-center justify-center">
                              <span className="text-white text-xs font-bold">{comment.userName?.charAt(0)}</span>
                            </div>
                            <span className="ml-2 text-white text-sm font-semibold">{comment.userName}</span>
                          </div>
                          <p className="text-gray-300 text-sm pl-8">{comment.content}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}

        {/* Load More Button */}
        {hasMore && (
          <div className="text-center py-4">
            <button
              onClick={fetchPosts}
              className="bg-indigo-600 hover:bg-indigo-700 text-white rounded px-4 py-2"
              disabled={loading}
            >
              {loading ? 'Loading...' : 'Load More'}
            </button>
          </div>
        )}

        {posts.length === 0 && !loading && (
          <div className="text-center py-10">
            <p className="text-gray-400">No posts yet. Be the first to post!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Post;