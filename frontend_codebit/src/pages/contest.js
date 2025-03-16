import React, { useState } from 'react'
import UpComingContest from '../components/UpComingContest'
import PastContest from '../components/PastContest'
import { BookMark } from '../components/BookMark'
import { Calendar, History, BookmarkIcon, ExternalLink, Code, TrendingUp } from 'lucide-react'

export default function Contest() {
  const [activeTab, setActiveTab] = useState('upcoming')

  const renderContent = () => {
    switch (activeTab) {
      case 'upcoming':
        return <div className="w-full"><UpComingContest /></div>
      case 'past':
        return <div className="w-full"><PastContest /></div>
      case 'bookmarks':
        return <div className="w-full"><BookMark /></div>
      default:
        return <div className="w-full"><UpComingContest /></div>
    }
  }

  return (
    <div className="bg-gradient-to-br from-slate-900 to-slate-800 mt-16 min-h-screen text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Left sidebar with tabs */}
          <div className="w-full lg:w-72 flex flex-col gap-3">
            <div className="p-4 bg-slate-800/50 backdrop-blur-sm rounded-xl mb-2 border border-slate-700/50">
              <div className="flex items-center mb-4">
                <Code className="h-5 w-5 text-indigo-400 mr-2" />
                <h2 className="text-lg font-semibold text-indigo-300">Coding Contests</h2>
              </div>
              <p className="text-slate-400 text-sm">Find and track your favorite programming competitions</p>
            </div>

            <button
              onClick={() => setActiveTab('upcoming')}
              className={`flex items-center gap-3 px-5 py-4 rounded-xl transition-all ${activeTab === 'upcoming'
                ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-lg shadow-indigo-900/30'
                : 'bg-slate-800/70 text-slate-300 hover:bg-slate-700/70'
                }`}
            >
              <Calendar className="h-5 w-5" />
              <span className="font-medium">Upcoming</span>
              {activeTab === 'upcoming' && (
                <span className="ml-auto bg-indigo-500/30 px-2 py-1 rounded-md text-xs">
                  Active
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('past')}
              className={`flex items-center gap-3 px-5 py-4 rounded-xl transition-all ${activeTab === 'past'
                ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-lg shadow-indigo-900/30'
                : 'bg-slate-800/70 text-slate-300 hover:bg-slate-700/70'
                }`}
            >
              <History className="h-5 w-5" />
              <span className="font-medium">Past</span>
              {activeTab === 'past' && (
                <span className="ml-auto bg-indigo-500/30 px-2 py-1 rounded-md text-xs">
                  Active
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('bookmarks')}
              className={`flex items-center gap-3 px-5 py-4 rounded-xl transition-all ${activeTab === 'bookmarks'
                ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-lg shadow-indigo-900/30'
                : 'bg-slate-800/70 text-slate-300 hover:bg-slate-700/70'
                }`}
            >
              <BookmarkIcon className="h-5 w-5" />
              <span className="font-medium">Bookmarks</span>
              {activeTab === 'bookmarks' && (
                <span className="ml-auto bg-indigo-500/30 px-2 py-1 rounded-md text-xs">
                  Active
                </span>
              )}
            </button>

            {/* PCD Card */}
            <div className="mt-6 bg-gradient-to-br from-indigo-800 to-indigo-900 rounded-xl p-5 border border-indigo-700/50 shadow-lg">
              <div className="flex items-center mb-2">
                <TrendingUp className="h-5 w-5 text-indigo-300 mr-2" />
                <h2 className="text-lg font-bold text-white">Post Contest Discussion</h2>
              </div>
              <p className="text-indigo-200 text-sm mb-4">Join our community discussion and improve your problem-solving skills!</p>
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center bg-indigo-600 hover:bg-indigo-500 px-4 py-3 rounded-lg transition-all w-full font-medium shadow-md"
              >
                View Now <ExternalLink className="ml-2 h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Main content area */}
          <div className="flex-1 w-full">
            <div className="bg-slate-800/70 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50 shadow-xl w-full">
              <div className="flex items-center mb-6 w-full">
                {activeTab === 'upcoming' && <Calendar className="h-6 w-6 text-indigo-400 mr-3" />}
                {activeTab === 'past' && <History className="h-6 w-6 text-indigo-400 mr-3" />}
                {activeTab === 'bookmarks' && <BookmarkIcon className="h-6 w-6 text-indigo-400 mr-3" />}
              </div>

              <div className="w-full">
                {renderContent()}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}