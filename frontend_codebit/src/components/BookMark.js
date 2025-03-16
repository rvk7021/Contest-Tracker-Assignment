import React from 'react';
import { useState, useEffect } from 'react';
import { Bookmark, BookmarkX, ChevronLeft, ChevronRight, Search, Filter } from 'lucide-react';
import Swal from 'sweetalert2';

export const BookMark = () => {
    const [bookmarks, setBookmarks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedPlatform, setSelectedPlatform] = useState('All');
    const itemsPerPage = 12;

    const fetchBookmarks = async () => {
        try {
            const response = await fetch(`${process.env.REACT_APP_BASE_URL}/bookmark`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include'
            });
            console.log(response);
            if (!response.ok) {
                throw new Error('Failed to fetch bookmarks');
            }

            const data = await response.json();
            setBookmarks(data.bookmarks);
            setTotalPages(Math.ceil(data.bookmarks.length / itemsPerPage));
        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBookmarks();
    }, []);

    // Reset to first page when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, selectedPlatform]);

    const handleDelete = async (title) => {
        try {
            const response = await fetch(`${process.env.REACT_APP_BASE_URL}/bookmark`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({ contestTitle: title })
            });

            if (!response.ok) {
                throw new Error('Failed to delete bookmark');
            }

            // Show success message with SweetAlert2
            Swal.fire({
                title: 'Success!',
                text: 'Bookmark removed successfully',
                icon: 'success',
                confirmButtonColor: '#4f46e5', // indigo-600
                timer: 3000
            });

            // Refetch the updated list
            fetchBookmarks();

            // If we're on the last page and delete the last item on that page, go to previous page
            const newTotalPages = Math.ceil((bookmarks.length - 1) / itemsPerPage);
            if (currentPage > newTotalPages && currentPage > 1) {
                setCurrentPage(currentPage - 1);
            }
        } catch (error) {
            setError(error.message);
            // Show error message with SweetAlert2
            Swal.fire({
                title: 'Error',
                text: 'Failed to remove bookmark',
                icon: 'error',
                confirmButtonColor: '#4f46e5',
                timer: 3000
            });
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const handleNextPage = () => {
        if (currentPage < totalPages) {
            setCurrentPage(currentPage + 1);
        }
    };

    const handlePrevPage = () => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1);
        }
    };

    // Filter bookmarks based on search term and platform
    const filteredBookmarks = bookmarks.filter(bookmark => {
        const matchesSearch = bookmark.title.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesPlatform = selectedPlatform === 'All' || bookmark.platform === selectedPlatform;
        return matchesSearch && matchesPlatform;
    });

    // Get unique platforms for filter dropdown
    const platforms = ['All', ...new Set(bookmarks.map(bookmark => bookmark.platform))];

    // Calculate current items to display
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentBookmarks = filteredBookmarks.slice(indexOfFirstItem, indexOfLastItem);

    // Calculate new total pages based on filtered bookmarks
    const filteredTotalPages = Math.ceil(filteredBookmarks.length / itemsPerPage);

    // Generate page numbers
    const pageNumbers = [];
    for (let i = 1; i <= filteredTotalPages; i++) {
        pageNumbers.push(i);
    }

    // Calculate display range
    const startRange = indexOfFirstItem + 1;
    const endRange = Math.min(indexOfLastItem, filteredBookmarks.length);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-4 mt-16 text-center text-red-500">
                <p>Error: {error}</p>
                <button
                    onClick={fetchBookmarks}
                    className="mt-2 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                >
                    Retry
                </button>
            </div>
        );
    }

    return (
        <div className="container mt-16 mx-auto bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-950 p-4">
            <div className="flex flex-col md:flex-row justify-between items-center mb-6">
                <h1 className="text-3xl font-bold mb-4 md:mb-0 text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-500">Your Bookmarks</h1>

                {/* Filter section - stacks on mobile, inline on desktop */}
                {bookmarks.length > 0 && (
                    <div className="w-full md:w-auto bg-slate-800 rounded-lg p-4 md:p-3 border border-slate-700">
                        <div className="flex flex-col md:flex-row gap-4 md:items-center">
                            {/* Search box */}
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="Search bookmarks..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="bg-slate-700 border border-slate-600 text-white rounded-lg py-2 pl-9 pr-4 w-full md:w-48 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                />
                                <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                            </div>

                            {/* Platform filter */}
                            <div className="flex items-center gap-2">
                                <Filter className="h-4 w-4 text-slate-400" />
                                <select
                                    value={selectedPlatform}
                                    onChange={(e) => setSelectedPlatform(e.target.value)}
                                    className="bg-slate-700 border border-slate-600 text-white rounded-lg py-2 px-3 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                >
                                    {platforms.map(platform => (
                                        <option key={platform} value={platform}>{platform}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Display range */}
                            <div className="text-slate-300 text-sm md:ml-2">
                                Showing {filteredBookmarks.length > 0 ? `${startRange}-${endRange} of ${filteredBookmarks.length}` : '0 bookmarks'}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {bookmarks.length === 0 ? (
                <div className="text-center p-8 bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-950 rounded-lg shadow-lg">
                    <p className="text-gray-300">No bookmarks found</p>
                </div>
            ) : filteredBookmarks.length === 0 ? (
                <div className="text-center p-8 bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-950 rounded-lg shadow-lg">
                    <p className="text-gray-300">No bookmarks match your search</p>
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {currentBookmarks.map((bookmark, index) => (
                            <div
                                key={index}
                                className="bg-indigo-900/30 rounded-lg shadow-lg overflow-hidden"
                            >
                                <div className="p-5 relative">
                                    {/* Bookmark icon with delete functionality */}
                                    <div className="absolute top-4 right-4 flex items-center">
                                        <button
                                            onClick={() => handleDelete(bookmark.title)}
                                            className="relative group"
                                            aria-label="Remove bookmark"
                                        >
                                            <Bookmark className="text-indigo-300" size={22} />
                                            <BookmarkX
                                                className="absolute top-0 left-0 text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                                size={22}
                                            />
                                        </button>
                                    </div>

                                    {/* Title with more emphasis */}
                                    <div className="mb-4 pr-8">
                                        <h3 className="text-lg font-medium text-white tracking-tight line-clamp-1">
                                            {bookmark.title}
                                        </h3>
                                    </div>

                                    {/* Platform badge with improved styling */}
                                    <div className="flex items-center mb-3">
                                        <span className="px-3 py-1 text-xs font-medium bg-slate-900/80 text-indigo-300 rounded-full shadow-sm">
                                            {bookmark.platform}
                                        </span>
                                        <span className="ml-2 text-sm text-gray-300">
                                            {bookmark.duration} hour{bookmark.duration !== 1 ? 's' : ''}
                                        </span>
                                    </div>

                                    {/* Date with improved styling */}
                                    <div className="text-sm text-gray-300 mb-4 font-light">
                                        {formatDate(bookmark.date)}
                                    </div>

                                    {/* Action buttons with improved styling */}
                                    <div className="flex flex-wrap gap-5 mt-4">
                                        <a
                                            href={bookmark.contestLink}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="px-4 py-2 text-sm bg-blue-400 text-white rounded-md shadow-md font-medium"
                                        >
                                            Contest Link
                                        </a>
                                        {bookmark.solutionLink ? (
                                            <a
                                                href={bookmark.solutionLink}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="px-4 py-2 text-sm bg-slate-900/80 text-white rounded-md shadow-md font-medium"
                                            >
                                                Solution
                                            </a>
                                        ) : (
                                            <span className="text-sm text-gray-400 ml-4">No solution available</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Pagination with improved styling */}
                    {filteredTotalPages > 1 && (
                        <div className="flex justify-center items-center mt-8 space-x-2">
                            <button
                                onClick={handlePrevPage}
                                disabled={currentPage === 1}
                                className={`p-2 rounded-md ${currentPage === 1
                                    ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                                    : 'bg-blue-400 text-white'} shadow-md`}
                                aria-label="Previous page"
                            >
                                <ChevronLeft size={20} />
                            </button>

                            <div className="flex space-x-1">
                                {pageNumbers.map(number => (
                                    <button
                                        key={number}
                                        onClick={() => setCurrentPage(number)}
                                        className={`w-8 h-8 flex items-center justify-center rounded-md shadow-md ${currentPage === number
                                            ? 'bg-blue-400 text-white font-medium'
                                            : 'bg-slate-900/80 text-gray-300'
                                            }`}
                                    >
                                        {number}
                                    </button>
                                ))}
                            </div>

                            <button
                                onClick={handleNextPage}
                                disabled={currentPage === filteredTotalPages}
                                className={`p-2 rounded-md ${currentPage === filteredTotalPages
                                    ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                                    : 'bg-blue-400 text-white'} shadow-md`}
                                aria-label="Next page"
                            >
                                <ChevronRight size={20} />
                            </button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};