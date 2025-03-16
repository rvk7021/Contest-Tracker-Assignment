import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from 'react-redux';
const Home = () => {
    const navigate = useNavigate();
    const { user } = useSelector(state => state.profile);
    const [islogin, setIslogin] = useState(false);
    useEffect(() => {
        if (user) {
            setIslogin(true);
        }
    }, [user]);
    const [leaderboardData, setLeaderboardData] = useState([]);
    const [loader, setLoader] = useState(false);
    useEffect(() => {
        const fetchLeaderboardData = async () => {
            setLoader(true);
            try {
                const response = await fetch(`${process.env.REACT_APP_BASE_URL}/leaderboard`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });

                if (response.ok) {
                    const data = await response.json();
                    if (data.success) {
                        // Map API response to match the existing format
                        const formattedData = data.leaderboard.map((user, index) => ({
                            id: index + 1,  // Assigning a unique ID based on position
                            username: user.userName,
                            problemsSolved: user.problemsSolved,
                            avatar: user.userName.charAt(0).toUpperCase(), // First letter as avatar
                            college: user.college
                        }));

                        setLeaderboardData(formattedData);
                    } else {
                        console.error("Error in response:", data.message);
                    }
                } else {
                    console.error("Failed to fetch leaderboard data:", response.status);
                }
            } catch (error) {
                console.error("Error fetching leaderboard data:", error);
            } finally {
                setLoader(false);
            }
        };

        fetchLeaderboardData();
    }, []);


    const [posts, setPosts] = useState([]);

    useEffect(() => {
        const fetchFeedPost = async () => {
            setLoader(true);
            try {
                const response = await fetch(`${process.env.REACT_APP_BASE_URL}/post/home/feed`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });

                if (response.ok) {
                    const data = await response.json();
                    if (data.success) {
                        setPosts(data.posts); // Directly setting the API response
                    } else {
                        console.error("Error in response:", data.message);
                    }
                } else {
                    console.error("Error fetching feed posts:", response.status);
                }
            } catch (error) {
                console.error("Error fetching feed posts:", error);
            } finally {
                setLoader(false);
            }
        };

        fetchFeedPost();
    }, []);

    const handleStartCoding = () => navigate('/problem-set');
    const handleJoinContest = () => navigate('/contest');
    const [currentPage, setCurrentPage] = useState(1);
    const usersPerPage = 10;
    const [collegeFilter, setCollegeFilter] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [isSearching, setIsSearching] = useState(false);

    // Filter leaderboard data
    const filteredLeaderboardData = leaderboardData.filter(user => {
        const matchesCollege = collegeFilter === "all" || user.college === collegeFilter;
        const matchesSearch = !isSearching || user.username.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesCollege && matchesSearch;
    });

    // Calculate pagination correctly
    const totalPages = Math.max(1, Math.ceil(filteredLeaderboardData.length / usersPerPage));
    const startIndex = (currentPage - 1) * usersPerPage;
    const currentUsers = filteredLeaderboardData.slice(startIndex, startIndex + usersPerPage);

    // Fix: Make sure currentPage doesn't exceed totalPages when data changes
    if (currentPage > totalPages && totalPages > 0) {
        setCurrentPage(totalPages);
    }

    const colleges = ['all', ...new Set(leaderboardData.map(user => user.college))];

    const getPageNumbers = () => {
        const pageNumbers = [];
        const maxPageButtons = 5;

        if (totalPages <= maxPageButtons) {
            for (let i = 1; i <= totalPages; i++) pageNumbers.push(i);
        } else {
            pageNumbers.push(1);

            let startPage = Math.max(2, currentPage - 1);
            let endPage = Math.min(totalPages - 1, currentPage + 1);

            if (currentPage <= 2) endPage = 4;
            else if (currentPage >= totalPages - 1) startPage = totalPages - 3;

            if (startPage > 2) pageNumbers.push('...');
            for (let i = startPage; i <= endPage; i++) pageNumbers.push(i);
            if (endPage < totalPages - 1) pageNumbers.push('...');
            pageNumbers.push(totalPages);
        }
        return pageNumbers;
    };

    const handleSearch = () => {
        setIsSearching(!!searchTerm.trim());
        setCurrentPage(1); // Reset to first page on search
    };

    const clearSearch = () => {
        setSearchTerm('');
        setIsSearching(false);
        setCurrentPage(1);
    };

    const handlePostClick = () => {
        if (islogin)
            navigate(`/posts`);
        else
            navigate('/sign-up');
    };

    return (
        <div className="min-h-screen bg-slate-950">
            {/* Hero Section - Enhanced with more dramatic gradient and subtle animation */}
            <div className="relative bg-gradient-to-r from-indigo-800 to-purple-800 overflow-hidden">
                <div className="overflow-hidden opacity-20">
                    <div className="absolute -top-24 -left-24 w-96 h-96 bg-purple-500 rounded-full filter blur-3xl"></div>
                    <div className="absolute top-1/2 -right-24 w-64 h-64 bg-indigo-500 rounded-full filter blur-3xl"></div>
                </div>

                <div className="relative max-w-7xl mx-auto py-20 md:py-28 px-6 lg:px-8 text-center">
                    <span className="inline-block px-4 py-1.5 mb-6 text-sm font-medium rounded-full bg-indigo-900/40 text-fuchsia-200 backdrop-blur-sm border border-indigo-700/50">
                        Coding challenges for everyone
                    </span>
                    <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight">
                        Master Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-400 to-violet-400">Coding Skills</span>
                    </h1>
                    <p className="mt-6 text-xl text-violet-100 max-w-2xl mx-auto leading-relaxed">
                        Solve problems, compete in contests, and climb the leaderboard to showcase your programming expertise.
                    </p>
                    <div className="mt-10 flex flex-wrap justify-center gap-6">
                        <button className="group relative px-8 py-4 rounded-md text-lg font-medium transition-all duration-300 overflow-hidden" onClick={handleStartCoding}>
                            <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-white to-violet-100 transition-all duration-300 group-hover:scale-105"></span>
                            <span className="relative text-violet-800 font-semibold">Start Coding</span>
                        </button>
                        <button className="group relative px-8 py-4 rounded-md text-lg font-medium transition-all duration-300 overflow-hidden" onClick={handleJoinContest}>
                            <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-fuchsia-600 to-purple-800 transition-all duration-300 group-hover:scale-105"></span>
                            <span className="relative text-white font-semibold">Join Contest</span>
                        </button>
                    </div>
                </div>

                {/* Decorative wave at bottom */}
                <div className="h-16 bg-slate-950 relative">
                    <svg className="absolute -top-1 w-full h-16 text-slate-950 fill-current" viewBox="0 0 1440 48" preserveAspectRatio="none">
                        <path d="M0 48h1440V0C1200 30 960 48 720 30 480 12 240 0 0 0v48z"></path>
                    </svg>
                </div>
            </div>

            {/* Leaderboard and Post Section */}
            <div className="bg-slate-950 relative">
                {/* Subtle background elements */}
                <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute left-1/4 top-1/4 w-64 h-64 rounded-full bg-indigo-900/10 filter blur-3xl"></div>
                    <div className="absolute right-1/3 bottom-1/4 w-64 h-64 rounded-full bg-purple-900/10 filter blur-3xl"></div>
                </div>

                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 xl:gap-12">
                        {/* Leaderboard Section - Enhanced glass effect */}
                        <div className="flex flex-col h-full">
                            <div className="bg-slate-900/80 rounded-2xl shadow-xl overflow-hidden border border-slate-800/60 flex flex-col h-full backdrop-blur-lg">
                                <div className="px-6 py-5 border-b border-slate-800/70 bg-gradient-to-r from-indigo-900/30 to-purple-900/30">
                                    <div className="flex items-center">
                                        <svg className="h-6 w-6 text-fuchsia-400 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                                        </svg>
                                        <h3 className="text-2xl font-bold text-white">Leaderboard</h3>
                                    </div>

                                    {/* Search input - Improved styling */}
                                    <div className="mt-5 mb-4">
                                        <label htmlFor="search" className="block text-sm font-medium text-violet-200 mb-2">
                                            Search User
                                        </label>
                                        <div className="relative flex items-center">
                                            <input
                                                type="text"
                                                id="search"
                                                value={searchTerm}
                                                onChange={(e) => setSearchTerm(e.target.value)}
                                                placeholder="Enter username..."
                                                className="block w-full bg-slate-800/70 border border-slate-700/60 rounded-lg py-3 px-4 text-white appearance-none text-sm focus:outline-none focus:ring-2 focus:ring-fuchsia-500 focus:border-fuchsia-500 placeholder-gray-500"
                                                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                                            />
                                            {searchTerm && (
                                                <button
                                                    onClick={clearSearch}
                                                    className="absolute right-20 text-gray-400 hover:text-white transition-colors"
                                                    aria-label="Clear search"
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                                    </svg>
                                                </button>
                                            )}
                                            <button
                                                onClick={handleSearch}
                                                className="ml-2 bg-gradient-to-r from-fuchsia-600 to-purple-800 hover:from-fuchsia-500 hover:to-purple-500 text-white px-4 py-3 rounded-lg transition-colors text-sm font-medium focus:outline-none focus:ring-2 focus:ring-fuchsia-500"
                                            >
                                                Search
                                            </button>
                                        </div>
                                    </div>

                                    {/* College filter dropdown - Enhanced styling */}
                                    <div className="mt-5">
                                        <label htmlFor="college" className="block text-sm font-medium text-violet-200 mb-2">
                                            Filter by College
                                        </label>
                                        <div className="relative">
                                            <select
                                                id="college"
                                                name="college"
                                                value={collegeFilter}
                                                onChange={(e) => {
                                                    setCollegeFilter(e.target.value);
                                                    setCurrentPage(1); // Reset to first page on filter change
                                                }}
                                                className="block w-full bg-slate-800/70 border border-slate-700/60 rounded-lg py-3 px-4 text-white appearance-none text-sm focus:outline-none focus:ring-2 focus:ring-fuchsia-500 focus:border-fuchsia-500"
                                            >
                                                {colleges.map((college) => (
                                                    <option key={college} value={college}>
                                                        {college === "all" ? "All Colleges" : college}
                                                    </option>
                                                ))}
                                            </select>
                                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-violet-300">
                                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                </svg>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-slate-900/60 flex-grow overflow-y-auto">
                                    {loader ? (
                                        <div className="flex justify-center items-center py-20">
                                            <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                                        </div>
                                    ) : (
                                        <ul className="divide-y divide-slate-800/50">
                                            {currentUsers.length > 0 ? (
                                                currentUsers.map((user, index) => (
                                                    <li key={user.id} className="px-6 py-5 hover:bg-slate-800/30 transition-all duration-200">
                                                        <div className="flex items-center">
                                                            <span className={`w-8 h-8 flex items-center justify-center rounded-full font-semibold ${startIndex + index === 0 ? "bg-gradient-to-r from-yellow-500 to-amber-600 shadow-lg shadow-amber-900/30 text-white" :
                                                                startIndex + index === 1 ? "bg-gradient-to-r from-slate-300 to-slate-400 shadow-lg shadow-slate-900/20 text-slate-900" :
                                                                    startIndex + index === 2 ? "bg-gradient-to-r from-amber-700 to-amber-800 shadow-lg shadow-amber-900/30 text-amber-100" :
                                                                        "bg-slate-800/80 text-gray-500"
                                                                }`}>
                                                                {startIndex + index + 1}
                                                            </span>
                                                            <div className={`h-12 w-12 ml-4 rounded-full flex items-center justify-center shadow-lg ${startIndex + index < 3
                                                                ? "bg-gradient-to-br from-indigo-600 to-fuchsia-600"
                                                                : "bg-gradient-to-br from-slate-700 to-slate-800"
                                                                }`}>
                                                                <span className="text-white text-lg font-semibold">{user.avatar}</span>
                                                            </div>
                                                            <div className="ml-5 flex-1">
                                                                <p className="text-md font-medium text-white">{user.username}</p>
                                                                <div className="flex items-center mt-1.5">
                                                                    <p className="text-sm text-gray-400">{user.problemsSolved} problems solved</p>
                                                                    <span className="mx-2 text-xs text-gray-500">•</span>
                                                                    <p className="text-sm text-fuchsia-300">{user.college}</p>
                                                                </div>
                                                            </div>
                                                            {startIndex + index < 3 && (
                                                                <div className="text-2xl">
                                                                    {startIndex + index === 0 && "🏆"}
                                                                    {startIndex + index === 1 && "🥈"}
                                                                    {startIndex + index === 2 && "🥉"}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </li>
                                                ))
                                            ) : (
                                                <li className="px-6 py-10 text-center">
                                                    <p className="text-gray-400">No users found with the current filter{isSearching ? " and search" : ""}.</p>
                                                    {isSearching && (
                                                        <button
                                                            onClick={clearSearch}
                                                            className="mt-4 text-fuchsia-400 hover:text-fuchsia-300 text-sm font-medium"
                                                        >
                                                            Clear search
                                                        </button>
                                                    )}
                                                </li>
                                            )}
                                        </ul>
                                    )}

                                    {/* Pagination - Enhanced styling */}
                                    {!loader && totalPages > 1 && (
                                        <div className="px-6 py-5 flex items-center justify-center border-t border-slate-800/50">
                                            <div className="flex items-center space-x-2">
                                                <button
                                                    disabled={currentPage === 1}
                                                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                                    className={`px-3 py-2 text-sm rounded-md transition-colors ${currentPage === 1
                                                        ? "text-gray-500 cursor-not-allowed bg-slate-800/50"
                                                        : "text-white bg-slate-700/60 hover:bg-slate-600/70"
                                                        }`}
                                                    aria-label="Previous page"
                                                >
                                                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                                    </svg>
                                                </button>

                                                <div className="flex items-center space-x-1.5">
                                                    {getPageNumbers().map((page, index) => (
                                                        page === '...' ? (
                                                            <span key={`ellipsis-${index}`} className="px-2 text-gray-500">...</span>
                                                        ) : (
                                                            <button
                                                                key={`page-${page}`}
                                                                onClick={() => setCurrentPage(page)}
                                                                className={`min-w-10 h-10 flex items-center justify-center rounded-md text-sm transition-colors ${currentPage === page
                                                                    ? "bg-gradient-to-r from-fuchsia-600 to-purple-600 text-white font-medium"
                                                                    : "text-gray-300 hover:bg-slate-700/60"
                                                                    }`}
                                                            >
                                                                {page}
                                                            </button>
                                                        )
                                                    ))}
                                                </div>

                                                <button
                                                    disabled={currentPage === totalPages}
                                                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                                    className={`px-3 py-2 text-sm rounded-md transition-colors ${currentPage === totalPages
                                                        ? "text-gray-500 cursor-not-allowed bg-slate-800/50"
                                                        : "text-white bg-slate-700/60 hover:bg-slate-600/70"
                                                        }`}
                                                    aria-label="Next page"
                                                >
                                                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                    </svg>
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Posts Section - Enhanced with more modern card styling */}
                        <div className="flex flex-col h-full lg:col-span-2">
                            <div className="bg-slate-900/80 rounded-2xl shadow-xl overflow-hidden border border-slate-800/60 flex flex-col h-full backdrop-blur-lg">
                                <div className="px-6 py-5 border-b border-slate-800/70 bg-gradient-to-r from-indigo-900/30 to-purple-900/30">
                                    <div className="flex items-center">
                                        <svg className="h-6 w-6 text-fuchsia-400 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                                        </svg>
                                        <h3 className="text-2xl font-bold text-white">Latest Posts</h3>
                                    </div>
                                </div>
                                <div className="divide-y divide-slate-800/50 flex-grow overflow-y-auto">
                                    {loader ? (
                                        <div className="flex justify-center items-center py-20">
                                            <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                                        </div>
                                    ) : (
                                        posts.map((post) => (
                                            <article
                                                key={post.id}
                                                className="p-6 hover:bg-slate-800/30 transition-all duration-200 cursor-pointer"
                                                onClick={() => handlePostClick()}
                                            >
                                                <div className="sm:flex gap-6">
                                                    <div className="sm:flex-shrink-0 mb-4 sm:mb-0 w-full sm:w-48 md:w-40 lg:w-36 xl:w-48">
                                                        <div className="aspect-square rounded-xl overflow-hidden shadow-lg group">
                                                            <div className="w-full h-full bg-gradient-to-br from-indigo-700 to-fuchsia-700 group-hover:scale-105 transition-transform duration-300 flex items-center justify-center p-4">
                                                                <span className="text-3xl font-bold text-white">{post.image.charAt(0).toUpperCase()}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="flex-1">
                                                        <h4 className="text-xl font-bold text-white tracking-tight hover:text-indigo-300 transition-colors">{post.title}</h4>
                                                        <p className="mt-3 text-gray-300 leading-relaxed">{post.excerpt}</p>
                                                        <div className="mt-5 flex justify-between items-center">
                                                            <div className="flex items-center">
                                                                <div className="h-9 w-9 rounded-full bg-gradient-to-br from-indigo-600 to-fuchsia-600 flex items-center justify-center shadow-md shadow-purple-900/20">
                                                                    <span className="text-white text-sm font-medium">{post.authorAvatar}</span>
                                                                </div>
                                                                <span className="ml-3 text-sm text-gray-400">
                                                                    {post.author} • {post.date}
                                                                </span>
                                                            </div>
                                                            <div className="flex items-center space-x-4">
                                                                <div className="flex items-center text-indigo-400">
                                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                                                    </svg>
                                                                    <span className="text-sm">{post.likes}</span>
                                                                </div>
                                                                <div className="flex items-center text-indigo-400">
                                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                                                    </svg>
                                                                    <span className="text-sm">{post.comments}</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </article>
                                        ))
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className="bg-gradient-to-tr from-indigo-800 to-purple-800 py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center">
                        <h2 className="text-3xl font-bold text-white">Why Choose Codebit?</h2>
                        <p className="mt-4 text-lg text-gray-400 max-w-2xl mx-auto">
                            The ultimate platform to elevate your programming skills and prepare for technical interviews.
                        </p>
                    </div>
                    <div className="mt-10 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
                        {/* Feature 1 */}
                        <div className="bg-indigo-900/30 backdrop-blur-lg rounded-xl p-6 border border-indigo-700/50 shadow-lg">
                            <div className="h-12 w-12 rounded-full bg-fuchsia-600/30 flex items-center justify-center mb-5">
                                <svg className="h-6 w-6 text-fuchsia-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2">Integrated Problem-Solving Platform</h3>
                            <p className="text-gray-300">Access a curated collection of problems along with a built-in compiler, eliminating the need to switch between multiple platforms.</p>
                        </div>

                        {/* Feature 2 */}
                        <div className="bg-indigo-900/30 backdrop-blur-lg rounded-xl p-6 border border-indigo-700/50 shadow-lg">
                            <div className="h-12 w-12 rounded-full bg-fuchsia-600/30 flex items-center justify-center mb-5">
                                <svg className="h-6 w-6 text-fuchsia-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2">All-Platform Contest Alerts</h3>
                            <p className="text-gray-300">Never miss a coding contest again! Get real-time alerts for competitions across multiple platforms, all in one place.</p>
                        </div>

                        {/* Feature 3 */}
                        <div className="bg-indigo-900/30 backdrop-blur-lg rounded-xl p-6 border border-indigo-700/50 shadow-lg">
                            <div className="h-12 w-12 rounded-full bg-fuchsia-600/30 flex items-center justify-center mb-5">
                                <svg className="h-6 w-6 text-fuchsia-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2">Sheet & Progress Management</h3>
                            <p className="text-gray-300">Track your progress effortlessly with an integrated sheet manager, helping you stay organized and focused on your learning journey.</p>
                        </div>
                    </div>

                    <div className="mt-16 flex justify-center">
                        {islogin && <button
                            onClick={handleStartCoding}
                            className="px-8 py-4 bg-white rounded-lg text-purple-800 font-bold text-lg hover:bg-gray-100 transition-colors shadow-xl"
                        >
                            Get Started Now
                        </button>}
                        {!islogin && <button
                            className="px-8 py-4 bg-white rounded-lg text-purple-800 font-bold text-lg hover:bg-gray-100 transition-colors shadow-xl ml-4"
                            onClick={() => navigate('/sign-up')}
                        >Create account</button>}
                    </div>
                </div>
            </div>


        </div>
    );
};

export default Home;