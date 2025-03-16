import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'

export const Sheet = () => {
  const [loading, setLoading] = useState(true);
  const [fetchingOperation, setFetchingOperation] = useState('sheet');
  const [sheet, setSheet] = useState(null);
  const [groupNames, setGroupNames] = useState([]);
  const [problems, setProblems] = useState([]);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');
  const [notificationType, setNotificationType] = useState('success');
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [confirmationAction, setConfirmationAction] = useState(null);
  const [confirmationData, setConfirmationData] = useState(null);
  const [groupNameInput, setGroupNameInput] = useState('');
  const [showGroupNameInput, setShowGroupNameInput] = useState(false);

  const navigate = useNavigate();
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const problemsPerPage = 12;

  const user = "check";

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setFetchingOperation('sheet');
        setError(null);
        setSuccess(false);

        const queryParams = new URLSearchParams({ user }).toString();
        const sheetUrl = `${process.env.REACT_APP_BASE_URL}/sheet/check?${queryParams}`;
        const sheetResponse = await fetch(sheetUrl, { method: 'GET', headers: { 'Content-Type': 'application/json' },credentials :'include' });

        if (!sheetResponse.ok) {
          throw new Error((await sheetResponse.json()).message || "Something went wrong");
        }
        const sheetData = await sheetResponse.json();
        setSheet(sheetData.success);
        setSuccess(true);

        if (sheetData.success) {
          setFetchingOperation('groups');
          const groupsUrl = `${process.env.REACT_APP_BASE_URL}/sheet/groups?${queryParams}`;
          const groupsResponse = await fetch(groupsUrl, { method: 'GET', headers: { 'Content-Type': 'application/json' },credentials:'include' });

          if (!groupsResponse.ok) {
            throw new Error((await groupsResponse.json()).message || "Something went wrong");
          }
          const groupsData = await groupsResponse.json();
          if (groupsData.success) {
            setGroupNames(groupsData.groups);
          }
        }
      } catch (error) {
        setError(error.message || 'Something went wrong');
        showNotificationMessage('error', error.message || 'Failed to load data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const showNotificationMessage = (type, message) => {
    setNotificationType(type);
    setNotificationMessage(message);
    setShowNotification(true);
    setTimeout(() => {
      setShowNotification(false);
    }, 3000);
  };

  const handleConfirmAction = () => {
    switch (confirmationAction) {
      case 'deleteSheet':
        handleDeleteSheetConfirmed();
        break;
      case 'deleteGroup':
        handleDeleteGroupConfirmed(confirmationData);
        break;
      case 'deleteProblem':
        handleDeleteProblemConfirmed(confirmationData.id, confirmationData.title);
        break;
      default:
        break;
    }
    setShowConfirmation(false);
  };

  const initiateDeleteSheet = () => {
    setConfirmationAction('deleteSheet');
    setShowConfirmation(true);
  };

  const initiateDeleteGroup = (groupName) => {
    setConfirmationAction('deleteGroup');
    setConfirmationData(groupName);
    setShowConfirmation(true);
  };

  const initiateDeleteProblem = (problemId, problemTitle) => {
    setConfirmationAction('deleteProblem');
    setConfirmationData({ id: problemId, title: problemTitle });
    setShowConfirmation(true);
  };

  const handleDeleteGroupConfirmed = async (groupName) => {
    try {
      setLoading(true);
      setFetchingOperation('deleteGroup');
      setError(null);
      setSuccess(false);

      const response = await fetch(`${process.env.REACT_APP_BASE_URL}/sheet/group`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ groupName }),
      });

      if (!response.ok) {
        throw new Error((await response.json()).message || "Something went wrong");
      }
      const data = await response.json();
      if (data.success) {
        setGroupNames((prev) => prev.filter((group) => group !== groupName));
        if (selectedGroup === groupName) {
          setSelectedGroup(null);
          setProblems([]);
        }
        showNotificationMessage('success', `Group '${groupName}' deleted successfully`);
      }
      setSuccess(true);
    } catch (error) {
      setError(error.message || 'Something went wrong');
      showNotificationMessage('error', error.message || 'Failed to delete group');
    } finally {
      setLoading(false);
    }
  };

  const handleProblemsInGroup = async (groupName) => {
    const queryParams = new URLSearchParams({ user, groupName }).toString();
    try {
      setLoading(true);
      setFetchingOperation('problems');
      setError(null);
      setSuccess(false);
      const url = `${process.env.REACT_APP_BASE_URL}/sheet/group/problems?${queryParams}`;
      const response = await fetch(url, { method: 'GET', headers: { 'Content-Type': 'application/json' },credentials: 'include' });
      if (!response.ok) {
        throw new Error((await response.json()).message || "Something went wrong");
      }
      const data = await response.json();
      if (data.success) {
        setSelectedGroup(groupName);
        setProblems(data.problems);
        setCurrentPage(1); // Reset to first page when changing groups
      }
      setSuccess(true);
    } catch (error) {
      setError(error.message || 'Something went wrong');
      showNotificationMessage('error', error.message || 'Failed to load problems');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProblemConfirmed = async (problemId, problemTitle) => {
    const body = JSON.stringify({ user, groupName: selectedGroup, problemId });
    try {
      setLoading(true);
      setFetchingOperation('deleteProblem');
      setError(null);
      setSuccess(false);
      const response = await fetch(`${process.env.REACT_APP_BASE_URL}/sheet/group/problem`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body,
      });
      if (!response.ok) {
        throw new Error((await response.json()).message || "Something went wrong");
      }
      const data = await response.json();
      if (data.success) {
        setProblems((prev) => prev.filter((problem) => problem._id !== problemId));
        showNotificationMessage('success', `Problem '${problemTitle}' deleted successfully`);

        // Adjust current page if needed after deletion
        const remainingProblems = problems.filter(problem => problem._id !== problemId).length;
        const totalPages = Math.ceil(remainingProblems / problemsPerPage);
        if (currentPage > totalPages && totalPages > 0) {
          setCurrentPage(totalPages);
        }
      }
      setSuccess(true);
    } catch (error) {
      setError(error.message || 'Something went wrong');
      showNotificationMessage('error', error.message || 'Failed to delete problem');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSheet = async () => {
    const queryParams = new URLSearchParams({ user }).toString();
    try {
      setLoading(true);
      setFetchingOperation('createSheet');
      setError(null);
      setSuccess(false);
      const url = `${process.env.REACT_APP_BASE_URL}/sheet/check?${queryParams}`;
      const response = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' },credentials: 'include' });
      if (!response.ok) {
        throw new Error((await response.json()).message || "Something went wrong");
      }
      const data = await response.json();
      if (data.success) {
        setSheet(data.success);
        showNotificationMessage('success', 'Sheet created successfully');
      }
      setSuccess(true);
    } catch (error) {
      setError(error.message || 'Something went wrong');
      showNotificationMessage('error', error.message || 'Failed to create sheet');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSheetConfirmed = async () => {
    try {
      setLoading(true);
      setFetchingOperation('deleteSheet');
      setError(null);
      setSuccess(false);
      const url = `${process.env.REACT_APP_BASE_URL}/sheet/check`;
      const response = await fetch(url, { method: 'DELETE', headers: { 'Content-Type': 'application/json' },credentials:'include' });
      if (!response.ok) {
        throw new Error((await response.json()).message || "Something went wrong");
      }
      const data = await response.json();
      if (data.success) {
        setSheet(null);
        setGroupNames([]);
        setProblems([]);
        setSelectedGroup(null);
        showNotificationMessage('success', 'Sheet deleted successfully');
      }
      setSuccess(true);
    } catch (error) {
      setError(error.message || 'Something went wrong');
      showNotificationMessage('error', error.message || 'Failed to delete sheet');
    } finally {
      setLoading(false);
    }
  };

  const handleAddProblem = async () => {
    navigate('/problem-set');
  }

  const handleCreateGroup = async () => {
    if (!groupNameInput.trim()) {
      showNotificationMessage('error', 'Group name cannot be empty');
      return;
    }

    try {
      setLoading(true);
      setFetchingOperation('createGroup');
      setError(null);
      setSuccess(false);

      const response = await fetch(`${process.env.REACT_APP_BASE_URL}/sheet/group`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials:'include',
        body: JSON.stringify({ user, groupName: groupNameInput }),
      });

      if (!response.ok) {
        throw new Error((await response.json()).message || "Something went wrong");
      }
      const data = await response.json();
      if (data.success) {
        setGroupNames((prev) => [...prev, groupNameInput]);
        setGroupNameInput('');
        setShowGroupNameInput(false);
        showNotificationMessage('success', `Group '${groupNameInput}' created successfully`);
      }
      setSuccess(true);
    } catch (error) {
      setError(error.message || 'Something went wrong');
      showNotificationMessage('error', error.message || 'Failed to create group');
    } finally {
      setLoading(false);
    }
  };

  // Function to get the appropriate message for the loader
  const getLoaderMessage = () => {
    switch (fetchingOperation) {
      case 'sheet': return 'Loading sheet...';
      case 'groups': return 'Fetching groups...';
      case 'problems': return 'Loading problems...';
      case 'createSheet': return 'Creating sheet...';
      case 'deleteSheet': return 'Deleting sheet...';
      case 'deleteGroup': return 'Deleting group...';
      case 'deleteProblem': return 'Deleting problem...';
      case 'createGroup': return 'Creating group...';
      default: return 'Loading...';
    }
  };

  // Determine difficulty badge color
  const getDifficultyColor = (difficulty) => {
    switch (difficulty.toLowerCase()) {
      case 'easy': return 'bg-green-500';
      case 'medium': return 'bg-yellow-500';
      case 'hard': return 'bg-red-500';
      default: return 'bg-blue-500';
    }
  };

  // Pagination logic
  const indexOfLastProblem = currentPage * problemsPerPage;
  const indexOfFirstProblem = indexOfLastProblem - problemsPerPage;
  const currentProblems = problems.slice(indexOfFirstProblem, indexOfLastProblem);
  const totalPages = Math.ceil(problems.length / problemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div className='bg-gradient-to-br mt-[60px] from-slate-950 via-indigo-950 to-slate-950 min-h-screen text-white p-6'>
      {/* Header Section - Logo and Sheet Management */}
      <div className="flex flex-col items-center justify-center mb-8">
        <div className="flex justify-between items-center w-full max-w-6xl">
          <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-500">
            Problem Sheet Dashboard
          </h1>
          {sheet && (
            <button
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg shadow-md transition-all flex items-center"
              onClick={initiateDeleteSheet}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              Delete Sheet
            </button>
          )}
        </div>
      </div>

      {/* Notification */}
      {showNotification && (
        <div className={`fixed top-4 right-4 px-6 py-3 rounded-lg shadow-lg transform transition-all duration-500 ease-in-out z-50 ${notificationType === 'success' ? 'bg-green-600' : 'bg-red-600'
          }`}>
          <div className="flex items-center">
            <div className={`w-8 h-8 mr-4 rounded-full flex items-center justify-center ${notificationType === 'success' ? 'bg-green-500' : 'bg-red-500'
              }`}>
              {notificationType === 'success' ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              )}
            </div>
            <p className="text-white font-medium">{notificationMessage}</p>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {showConfirmation && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-gray-800 p-6 rounded-lg shadow-xl max-w-md w-full">
            <h3 className="text-xl font-semibold mb-4">Confirm Action</h3>
            <p className="mb-6">
              {confirmationAction === 'deleteSheet' && "Are you sure you want to delete this sheet? All groups and problems will be lost."}
              {confirmationAction === 'deleteGroup' && `Are you sure you want to delete the group "${confirmationData}"?`}
              {confirmationAction === 'deleteProblem' && `Are you sure you want to delete the problem "${confirmationData.title}"?`}
            </p>
            <div className="flex justify-end space-x-4">
              <button
                className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded"
                onClick={() => setShowConfirmation(false)}
              >
                Cancel
              </button>
              <button
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
                onClick={handleConfirmAction}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Loading Indicator */}
      {loading && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-gray-800 p-6 rounded-lg shadow-xl flex flex-col items-center">
            <div className="loader-ring mb-4">
              <div className="h-16 w-16 rounded-full border-4 border-t-indigo-500 border-r-transparent border-b-indigo-500 border-l-transparent animate-spin"></div>
            </div>
            <p className="text-indigo-300 animate-pulse">{getLoaderMessage()}</p>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-6xl mx-auto">
        {/* No Sheet State */}
        {!sheet && (
          <div className="flex flex-col items-center justify-center py-16">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-24 w-24 text-gray-500 mb-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h2 className="text-xl font-semibold mb-4 text-center">You don't have a sheet yet</h2>
            <p className="text-gray-400 mb-8 text-center max-w-md">Create a sheet to start organizing your problems into groups</p>
            <button
              className="bg-gradient-to-r from-emerald-500 to-blue-500 hover:from-emerald-600 hover:to-blue-600 text-white px-6 py-3 rounded-lg shadow-lg transition-all flex items-center"
              onClick={handleCreateSheet}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
              Create Sheet
            </button>
          </div>
        )}

        {/* Sheet Content - Two Column Layout */}
        {sheet && (
          <>
            {/* Create Group Input */}
            {showGroupNameInput ? (
              <div className="bg-gray-800 bg-opacity-70 backdrop-blur-lg rounded-xl p-6 shadow-lg mb-8 border border-indigo-900">
                <h2 className="text-xl font-semibold mb-4 text-indigo-300">Create New Group</h2>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={groupNameInput}
                    onChange={(e) => setGroupNameInput(e.target.value)}
                    placeholder="Enter group name"
                    className="flex-1 px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <button
                    onClick={handleCreateGroup}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg"
                  >
                    Create
                  </button>
                  <button
                    onClick={() => {
                      setShowGroupNameInput(false);
                      setGroupNameInput('');
                    }}
                    className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex justify-center mb-8">
                <button
                  onClick={() => setShowGroupNameInput(true)}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg shadow-md transition-all flex items-center"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                  </svg>
                  Create Group
                </button>
              </div>
            )}

            {/* Two-column layout container */}
            <div className="flex flex-col md:flex-row space-y-6 md:space-y-0 md:space-x-6">
              {/* Left Column - Groups */}
              <div className="w-full md:w-1/3">
                <div className="bg-gray-800 bg-opacity-70 backdrop-blur-lg rounded-xl p-6 shadow-lg h-full border border-indigo-900">
                  <h2 className="text-xl font-semibold mb-4 text-indigo-300">Your Groups</h2>
                  <div className="space-y-2 max-h-96 overflow-y-auto pr-2">
                    {groupNames.length > 0 ? (
                      groupNames.map((group, index) => (
                        <div key={index} className={`bg-gray-700 bg-opacity-60 border border-gray-600 rounded-lg p-3 flex justify-between items-center ${selectedGroup === group ? 'ring-2 ring-indigo-500' : ''}`}>
                          <h3 className="text-md font-medium truncate">{group}</h3>
                          <div className="flex space-x-2 shrink-0">
                            <button
                              className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-lg text-sm"
                              onClick={() => handleProblemsInGroup(group)}
                            >
                              View
                            </button>
                            <button
                              className="bg-gray-600 hover:bg-red-600 text-white p-1 rounded-lg text-sm flex items-center"
                              onClick={() => initiateDeleteGroup(group)}
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-6">
                        <p className="text-gray-400">No groups available</p>
                        <p className="text-gray-500 text-sm mt-1">Create a group to get started</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Right Column - Problems */}
              <div className="w-full md:w-2/3">
                {selectedGroup ? (
                  <div className="bg-gray-800 bg-opacity-70 backdrop-blur-lg rounded-xl p-6 shadow-lg border border-indigo-900">
                    <div className="flex justify-between items-center mb-4">
                      <h2 className="text-xl font-semibold text-indigo-300">
                        Problems in {selectedGroup}
                      </h2>
                      <button
                        onClick={() => {
                          handleAddProblem();
                        }}
                        className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg shadow-md transition-all flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                        </svg>
                        Add Problem
                      </button>
                    </div>

                    {problems.length > 0 ? (
                      <>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {currentProblems.map((problem, index) => (
                            <div key={index} className="bg-gray-700 bg-opacity-80 border border-gray-600 rounded-lg p-4 shadow-md">
                              <div className="flex justify-between">
                                <h3 className="text-lg font-semibold text-white truncate">{problem.title}</h3>
                                <span className={`${getDifficultyColor(problem.difficulty)} px-2 py-1 rounded-full text-xs font-semibold`}>
                                  {problem.difficulty}
                                </span>
                              </div>
                              <p className="text-gray-300 mt-2 text-sm line-clamp-2">{problem.description}</p>

                              <div className="flex flex-wrap gap-2 mt-3">
                                {problem.tags.slice(0, 3).map((tag, tagIndex) => (
                                  <span key={tagIndex} className="bg-indigo-900 bg-opacity-60 text-indigo-200 px-2 py-1 rounded-full text-xs">
                                    {tag}
                                  </span>
                                ))}
                                {problem.tags.length > 3 && (
                                  <span className="bg-indigo-900 bg-opacity-60 text-indigo-200 px-2 py-1 rounded-full text-xs">
                                    +{problem.tags.length - 3}
                                  </span>
                                )}
                              </div>

                              <div className="flex justify-between mt-4">
                                <button className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-lg text-xs shadow-md transition-all"
                                 onClick={() => navigate(`/problem-practice/${problem.title}`)}>
                                >
                                  View Details
                                </button>
                                <button
                                  className="bg-gray-600 hover:bg-red-600 text-white p-1 rounded-lg text-xs flex items-center transition-colors"
                                  onClick={() => initiateDeleteProblem(problem._id, problem.title)}
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                                  </svg>
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                          <div className="flex justify-center mt-6">
                            <div className="flex space-x-1">
                              <button
                                onClick={() => paginate(Math.max(1, currentPage - 1))}
                                disabled={currentPage === 1}
                                className={`px-3 py-1 rounded-md ${currentPage === 1
                                    ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                                    : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                                  }`}
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                  <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                              </button>

                              {[...Array(totalPages)].map((_, i) => (
                                <button
                                  key={i}
                                  onClick={() => paginate(i + 1)}
                                  className={`px-3 py-1 rounded-md ${currentPage === i + 1
                                      ? 'bg-indigo-700 text-white'
                                      : 'bg-gray-700 hover:bg-gray-600 text-white'
                                    }`}
                                >
                                  {i + 1}
                                </button>
                              ))}

                              <button
                                onClick={() => paginate(Math.min(totalPages, currentPage + 1))}
                                disabled={currentPage === totalPages}
                                className={`px-3 py-1 rounded-md ${currentPage === totalPages
                                    ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                                    : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                                  }`}
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                                </svg>
                              </button>
                            </div>
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="text-center py-12 bg-gray-700 bg-opacity-30 rounded-lg border border-gray-600">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                        <p className="text-gray-300 mb-2">No problems in this group yet</p>
                        <p className="text-gray-400 text-sm">Click "Add Problem" to get started</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="bg-gray-800 bg-opacity-70 backdrop-blur-lg rounded-xl p-6 shadow-lg h-full flex flex-col items-center justify-center border border-indigo-900">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
                    </svg>
                    <h2 className="text-xl font-semibold mb-2 text-center">Select a group</h2>
                    <p className="text-gray-400 text-center max-w-md">Choose a group from the left panel to view its problems</p>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Footer */}
      <footer className="mt-16 text-center text-gray-500">
        <p>&copy; {new Date().getFullYear()} Problem Sheet Manager. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default Sheet;