import React from 'react';

export const PageNotFound = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-indigo-800 to-purple-900 px-4 py-8">
      <div className="max-w-2xl w-full bg-white/10 backdrop-blur-md rounded-lg shadow-lg overflow-hidden border border-indigo-300/30">
        <div className="bg-indigo-900/80 p-6 text-center border-b-4 border-purple-500">
          <h1 className="text-4xl md:text-5xl font-serif text-white">404</h1>
          <div className="mt-2 w-16 h-1 bg-purple-500 mx-auto"></div>
          <h2 className="mt-3 text-xl md:text-2xl font-serif text-indigo-100">Page Not Found</h2>
        </div>

        <div className="p-6 md:p-8 text-center">
          <div className="mb-6">
            <svg className="w-24 h-24 mx-auto text-purple-200" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
          </div>

          <p className="text-indigo-100 text-lg mb-4 font-serif">
            "The page you are looking for might have been removed, had its name changed, or is temporarily unavailable."
          </p>

          <div className="flex flex-col md:flex-row gap-4 justify-center mt-8">
            <a
              href="/"
              className="px-6 py-3 bg-purple-600 text-white rounded hover:bg-purple-700 transition duration-300 ease-in-out shadow-md flex items-center justify-center"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7m-14 0l2 2m0 0l7 7 7-7m-14 0l2-2"></path>
              </svg>
              Return Home
            </a>

            <button
              onClick={() => window.history.back()}
              className="px-6 py-3 border-2 border-indigo-300/50 text-indigo-100 rounded hover:bg-indigo-700/30 transition duration-300 ease-in-out flex items-center justify-center"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
              </svg>
              Go Back
            </button>
          </div>
        </div>

        {/* Footer - Classical Style */}
        <div className="bg-indigo-900/50 p-4 border-t border-indigo-300/20 text-center">
          <p className="text-indigo-200 font-serif text-sm">
            "Lost and found in the digital realm"
          </p>
        </div>
      </div>
    </div>
  );
};

export default PageNotFound;