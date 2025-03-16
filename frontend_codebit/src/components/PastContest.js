import React from 'react';
import { useState, useEffect } from 'react';
import { Search, Filter, Bookmark, BookmarkCheck } from 'lucide-react';
import { toast } from 'react-hot-toast'; 
import Swal from 'sweetalert2';

export default function PastContest() {
  const [contests, setContests] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPlatform, setSelectedPlatform] = useState('All');
  const [bookmarkedContests, setBookmarkedContests] = useState([]);
  const [bookmarkLoading, setBookmarkLoading] = useState({});
  const contestsPerPage = 10;

  useEffect(() => {
    async function fetchContests() {
      try {
        const response = await fetch(`${process.env.REACT_APP_BASE_URL}/pastcontest/get`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          },
          credentials: 'include'
        });

        if (!response.ok) {
          throw new Error('Network response was not ok');
        }

        const data = await response.json();

        // Extract the past_contests array from the response
        if (data && data.past_contests && Array.isArray(data.past_contests)) {
          // Sort the contests by date in descending order (newest first)
          const sortedContests = data.past_contests.sort((a, b) =>
            new Date(b.start_time) - new Date(a.start_time)
          );
          setContests(sortedContests);
        } else {
          console.error("Unexpected data format:", data);
          setContests([]);
        }
      } catch (error) {
        console.error("Error fetching contests:", error);
        setError(error);
      } finally {
        setLoading(false);
      }
    }

    fetchContests();
    fetchBookmarks();
  }, []);

  // Fetch user's bookmarked contests
  const fetchBookmarks = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_BASE_URL}/bookmark`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      });

      if (!response.ok) {
        console.error("Failed to fetch bookmarks");
        return;
      }

      const data = await response.json();
      if (data && Array.isArray(data.bookmarks)) {
        const bookmarkTitles = data.bookmarks.map(bookmark => bookmark.contestTitle);
        setBookmarkedContests(bookmarkTitles);
      }
    } catch (error) {
      console.error("Error fetching bookmarks:", error);
    }
  };

  const addBookmark = async (contestTitle) => {
    // Don't proceed if already bookmarked
    if (isBookmarked(contestTitle)) {
      Swal.fire({
        title: 'Already Bookmarked',
        text: 'This contest is already in your bookmarks',
        icon: 'info',
        confirmButtonColor: '#4f46e5', // indigo-600
        timer: 3000
      });
      return;
    }

    setBookmarkLoading(prev => ({ ...prev, [contestTitle]: true }));

    try {
      const response = await fetch(`${process.env.REACT_APP_BASE_URL}/bookmark`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ contestTitle })
      });
      const data = await response.json();
      if (!response.ok) {
        // Check if the error is due to already bookmarked
        if (data.message && data.message.includes('already bookmarked')) {
          Swal.fire({
            title: 'Already Bookmarked',
            text: 'This contest is already in your bookmarks',
            icon: 'info',
            confirmButtonColor: '#4f46e5', // indigo-600
            timer: 3000
          });
        } else {
          throw new Error('Failed to add bookmark');
        }
      } else {
        // Only update bookmarked contests state on success
        setBookmarkedContests(prev => [...prev, contestTitle]);

        // Success message with SweetAlert instead of toast
        Swal.fire({
          title: 'Success!',
          text: 'Contest bookmarked successfully',
          icon: 'success',
          confirmButtonColor: '#4f46e5', // indigo-600
          timer: 3000
        });
      }
    } catch (error) {
      console.error("Error adding bookmark:", error);

      Swal.fire({
        title: 'Error',
        text: 'Failed to bookmark contest',
        icon: 'error',
        confirmButtonColor: '#4f46e5',
        timer: 3000
      });
    } finally {
      setBookmarkLoading(prev => ({ ...prev, [contestTitle]: false }));
    }
  };

  // Remove bookmark
  const removeBookmark = async (contestTitle) => {
    setBookmarkLoading(prev => ({ ...prev, [contestTitle]: true }));

    try {
      const response = await fetch(`${process.env.REACT_APP_BASE_URL}/bookmark`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ contestTitle })
      });

      if (!response.ok) {
        throw new Error('Failed to remove bookmark');
      }

      // Update bookmarked contests state
      setBookmarkedContests(prev => prev.filter(title => title !== contestTitle));
      toast.success('Bookmark removed successfully');
    } catch (error) {
      console.error("Error removing bookmark:", error);
      toast.error('Failed to remove bookmark');
    } finally {
      setBookmarkLoading(prev => ({ ...prev, [contestTitle]: false }));
    }
  };

  // Check if a contest is bookmarked
  const isBookmarked = (contestTitle) => {
    return bookmarkedContests.includes(contestTitle);
  };

  // Format date to readable format
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  // Calculate duration in hours and minutes
  const formatDuration = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  // Get platform badge color
  const getPlatformColor = (platform) => {
    switch (platform.toLowerCase()) {
      case 'codeforces':
        return 'bg-red-500';
      case 'codechef':
        return 'bg-green-500';
      case 'leetcode':
        return 'bg-yellow-500';
      case 'hackerrank':
        return 'bg-emerald-500';
      case 'atcoder':
        return 'bg-blue-500';
      default:
        return 'bg-purple-500';
    }
  };

  // Filter contests based on search term and platform
  const filteredContests = contests.filter(contest => {
    const matchesSearch = contest.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPlatform = selectedPlatform === 'All' || contest.platform === selectedPlatform;
    return matchesSearch && matchesPlatform;
  });

  // Get unique platforms for filter dropdown
  const platforms = ['All', ...new Set(contests.map(contest => contest.platform))];

  // Get paginated contests
  const indexOfLastContest = currentPage * contestsPerPage;
  const indexOfFirstContest = indexOfLastContest - contestsPerPage;
  const currentContests = filteredContests.slice(indexOfFirstContest, indexOfLastContest);
  const totalPages = Math.ceil(filteredContests.length / contestsPerPage);

  // Change page
  const paginate = (pageNumber) => setCurrentPage(pageNumber);
  const nextPage = () => setCurrentPage(prev => Math.min(prev + 1, totalPages));
  const prevPage = () => setCurrentPage(prev => Math.max(prev - 1, 1));

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedPlatform]);

  // Calculate display range
  const startRange = indexOfFirstContest + 1;
  const endRange = Math.min(indexOfLastContest, filteredContests.length);

  return (
    <div className="w-full">
      {/* Header with title and filter */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-white  text-center md:text-left mb-4 md:mb-0">Past Contests</h1>

        {/* Filter section - stacks on mobile, inline on desktop */}
        <div className="w-full md:w-auto bg-slate-800 rounded-lg p-4 md:p-3 border border-slate-700">
          <div className="flex flex-col md:flex-row gap-4 md:items-center">
            {/* Search box */}
            <div className="relative">
              <input
                type="text"
                placeholder="Search contests..."
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
              Showing {startRange}-{endRange} of {filteredContests.length}
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      {loading ? (
        <div className="flex justify-center items-center h-40">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-400"></div>
        </div>
      ) : error ? (
        <div className="bg-red-500 bg-opacity-20 text-red-200 p-4 rounded-lg text-center">
          Error loading contests. Please try again later.
        </div>
      ) : filteredContests.length === 0 ? (
        <div className="bg-slate-800 p-4 rounded-lg text-center text-slate-300">
          No past contests match your filters.
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            {currentContests.map((contest) => (
              <div key={contest._id} className="bg-slate-800 rounded-lg shadow-lg overflow-hidden hover:shadow-indigo-600/20 transition-shadow border border-slate-700">
                <div className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded ${getPlatformColor(contest.platform)}`}>
                        {contest.platform}
                      </span>
                      {contest.frozen && (
                        <span className="text-xs bg-blue-500 px-2 py-0.5 rounded ml-2">
                          Frozen
                        </span>
                      )}
                    </div>
                    {/* Bookmark button */}
                    {isBookmarked(contest.title) ? (
                      <button
                        onClick={() => removeBookmark(contest.title)}
                        disabled={bookmarkLoading[contest.title]}
                        className="text-indigo-400 hover:text-indigo-300 p-1 rounded-md transition-colors"
                        title="Remove bookmark"
                      >
                        {bookmarkLoading[contest.title] ? (
                          <div className="animate-spin h-5 w-5 border-t-2 border-indigo-400 rounded-full"></div>
                        ) : (
                          <BookmarkCheck className="h-5 w-5" />
                        )}
                      </button>
                    ) : (
                      <button
                        onClick={() => addBookmark(contest.title)}
                        disabled={bookmarkLoading[contest.title]}
                        className="text-slate-400 hover:text-indigo-400 p-1 rounded-md transition-colors"
                        title="Bookmark this contest"
                      >
                        {bookmarkLoading[contest.title] ? (
                          <div className="animate-spin h-5 w-5 border-t-2 border-indigo-400 rounded-full"></div>
                        ) : (
                          <Bookmark className="h-5 w-5" />
                        )}
                      </button>
                    )}
                  </div>

                  <h2 className="text-lg font-semibold text-white mb-2 line-clamp-1">{contest.title}</h2>

                  <div className="space-y-2 text-slate-300 text-sm mb-4">
                    <div className="flex justify-between">
                      <span>Start Time:</span>
                      <span className="text-slate-100">{formatDate(contest.start_time)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Duration:</span>
                      <span className="text-slate-100">{formatDuration(contest.duration_seconds)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Participants:</span>
                      <span className="text-slate-100">{contest.distinct_users}</span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center">
                    {contest.solution_link ? (
                      <a
                        href={contest.solution_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-indigo-400 hover:text-indigo-300 text-sm flex items-center"
                      >
                        View Solution
                        <svg className="w-3.5 h-3.5 ml-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </a>
                    ) : (
                      <span className="text-slate-500 text-sm">No solution available</span>
                    )}

                    <button className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm px-3 py-1.5 rounded-md transition-colors">
                      <a href={contest.contest_link} target="_blank" rel="noopener noreferrer">
                        View Contest
                      </a>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 0 && (
            <div className="flex justify-center items-center space-x-2 py-4">
              <button
                onClick={prevPage}
                disabled={currentPage === 1}
                className={`px-3 py-1 rounded-md ${currentPage === 1
                  ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
                  : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                  }`}
              >
                Previous
              </button>

              <div className="flex space-x-1">
                {/* Generate page numbers */}
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  // Show pages around current page
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }

                  return (
                    <button
                      key={pageNum}
                      onClick={() => paginate(pageNum)}
                      className={`w-8 h-8 flex items-center justify-center rounded-md ${currentPage === pageNum
                        ? 'bg-indigo-600 text-white'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                        }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={nextPage}
                disabled={currentPage === totalPages}
                className={`px-3 py-1 rounded-md ${currentPage === totalPages
                  ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
                  : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                  }`}
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}