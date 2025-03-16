import './App.css';
import React, { useEffect } from 'react';
import SignupCard from './pages/SignupCard';
import SigninCard from './pages/SigninCard';
import Home from './pages/Home';
import ProtectedRoute from './components/ProtectedRoute';
import { Routes, Route } from 'react-router-dom';
import CodeRunner from './pages/Editor';
import ProblemPractice from './pages/ProblemPractice';
import Layout from './components/Layout';
import ProblemSet from './pages/ProblemSet';
import Post from './pages/Post';
import Profile from './pages/Profile';
import Contest from './pages/contest';
import { Sheet } from './components/Sheet';
import { useDispatch } from 'react-redux';
import { setUser } from './components/Redux/Slices/ProfileSlice';
import PageNotFound from './pages/pagenotfound';
function App() {
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch(`${process.env.REACT_APP_BASE_URL}/getuser`, {
          method: "GET",
          credentials: "include",
        });

        const data = await response.json();
        if (data.success) {
         
          console.log("Valid User");
          
          dispatch(setUser(data.user));
        }
      } catch (error) {
        console.error("Error fetching user:", error);
      }
    };

    fetchUser();
  }, [dispatch]);

  return (
    <Routes>
      {/* Wrap all pages inside Layout (so Navbar is always there) */}
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="editor" element={<CodeRunner />} />
        <Route path="problem-practice/:title" element={<ProblemPractice />} />
        <Route path='contest' element={<ProtectedRoute><Contest />  </ProtectedRoute>} />
        <Route path='profile' element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path='/problem-set' element={<ProblemSet />} />
        <Route path='/sheet' element={<Sheet />} />
        <Route path='posts' element={<ProtectedRoute><Post /></ProtectedRoute>}></Route>
      </Route>
      <Route path='/sign-in' element={<SigninCard />} />
      <Route path='/sign-up' element={<SignupCard />} />
      <Route path='*' element={<PageNotFound />} />
    </Routes>
  );
}
export default App;