import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Layout = ({ children }) => {
  const location = useLocation();
  
  const navItems = [
    { path: '/', label: 'Dashboard', icon: '📊', gradient: 'from-blue-500 to-cyan-500' },
    { path: '/add-word', label: 'Add Word', icon: '✨', gradient: 'from-purple-500 to-pink-500' },
    { path: '/vocabulary', label: 'Vocabulary', icon: '📚', gradient: 'from-green-500 to-emerald-500' },
    { path: '/quiz', label: 'Quiz', icon: '🎯', gradient: 'from-orange-500 to-red-500' }
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-md shadow-lg border-b border-white/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-3 group">
              <div className="text-4xl transform group-hover:scale-110 transition-transform duration-300 animate-float">
                📖
              </div>
              <div className="flex flex-col">
                <span className="text-2xl font-bold gradient-text">GRE Vocab</span>
                <span className="text-xs text-gray-500 font-medium">Master Your Vocabulary</span>
              </div>
            </Link>

            {/* Navigation Links */}
            <div className="hidden md:flex space-x-2">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`group relative px-5 py-2.5 rounded-xl font-semibold transition-all duration-300 flex items-center space-x-2 ${
                    isActive(item.path)
                      ? `bg-gradient-to-r ${item.gradient} text-white shadow-lg scale-105`
                      : 'text-gray-700 hover:bg-gray-100/80 hover:scale-105'
                  }`}
                >
                  <span className="text-xl">{item.icon}</span>
                  <span className="text-sm">{item.label}</span>
                  {isActive(item.path) && (
                    <div className="absolute inset-0 bg-white/20 rounded-xl animate-pulse-soft"></div>
                  )}
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden border-t border-gray-200/50 bg-white/50 backdrop-blur-sm">
          <div className="grid grid-cols-4 gap-2 p-3">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex flex-col items-center justify-center py-3 rounded-xl transition-all duration-300 ${
                  isActive(item.path)
                    ? `bg-gradient-to-br ${item.gradient} text-white shadow-lg scale-105`
                    : 'text-gray-600 hover:bg-gray-100/80'
                }`}
              >
                <span className="text-2xl mb-1">{item.icon}</span>
                <span className="text-xs font-semibold">{item.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-fadeIn">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-white/60 backdrop-blur-md border-t border-white/50 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col items-center space-y-3">
            <p className="text-center text-gray-700 font-medium">
              💪 Build your GRE vocabulary daily • 🎯 Practice makes perfect
            </p>
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <span>Made with</span>
              <span className="text-red-500 animate-pulse">❤️</span>
              <span>for GRE Success</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;

