import React, { useState, useEffect } from 'react';
import { Search, Filter } from 'lucide-react';

export default function UpComingContest() {
  const [contests, setContests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPlatform, setSelectedPlatform] = useState('All');

  useEffect(() => {
    async function fetchContests() {
      try {
        const response = await fetch(`${process.env.REACT_APP_BASE_URL}/contests`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
        });

        if (!response.ok) {
          throw new Error('Failed to fetch contests');
        }

        const data = await response.json();
        setContests(Array.isArray(data.contests) ? data.contests : []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchContests();
  }, []);

  // Helper function to format date
  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleString();
    } catch (e) {
      return dateString;
    }
  };

  // Filter contests based on search term and platform
  const filteredContests = contests.filter((contest) => {
    const matchesSearch = contest.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPlatform = selectedPlatform === 'All' || contest.platform === selectedPlatform;
    return matchesSearch && matchesPlatform;
  });

  // Get unique platforms for filter dropdown
  const platforms = ['All', ...new Set(contests.map((contest) => contest.platform))];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-950">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-400"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-500 bg-opacity-20 text-red-200 p-4 rounded-lg text-center">
        Error loading contests: {error}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-950 px-4 py-8">
      {/* Header with title and filter */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-500 text-center md:text-left mb-4 md:mb-0">
          Upcoming Contests
        </h1>

        {/* Filter section */}
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
                {platforms.map((platform) => (
                  <option key={platform} value={platform}>
                    {platform}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      {filteredContests.length === 0 ? (
        <div className="bg-slate-800 p-4 rounded-lg text-center text-slate-300">
          No upcoming contests match your filters.
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          {filteredContests.map((contest) => (
            <div
              key={contest._id}
              className="bg-indigo-900/30 rounded-lg shadow-lg overflow-hidden border border-slate-700 hover:border-indigo-500 transition-all duration-300"
            >
              <div className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className={`text-xs font-medium px-2 py-0.5 rounded ${contest.platform === 'Codeforces' ? 'bg-red-500' : 'bg-green-500'}`}>
                    {contest.platform}
                  </span>
                </div>

                <h2 className="text-lg font-medium text-white mb-2 line-clamp-1">{contest.name}</h2>
                <p className="text-slate-300 text-sm mb-4 line-clamp-2">{contest.description}</p>

                <div className="grid grid-cols-2 gap-2 mb-4">
                  <div className="p-2 rounded bg-slate-900/80">
                    <p className="text-xs text-indigo-300 font-medium">START TIME</p>
                    <p className="text-sm font-medium text-gray-200">{formatDate(contest.startTime)}</p>
                  </div>
                  <div className="p-2 rounded bg-slate-900/80">
                    <p className="text-xs text-indigo-300 font-medium">DURATION</p>
                    <p className="text-sm font-medium text-gray-200">
                      {contest.duration} {contest.duration > 1 ? 'hours' : 'hour'}
                    </p>
                  </div>
                </div>

                <div className="flex justify-center">
                  <a
                    href={contest.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-white font-medium py-2 px-6 rounded-full transition-all duration-300 text-sm shadow-md bg-blue-500 hover:bg-blue-600"
                  >
                    Visit Contest Page
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}