import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";

export default function Submission({ title, setCode }) {
  const { user } = useSelector((state) => state.profile);
  const [submissions, setSubmissions] = useState([]);
  const [visibleSubmissions, setVisibleSubmissions] = useState(4); // Show 4 submissions initially

  useEffect(() => {
    const fetchSubmissions = async () => {
      try {
        const response = await fetch(
          `${process.env.REACT_APP_BASE_URL}/submissions?title=${title}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            credentials: 'include',
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch submissions");
        }

        const data = await response.json();
        setSubmissions(data.submissions);
      } catch (error) {
        console.error("Error fetching submissions:", error);
      }
    };

    if (user) {
      fetchSubmissions();
    }
  }, [user, title]);

  const handleLoadMore = () => {
    setVisibleSubmissions((prev) => prev + 4); // Increase visible submissions by 4
  };

  return (
    <div className="p-6 text-white">
      <h2 className="text-2xl font-bold mb-4">My Submissions</h2>

      {submissions.length === 0 ? (
        <p className="text-gray-400">No submissions found.</p>
      ) : (
        <div className="space-y-4">
          {submissions.slice(0, visibleSubmissions).map((submission) => (
            <div
              key={submission._id}
              className="p-4 bg-slate-900 rounded-lg shadow-md border border-slate-800"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">
                    Status:{" "}
                    <span
                      className={`font-semibold ${
                        submission.status === "Accepted"
                          ? "text-green-400"
                          : "text-red-400"
                      }`}
                    >
                      {submission.status}
                    </span>
                  </p>
                  <p className="text-sm text-gray-400">
                    Submitted At:{" "}
                    <span className="font-semibold text-gray-300">
                      {new Date(submission.submittedAt).toLocaleString()}
                    </span>
                  </p>
                </div>
                <button
                  onClick={() => setCode(submission.code)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition-colors text-sm sm:text-base"
                >
                  Load Code
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Load More Button */}
      {submissions.length > visibleSubmissions && (
        <div className="flex justify-center mt-6">
          <button
            onClick={handleLoadMore}
            className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-700 transition-colors text-base"
          >
            Load More
          </button>
        </div>
      )}
    </div>
  );
}