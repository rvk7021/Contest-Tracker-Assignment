import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { setLogout } from './Redux/Slices/ProfileSlice';
import {persistor} from '../components/Redux/Store';
const Navbar = () => {
  const { user } = useSelector(state => state.profile);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_BASE_URL}/logout`, {
        method: "POST",
        credentials: "include"
      });
      const data = await response.json();
      dispatch(setLogout());
persistor.purge();
      navigate('/sign-in');
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const closeMenu = () => {
    setIsOpen(false);
  };

  const handleNavigation = (path) => {
    closeMenu();
    navigate(path);
  };

  return (
    <>
      {/* Main Navigation */}
      <nav className="bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-950 text-white py-4 px-6 shadow-lg fixed w-full z-20">
        <div className="container mx-auto flex justify-between items-center">
          {/* Logo */}
          <Link to="/" className="text-xl font-bold tracking-wider flex items-center">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">CodeBit</span>
          </Link>

          {/* Mobile menu button */}
          <div className="sm:hidden">
            <button
              onClick={toggleMenu}
              className="text-white focus:outline-none"
              aria-label="Toggle menu"
            >
              {isOpen ? (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden sm:flex space-x-6 items-center">
            <Link to="/" className="hover:text-indigo-300 transition-colors duration-200">Home</Link>
            <Link to="/editor" className="hover:text-indigo-300 transition-colors duration-200">Compiler</Link>
            <Link to="/contest" className="hover:text-indigo-300 transition-colors duration-200">Contests</Link>
            <Link to="/problem-set" className="hover:text-indigo-300 transition-colors duration-200">Problems</Link>
            <Link to="/posts" className="hover:text-indigo-300 transition-colors duration-200">Posts</Link>
            <Link to="/profile" className="hover:text-indigo-300 transition-colors duration-200">Profile</Link>

            {user != null ? (
              <button
                onClick={handleLogout}
                className="bg-gradient-to-r from-red-500 to-red-600 text-white px-4 py-2 rounded-md shadow-md hover:shadow-lg transition-all duration-200 transform hover:-translate-y-1"
              >
                Logout
              </button>
            ) : (
              <div className="flex space-x-4">
                <button
                  onClick={() => navigate('/sign-in')}
                  className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-4 py-2 rounded-md shadow-md hover:shadow-lg transition-all duration-200 transform hover:-translate-y-1"
                >
                  Login
                </button>
                <button
                  onClick={() => navigate('/sign-up')}
                  className="bg-indigo-950 border border-indigo-500 text-white px-4 py-2 rounded-md shadow-md hover:shadow-lg transition-all duration-200 transform hover:-translate-y-1"
                >
                  Sign Up
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Fullscreen Mobile Navigation */}
      <div className={`fixed inset-0 bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-950 z-10 transform ${isOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out sm:hidden`}>
        <div className="flex flex-col h-full justify-center items-center">
          <div className="flex flex-col space-y-8 text-center">
            <Link to="/" className="text-white text-2xl font-semibold hover:text-indigo-300 transition-colors duration-200" onClick={closeMenu}>Home</Link>
            <Link to="/editor" className="text-white text-2xl font-semibold hover:text-indigo-300 transition-colors duration-200" onClick={closeMenu}>Practice</Link>
            <Link to="/contest" className="text-white text-2xl font-semibold hover:text-indigo-300 transition-colors duration-200" onClick={closeMenu}>Contests</Link>
            <Link to="/problem-set" className="text-white text-2xl font-semibold hover:text-indigo-300 transition-colors duration-200" onClick={closeMenu}>Problems</Link>
            <Link to="/posts" className="text-white text-2xl font-semibold hover:text-indigo-300 transition-colors duration-200" onClick={closeMenu}>Posts</Link>
            <Link to="/profile" className="text-white text-2xl font-semibold hover:text-indigo-300 transition-colors duration-200" onClick={closeMenu}>Profile</Link>

            {user != null ? (
              <button
                onClick={() => {
                  handleLogout();
                  closeMenu();
                }}
                className="bg-gradient-to-r from-red-500 to-red-600 text-white px-6 py-3 rounded-md text-xl font-semibold mx-auto"
              >
                Logout
              </button>
            ) : (
              <div className="flex flex-col space-y-4 items-center">
                <button
                  onClick={() => handleNavigation('/sign-in')}
                  className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-6 py-3 rounded-md text-xl font-semibold"
                >
                  Login
                </button>
                <button
                  onClick={() => handleNavigation('/sign-up')}
                  className="bg-indigo-950 border border-indigo-500 text-white px-6 py-3 rounded-md text-xl font-semibold"
                >
                  Sign Up
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Navbar;