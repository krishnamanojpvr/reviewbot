import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuth from '../Hooks/useAuth';

const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const { isLoggedIn, username, logout } = useAuth();
  const navigate = useNavigate();
  const dropdownRef = useRef(null);
  const mobileMenuRef = useRef(null);

  const handleLogout = () => {
    logout();
    navigate('/login');
    setUserDropdownOpen(false);
    setMobileMenuOpen(false);
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
    if (!mobileMenuOpen) {
      setUserDropdownOpen(false);
      document.body.classList.add('mobile-menu-open');
    } else {
      document.body.classList.remove('mobile-menu-open');
    }
  };

  const toggleUserDropdown = () => {
    setUserDropdownOpen(!userDropdownOpen);
    if (!userDropdownOpen) {
      setMobileMenuOpen(false);
      document.body.classList.remove('mobile-menu-open');
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setUserDropdownOpen(false);
      }
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target)) {
        setMobileMenuOpen(false);
        document.body.classList.remove('mobile-menu-open');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <nav className="bg-gradient-to-r from-gray-900 to-gray-800 text-white p-2 shadow-xl sticky top-0 z-50 transition duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <Link
              to="/"
              className="text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-200 to-indigo-200 text-2xl font-extrabold flex items-center drop-shadow-lg hover:scale-105 transition"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-8 w-8 mr-2 text-fuchsia-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
              ReviewBot
            </Link>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-center space-x-4">
              {!isLoggedIn ? (
                <>
                  <Link
                    to="/"
                    className="text-fuchsia-100 hover:bg-fuchsia-800/40 px-4 py-2 rounded-xl text-base font-semibold transition-all duration-300 shadow focus:outline-none focus:ring-2 focus:ring-fuchsia-600"
                  >
                    Home
                  </Link>
                  <Link
                    to="/login"
                    className="text-fuchsia-100 hover:bg-fuchsia-800/40 px-4 py-2 rounded-xl text-base font-semibold transition-all duration-300 shadow focus:outline-none focus:ring-2 focus:ring-fuchsia-600"
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="text-fuchsia-100 hover:bg-fuchsia-800/40 px-4 py-2 rounded-xl text-base font-semibold transition-all duration-300 shadow focus:outline-none focus:ring-2 focus:ring-fuchsia-600"
                  >
                    Register
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    to="/dashboard"
                    className="text-fuchsia-100 hover:bg-fuchsia-800/40 px-4 py-2 rounded-xl text-base font-semibold transition-all duration-300 shadow focus:outline-none focus:ring-2 focus:ring-fuchsia-600"
                  >
                    Dashboard
                  </Link>
                  <div className="relative group" ref={dropdownRef}>
                    <button
                      onClick={toggleUserDropdown}
                      className="flex items-center space-x-2 text-fuchsia-100 hover:bg-fuchsia-800/40 px-4 py-2 rounded-xl text-base font-semibold transition-all duration-300 shadow focus:outline-none focus:ring-2 focus:ring-fuchsia-600"
                      type="button"
                    >
                      <span>{username}</span>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>
                    {userDropdownOpen && (
                      <div className="absolute right-0 mt-2 w-48 bg-gray-800 rounded-md shadow-lg py-1 z-50 border border-gray-700">
                        <button
                          onClick={handleLogout}
                          className="block w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-gray-700 cursor-pointer"
                        >
                          Logout
                        </button>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center" ref={mobileMenuRef}>
            <button
              type="button"
              onClick={toggleMobileMenu}
              className="text-fuchsia-200 hover:text-fuchsia-400 focus:outline-none transition"
            >
              <svg
                className="h-7 w-7"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {!isLoggedIn ? (
              <>
                <Link
                  to="/"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-fuchsia-100 hover:bg-fuchsia-800/40 block px-3 py-2 rounded-md text-base font-medium"
                >
                  Home
                </Link>
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-fuchsia-100 hover:bg-fuchsia-800/40 block px-3 py-2 rounded-md text-base font-medium"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-fuchsia-100 hover:bg-fuchsia-800/40 block px-3 py-2 rounded-md text-base font-medium"
                >
                  Register
                </Link>
              </>
            ) : (
              <>
                <Link
                  to="/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-fuchsia-100 hover:bg-fuchsia-800/40 block px-3 py-2 rounded-md text-base font-medium"
                >
                  Dashboard
                </Link>
                <div className="pt-4 pb-3 border-t border-gray-700">
                  <div className="flex items-center px-5">
                    <div className="text-base font-medium text-fuchsia-200">
                      {username}
                    </div>
                  </div>
                  <div className="mt-3 px-2 space-y-1">
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-3 py-2 text-base font-medium text-red-400 hover:text-white hover:bg-gray-700 rounded-md cursor-pointer"
                    >
                      Logout
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;