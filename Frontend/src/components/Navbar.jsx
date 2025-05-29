import { useContext, useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { ThemeContext } from "../ThemeProvider";
import { Bars3Icon, XMarkIcon, SunIcon, MoonIcon } from "@heroicons/react/24/outline";

function Navbar() {
  const { theme, toggleTheme } = useContext(ThemeContext);
  const [isOpen, setIsOpen] = useState(false);
  const [isHoveringTheme, setIsHoveringTheme] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const isAuthenticated = !!localStorage.getItem('token');

  const navLinks = [
    { name: "Home", to: "/" },
    { name: "Widgets", to: "/widgets" },
    { name: "Dashboard", to: "/dashboard" },
    { name: "About", to: "/about" },
    { name: "Blog", to: "/blog" },
  ];

  const isActive = (path) => location.pathname === path;
  const toggleMenu = () => setIsOpen(!isOpen);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
    setIsOpen(false);
  };

  return (
    <nav className="bg-white dark:bg-text-black text-text-black dark:text-text-white sticky top-0 z-50 shadow-sm border-b border-gray-200 dark:border-gray-700 backdrop-blur-md bg-opacity-90 dark:bg-opacity-90">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex justify-between items-center">
        <NavLink to="/" className="text-sm font-bold text-primary-gradient-start">
          MyApp
        </NavLink>

        <div className="hidden md:flex items-center gap-4">
          {navLinks.map((link) => (
            <NavLink
              key={link.name}
              to={link.to}
              className={({ isActive }) =>
                `text-xs sm:text-sm md:text-base px-3 py-2 rounded-md transition-colors duration-200 ${
                  isActive
                    ? "text-accent-orange font-semibold"
                    : "text-text-black dark:text-text-white hover:text-accent-orange"
                }`
              }
            >
              {link.name}
            </NavLink>
          ))}

          {isAuthenticated ? (
            <button
              onClick={handleLogout}
              className="bg-button-yellow text-black text-xs sm:text-sm md:text-base font-medium px-4 py-2 rounded-md hover:opacity-90 transition-shadow shadow hover:shadow-md"
            >
              Logout
            </button>
          ) : (
            <>
              <NavLink
                to="/login"
                className="text-text-black dark:text-text-white text-xs sm:text-sm md:text-base px-3 py-2 rounded-md hover:text-accent-orange"
              >
                Login
              </NavLink>
              <NavLink
                to="/signup"
                className="bg-button-yellow text-black text-xs sm:text-sm md:text-base font-medium px-4 py-2 rounded-md hover:opacity-90 transition-shadow shadow hover:shadow-md"
              >
                Sign Up
              </NavLink>
            </>
          )}

          <button
            onClick={toggleTheme}
            onMouseEnter={() => setIsHoveringTheme(true)}
            onMouseLeave={() => setIsHoveringTheme(false)}
            className="flex items-center justify-center w-9 h-9 rounded-md bg-accent-cyan hover:bg-accent-orange transition-colors"
            aria-label="Toggle theme"
          >
            {theme === "light" ? (
              <SunIcon className="w-5 h-5 text-white" />
            ) : (
              <MoonIcon className="w-5 h-5 text-white" />
            )}
          </button>
        </div>

        <button
          onClick={toggleMenu}
          className="md:hidden p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition"
          aria-label={isOpen ? "Close menu" : "Open menu"}
        >
          {isOpen ? (
            <XMarkIcon className="w-6 h-6" />
          ) : (
            <Bars3Icon className="w-6 h-6" />
          )}
        </button>
      </div>

      {isOpen && (
        <div className="md:hidden border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-text-black">
          <div className="flex flex-col gap-1 px-4 py-3">
            {navLinks.map((link) => (
              <NavLink
                key={link.name}
                to={link.to}
                onClick={() => setIsOpen(false)}
                className={({ isActive }) =>
                  `block px-3 py-2 rounded-md text-xs sm:text-sm md:text-base transition ${
                    isActive
                      ? "text-accent-orange font-semibold"
                      : "text-text-black dark:text-text-white hover:text-accent-orange"
                  }`
                }
              >
                {link.name}
              </NavLink>
            ))}

            {isAuthenticated ? (
              <button
                onClick={handleLogout}
                className="block w-full text-center bg-button-yellow text-black text-xs sm:text-sm md:text-base font-medium px-4 py-2 rounded-md hover:opacity-90"
              >
                Logout
              </button>
            ) : (
              <>
                <NavLink
                  to="/login"
                  onClick={() => setIsOpen(false)}
                  className="block px-3 py-2 text-xs sm:text-sm md:text-base text-text-black dark:text-text-white hover:text-accent-orange"
                >
                  Login
                </NavLink>
                <NavLink
                  to="/signup"
                  onClick={() => setIsOpen(false)}
                  className="block w-full text-center bg-button-yellow text-black text-xs sm:text-sm md:text-base font-medium px-4 py-2 rounded-md hover:opacity-90"
                >
                  Sign Up
                </NavLink>
              </>
            )}

            <button
              onClick={() => {
                toggleTheme();
                setIsOpen(false);
              }}
              className="w-full flex items-center justify-center gap-2 mt-2 px-4 py-2 text-xs sm:text-sm md:text-base rounded-md bg-accent-cyan hover:bg-accent-orange transition text-white"
              aria-label="Toggle theme"
            >
              {theme === "light" ? (
                <>
                  <MoonIcon className="w-5 h-5" />
                  <span>Dark Mode</span>
                </>
              ) : (
                <>
                  <SunIcon className="w-5 h-5" />
                  <span>Light Mode</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}

export default Navbar;