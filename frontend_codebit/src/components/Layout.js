import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';

export default function Layout() {
  return (
    <div className="h-screen flex flex-col">
      <Navbar /> 
      <div className="flex-1 overflow-auto">
        <Outlet />
      </div>
    </div>
  );
}
