import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import Submission from '../components/Submission';
import Problem from "../components/Problem";

export default function ProblemPractice() {
  const [code, setCode] = useState("");
  const [testCases, setTestCases] = useState([]);
  const [results, setResults] = useState([]);
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingSubmission, setLoadingSubmission] = useState(false);
  const [problem, setProblem] = useState(null);
  const [testResult, setTestResult] = useState(false);
  const [showSubmission, setShowSubmission] = useState(false);
  const [showAcceptedAnimation, setShowAcceptedAnimation] = useState(false);
  const { title } = useParams(); 
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.profile);

  useEffect(() => {
    const savedCode = sessionStorage.getItem('code');
    if (savedCode) {
      setCode(savedCode);
    }
  }, []);

  useEffect(() => {
    sessionStorage.setItem('code', code);
    setResults([]);
  }, [code]);

  useEffect(() => {
    if (!user) {
      navigate("/sign-in");
    }
  }, [user, navigate]);

  useEffect(() => {
    async function fetchProblemData() {
      try {
        const res = await fetch(`${process.env.REACT_APP_BASE_URL}/problems/searchbyn?title=${title}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });
        
        const data = await res.json();
    
        
        setProblem(data.problem[0]);
        
        // Check if test cases exist
        const fetchedTestCases = data.testcases[0]?.TestCases || [];
        
        if (fetchedTestCases.length === 0) {
          // If no test cases are available, set a message
          setMessage("No test cases available for this problem.");
        }
        
        setTestCases(fetchedTestCases);
      } catch (err) {
  
        setMessage("Failed to fetch problem details.");
      }
    }
    
    if (title) {
      fetchProblemData();
    }
  }, [title]);

  const handleRunCode = async() => {
    // Prevent running code if no test cases are available
    if (testCases.length === 0) {
      setMessage("No test cases available to run code against.");
      return;
    }

    setLoading(true);
    setMessage(null);
    setResults([]);
    setTestResult(true);

    try {
      const test = testCases.slice(0,2); 
      const res = await fetch(`${process.env.REACT_APP_BASE_URL}/run`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: 'include',
        body: JSON.stringify({ code, title, test }),
      });

      const data = await res.json();
      
      if (!data.success) {
        setMessage(data.message || "Execution failed");
      } else {
        setResults(data.results);
      }
    } catch (err) {
      setMessage(err.message);
    }
    setLoading(false);
  }

  const handleSubmit = async () => {
    // Prevent submission if no test cases are available
    if (testCases.length === 0) {
      setMessage("No test cases available to submit code against.");
      return;
    }

    setLoadingSubmission(true);
    setMessage(null);
    setResults([]);
    setTestResult(true);

    try {
      const res = await fetch(`${process.env.REACT_APP_BASE_URL}/submit`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: 'include',
        body: JSON.stringify({ code, title, testCases, problem }),
      });
      
      const data = await res.json();
      
      if (!data.success) {
        setMessage(data.message || "Execution failed");
      } else {
        setResults(data.results);
        
        // Check if all test cases passed
        const allPassed = data.results.every(
          result => result.actualOutput === result.expectedOutput
        );
        
        if (allPassed) {
          setShowAcceptedAnimation(true);
          
          // After animation, show submission tab
          setTimeout(() => {
            setShowAcceptedAnimation(false);
            setShowSubmission(true);
          }, 2500)
        }
        
        
      }
    } catch (err) {
      setMessage(err.message);
    }
    setLoadingSubmission(false);
  };

  // Animated loader component
  const Loader = () => (
    <div className="flex justify-center items-center">
      <div className="relative w-12 h-12">
        <div className="absolute inset-0 border-4 border-indigo-300 border-t-indigo-500 rounded-full animate-spin"></div>
        <div className="absolute inset-2 border-4 border-indigo-400 border-t-indigo-600 rounded-full animate-spin animation-delay-150"></div>
      </div>
    </div>
  );

  // Accepted animation component
  const AcceptedAnimation = () => (
    <div className="fixed inset-0 flex items-center justify-center bg-slate-900/90 z-50">
      <div className="flex flex-col items-center">
        <div className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center mb-6 animate-pulse">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-white animate-bounce" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-3xl font-bold text-green-400 animate-pulse">Accepted!</h2>
        <p className="text-indigo-300 mt-2">All test cases passed successfully</p>
      </div>
    </div>
  );

  // Get the appropriate "no results" message based on state
  const getNoResultsMessage = () => {
    if (message === "No test cases available for this problem.") {
      return (
        <div className="flex flex-col items-center justify-center h-64 bg-slate-950/50 rounded-lg border border-indigo-800/30 p-6">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-indigo-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7l-2 1m2-1l-2-1m2 1v2.5M14 4l-2-1-2 1M4 7l2-1M4 7l2 1M4 7v2.5M12 21l-2-1m2 1l2-1m-2 1v-2.5M6 18l-2-1v-2.5M18 18l2-1v-2.5" />
          </svg>
          <p className="text-indigo-400 font-medium mb-2">No Test Cases</p>
          <p className="text-gray-400 text-center">This problem currently has no test cases available for validation.</p>
        </div>
      );
    }
    
    if (loading) {
      return (
        <div className="flex flex-col items-center justify-center h-64 bg-slate-950/50 rounded-lg border border-indigo-800/30 p-6">
          <Loader />
          <p className="mt-4 text-indigo-300 font-medium">Running your code...</p>
          <p className="text-gray-400 mt-2">Executing test cases and analyzing results</p>
        </div>
      );
    } else if (loadingSubmission) {
      return (
        <div className="flex flex-col items-center justify-center h-64 bg-slate-950/50 rounded-lg border border-indigo-800/30 p-6">
          <Loader />
          <p className="mt-4 text-indigo-300 font-medium">Submitting your code...</p>
          <p className="text-gray-400 mt-2">Testing against all case scenarios</p>
        </div>
      );
    } else {
      return (
        <div className="flex flex-col items-center justify-center h-64 bg-slate-950/50 rounded-lg border border-indigo-800/30 p-6">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-indigo-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7l-2 1m2-1l-2-1m2 1v2.5M14 4l-2-1-2 1M4 7l2-1M4 7l2 1M4 7v2.5M12 21l-2-1m2 1l2-1m-2 1v-2.5M6 18l-2-1v-2.5M18 18l2-1v-2.5" />
          </svg>
          <p className="text-indigo-400 font-medium mb-2">No results yet</p>
          <p className="text-gray-400 text-center">Run your code to see the results of your solution</p>
          <button 
            onClick={handleRunCode}
            className="mt-4 px-4 py-2 bg-emerald-700 hover:bg-emerald-600 text-white rounded-lg font-medium shadow transition flex items-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
            </svg>
            Run Code
          </button>
        </div>
      );
    }
  };

  return (
    <div className="min-h-screen pt-12 sm:pt-20 bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-950 text-gray-100">
      {showAcceptedAnimation && <AcceptedAnimation />}
      
      <div className="container mx-auto py-6 px-4 flex flex-col lg:flex-row gap-6"> 
        {/* Left Side: Problem Details */}
        <div className="lg:w-2/5 w-full flex flex-col rounded-xl overflow-hidden border border-indigo-800/30 bg-slate-900">
          <div className="p-4 flex gap-4 border-b border-indigo-800/50 bg-slate-900">
            <button
              onClick={() => setShowSubmission(false)}
              className={`px-4 py-2 rounded-lg font-bold transition transform ${
                !showSubmission 
                  ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/40" 
                  : "bg-slate-800 text-indigo-300 hover:bg-indigo-900"
              }`}
            >
              Description
            </button>
            <button
              onClick={() => setShowSubmission(true)}
              className={`px-4 py-2 rounded-lg font-bold transition transform ${
                showSubmission 
                  ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/40" 
                  : "bg-slate-800 text-indigo-300 hover:bg-indigo-900"
              }`}
            >
              Submission
            </button>
          </div>
    
          <div className="p-6 flex-1 h-[500px] overflow-auto">
            {problem ? (
              showSubmission ? <Submission title={problem.title} setCode={setCode} problem={problem} /> : <Problem problem={problem} />
            ) : (
              <div className="flex flex-col items-center justify-center h-full">
                <Loader />
                <p className="mt-4 text-indigo-300">Loading problem details...</p>
              </div>
            )}
          </div>
        </div>
    
        {/* Right Side: Code Editor & Test Cases */}
        <div className="lg:w-3/5 w-full flex flex-col">
          {/* Action Buttons */}
          <div className="mb-4 flex justify-between items-center bg-slate-900 rounded-xl border border-indigo-800/30 p-4">
            <div className="flex items-center">
              <h2 className="text-lg font-bold text-indigo-300 mr-4">Code Editor</h2>
              <div className="h-8 w-px bg-indigo-800/30 mx-2"></div>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={handleRunCode}
                disabled={loading || testCases.length === 0}
                className="group relative px-5 py-2.5 bg-gradient-to-b from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white rounded-md font-medium transition-all duration-200 flex items-center gap-2 disabled:opacity-70 shadow-md disabled:cursor-not-allowed"
              >
                <span className="absolute inset-0 w-full h-full rounded-md bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"></span>
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Running</span>
                  </>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 80 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                    </svg>
                    Run
                  </>
                )}
              </button>
              
              <button
                onClick={handleSubmit}
                disabled={loadingSubmission || testCases.length === 0}
                className="group relative px-5 py-2.5 bg-gradient-to-b from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white rounded-md font-medium transition-all duration-200 flex items-center gap-2 disabled:opacity-70 shadow-md disabled:cursor-not-allowed"
              >
                <span className="absolute inset-0 w-full h-full rounded-md bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"></span>
                {loadingSubmission ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Submitting</span>
                  </>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                    </svg>
                    Submit
                  </>
                )}
              </button>
            </div>
          </div>
          
          {/* Code Editor */}
          <div className="flex-1 mb-4">
            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Write your code here..."
              className="w-full h-full bg-slate-900 border border-indigo-800/30 rounded-xl p-4 text-gray-200 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600 resize-none"
            />
          </div>
          
          {/* Test Case Results */}
          <div className="bg-slate-900 rounded-xl border border-indigo-800/30 p-4">
            <h3 className="text-lg font-bold text-indigo-300 mb-4">Test Results</h3>
            
            {results.length === 0 ? (
              getNoResultsMessage()
            ) : (
              <div className="space-y-3">
                {results.map((result, index) => (
                  <div 
                    key={index} 
                    className={`p-3 rounded-lg transition-colors ${
                      result.actualOutput === result.expectedOutput 
                        ? 'bg-emerald-900/30 border border-emerald-700/50' 
                        : 'bg-rose-900/30 border border-rose-700/50'
                    }`}
                  >
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium text-indigo-300">Test Case {index + 1}</span>
                      {result.actualOutput === result.expectedOutput ? (
                        <span className="text-emerald-400 font-bold">Passed</span>
                      ) : (
                        <span className="text-rose-400 font-bold">Failed</span>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <p className="text-sm text-gray-400">Expected Output:</p>
                        <pre className="text-xs text-gray-200 bg-slate-800 p-2 rounded">{result.expectedOutput}</pre>
                      </div>
                      <div>
                        <p className="text-sm text-gray-400">Actual Output:</p>
                        <pre className="text-xs text-gray-200 bg-slate-800 p-2 rounded">{result.actualOutput}</pre>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}