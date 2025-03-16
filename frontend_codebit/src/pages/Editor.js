import React, { useState, useEffect } from 'react';
export default function CodeRunner() {
  const [code, setCode] = useState('');
  const [input, setInput] = useState('');
  const [language, setLanguage] = useState('cpp');
  const [output, setOutput] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  

  const languages = [
    { value: 'cpp', label: 'C++' },

  ];

  useEffect(() => {
    const savedCode = sessionStorage.getItem('code');
    const savedLanguage = sessionStorage.getItem('language');
    if (savedCode) setCode(savedCode);
    if (savedLanguage) setLanguage(savedLanguage);
  }, []);

  useEffect(() => {
    sessionStorage.setItem('code', code);
    sessionStorage.setItem('language', language);
  }, [code, language]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setOutput('');
    try {
      const res = await fetch(`${process.env.REACT_APP_BASE_URL}/execute`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, input, language }),
      });
      const data = await res.json();
      if (data.success === false) {
        setError(data.message || 'Execution failed');
        setLoading(false);
        return;
      }
      setOutput(data.output);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  const clearOutput = () => {
    setOutput('');
    setError(null);
  };

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-950 text-gray-100 overflow-hidden">
      {/* Header */}
      <div className="p-3 border-b border-indigo-800/30 bg-slate-900/80 backdrop-blur">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
            </svg>
            <h1 className="text-2xl font-bold text-indigo-300">Code Runner</h1>
          </div>
          <div className="flex items-center space-x-4">
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="px-3 py-2 bg-slate-800 border border-indigo-600/30 rounded-lg text-indigo-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {languages.map((lang) => (
                <option key={lang.value} value={lang.value}>
                  {lang.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 container mx-auto py-4 px-2 md:px-4 overflow-hidden">
        <div className="flex flex-col md:flex-row gap-4 h-full">
          {/* Left side - Code Editor and Info Section */}
          <div className="w-full md:w-2/3 flex flex-col gap-4 h-full">
            {/* Code Editor */}
            <div className="flex-1 flex flex-col min-h-0">
              <div className="mb-1 flex justify-between md:justify-evenly items-center">
                <h2 className="text-lg md:text-3xl md:mb-2  font-bold text-indigo-300">Code Editor</h2>
                <div className="text-sm text-indigo-400 px-2 py-1 bg-indigo-950/50 rounded-md border border-indigo-800/30">
                  {language.toUpperCase()}
                </div>
              </div>
              <div className="relative rounded-xl overflow-hidden border border-indigo-800/30 flex-1 flex flex-col">
                <textarea
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="Write your code here..."
                  className="w-full flex-1 p-4 font-mono resize-none bg-slate-900 text-indigo-100 focus:outline-none"
                  style={{
                    lineHeight: "1.6",
                    caretColor: "#818cf8",
                  }}
                ></textarea>
                <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600"></div>
              </div>
            </div>

            {/* Info section - collapsible on small screens */}
            <div className="rounded-xl border border-indigo-800/30 bg-slate-900 p-3 hidden md:block">
              <div className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h3 className="text-lg font-bold text-indigo-300">Tips</h3>
              </div>
              <ul className="mt-2 text-sm text-gray-300 space-y-1 pl-7 list-disc">
                <li>Your code will be automatically saved in this browser.</li>
                <li>For C++, make sure to include necessary headers and define a main function.</li>
                <li>If your code requires input, enter it in the input section.</li>
              </ul>
            </div>
          </div>

          {/* Right side - Input and Output */}
          <div className="w-full md:w-1/3 flex flex-col gap-4 h-full">
            {/* Input section */}
            <div className="flex-1 min-h-0 flex flex-col">
              <h2 className="text-lg md:text-3xl md:mb-2 font-bold text-indigo-300 mb-1">Input</h2>
              <div className="rounded-xl overflow-hidden border border-indigo-800/30 flex-1">
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Enter input here (if required)..."
                  className="w-full h-full p-4 font-mono resize-none bg-slate-900 text-indigo-100 focus:outline-none"
                ></textarea>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex gap-2">
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="flex-1 px-4 py-2 bg-indigo-700 hover:bg-indigo-600 text-white rounded-lg font-bold shadow-lg shadow-indigo-700/30 transition flex items-center justify-center gap-2 disabled:opacity-70"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Running...
                  </>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                    </svg>
                    Run Code
                  </>
                )}
              </button>
              <button
                onClick={clearOutput}
                className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-bold transition flex items-center gap-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                </svg>
                Clear
              </button>
            </div>

            {/* Output section */}
            <div className="flex-1 min-h-0 flex flex-col">
              <h2 className="text-lg font-bold text-indigo-300 mb-1 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
                Output
              </h2>
              <div className="rounded-xl border border-indigo-800/30 bg-slate-900 p-4 flex-1 overflow-auto">
                {error && (
                  <div className="p-3 mb-3 border border-red-500 rounded-lg bg-red-900/30 text-red-300 flex gap-2 items-start">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div>{error}</div>
                  </div>
                )}
                <pre className="font-mono text-gray-300 whitespace-pre-wrap">{output}</pre>
                {!output && !error && (
                  <div className="text-gray-500 italic flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    Output will appear here after running your code...
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}