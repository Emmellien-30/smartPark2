import React from 'react';
import Sidebar from './Sidebar';

const Layout = ({ children, title, subtitle }) => (
  <div className="flex min-h-screen bg-gray-50">
    <Sidebar />
    <div className="flex-1 flex flex-col min-w-0">
      <header className="bg-white border-b border-gray-200 px-6 py-4 lg:pl-6 pl-16 sticky top-0 z-30">
        <h1 className="text-xl font-bold text-gray-800">{title}</h1>
        {subtitle && <p className="text-sm text-gray-500 mt-0.5">{subtitle}</p>}
      </header>
      <main className="flex-1 p-6">{children}</main>
    </div>
  </div>
);
export default Layout;
