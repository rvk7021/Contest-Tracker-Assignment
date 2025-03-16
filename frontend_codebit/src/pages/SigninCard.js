import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setUser, setLoading } from '../components/Redux/Slices/ProfileSlice';
import { useSelector } from 'react-redux';

export default function SigninCard() {
  const { user } = useSelector((state) => state.profile);
  const navigate = useNavigate();
  
  // Redirect if user is already logged in
  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState(null);
  // const [isHovered, setIsHovered] = useState(false);

  const dispatch = useDispatch();

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      dispatch(setLoading(true));

      const response = await fetch(`${process.env.REACT_APP_BASE_URL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Ensure cookies are included
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      console.log(data);

      if (!data.success) {
        setError(data.message);
        dispatch(setLoading(false));
        return;
      }

      // ✅ Store token in cookies manually (if not automatically set)
      document.cookie = `token=${data.token}; path=/; max-age=86400`; // 1 day expiry

      // Fetch user details
      const res = await fetch(`${process.env.REACT_APP_BASE_URL}/getuser`, {
        method: "GET",
        credentials: "include", // Ensure cookies are sent
        headers: {
          "Content-Type": "application/json",
        },
      });

      const resData = await res.json();
      if (resData.success) {
        console.log(resData.user);
        dispatch(setUser(resData.user));
        dispatch(setLoading(false));
        setError(null);
        navigate('/');
      } else {
        dispatch(setLoading(false));
        setError(resData.message);
      }

    } catch (error) {
      setError(error.message);
    }

    dispatch(setLoading(false));
};


  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-purple-950 to-indigo-950 flex items-center justify-center p-4">
      <div
        className="w-full max-w-md bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 
        shadow-2xl overflow-hidden relative"
      >
        {/* Home Button */}
        <button
          onClick={() => navigate('/')}
          className="absolute top-4 left-4 group"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-8 w-8 text-white/70 group-hover:text-white transition-colors"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
            />
          </svg>
        </button>

        {/* CodeBit Logo and Title */}
        <div className="px-8 pt-8 pb-4 text-center">
          <div className="flex items-center justify-center mb-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-12 w-12 text-indigo-400 mr-3"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
              />
            </svg>
            <h1 className="text-4xl font-bold bg-clip-text text-transparent 
            bg-gradient-to-r from-indigo-400 to-purple-500">
              CodeBit
            </h1>
          </div>
          <p className="text-white/70 text-sm">Sign in to your CodeBit account</p>
        </div>

        {/* Signin Form */}
        <form
          onSubmit={handleSubmit}
          className="px-8 pb-8 space-y-4"
        >
          <div className="relative group">
            <input
              required
              type="email"
              id="email"
              name="email"
              value={formData.email}
              placeholder="E-mail"
              onChange={handleChange}
              className="w-full bg-white/10 backdrop-blur-sm text-white 
              py-3 px-4 rounded-xl border border-white/20
              focus:outline-none focus:ring-2 focus:ring-indigo-500 
              transition-all duration-300 
              placeholder-white/50"
            />
            <div className="absolute inset-x-0 bottom-0 h-0.5 bg-indigo-500 
            scale-x-0 group-focus-within:scale-x-100 transition-transform duration-300"></div>
          </div>

          <div className="relative group">
            <input
              required
              type="password"
              id="password"
              name="password"
              value={formData.password}
              placeholder="Password"
              onChange={handleChange}
              className="w-full bg-white/10 backdrop-blur-sm text-white 
              py-3 px-4 rounded-xl border border-white/20
              focus:outline-none focus:ring-2 focus:ring-indigo-500 
              transition-all duration-300 
              placeholder-white/50"
            />
            <div className="absolute inset-x-0 bottom-0 h-0.5 bg-indigo-500 
            scale-x-0 group-focus-within:scale-x-100 transition-transform duration-300"></div>
          </div>

          <button
            type="submit"
            className="w-full font-bold bg-gradient-to-r from-indigo-600 to-purple-600 
            text-white py-3.5 rounded-xl shadow-xl transition-all duration-300 
            hover:scale-[1.02] hover:shadow-2xl group relative overflow-hidden"
          >
            <span className="relative z-10">Sign In</span>
          </button>

          {error && (
            <p className="text-red-400 text-center bg-red-950/50 
            py-2 rounded-lg border border-red-900/50">
              {error}
            </p>
          )}
        </form>

        {/* Sign Up Link */}
        <div className="px-8 pb-8 text-center">
          <p className="text-white/70 text-sm">
            Don't have an account?{' '}
            <Link
              to="/sign-up"
              className="text-indigo-400 font-semibold hover:text-purple-400 
              transition-colors duration-300"
            >
              Sign Up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}