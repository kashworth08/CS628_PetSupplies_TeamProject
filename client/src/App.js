import React, { useContext, useState, useRef, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  NavLink,
} from "react-router-dom";
import Home from "./components/Home";
import About from "./components/About";
import Contact from "./components/Contact";
import Products from "./components/Products";
import Profile from "./components/Profile";
import Register from "./components/Register";
import Login from "./components/Login";
import Guest from "./components/Guest";
import AdminDashboard from "./components/AdminDashboard";
import Unauthorized from "./components/Unauthorized";
import Cart from "./components/Cart";
import Checkout from "./components/Checkout";
import OrderConfirmation from "./components/OrderConfirmation";
import TestAuth from "./components/TestAuth"; // Import the TestAuth component
import { AuthProvider } from "./context/AuthContext";
import AuthContext from "./context/AuthContext";
import ProtectedRoutes from "./components/ProtectedRoute";
import "./App.css"; // Import your CSS file

// Destructure the ProtectedRoutes object
const { ProtectedRoute, AdminRoute } = ProtectedRoutes;

// Navigation component with conditional rendering based on auth state
const Navigation = () => {
  const { isAuthenticated, isAdmin, logout, user } = useContext(AuthContext);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  const toggleDropdown = () => {
    setShowDropdown(!showDropdown);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <nav>
      {/* Navigation items on the left */}
      <ul>
        <li>
          <NavLink
            className={({ isActive }) => (isActive ? "active-link" : "")}
            to="/"
          >
            Home
          </NavLink>
        </li>
        <li>
          <NavLink
            className={({ isActive }) => (isActive ? "active-link" : "")}
            to="/products"
          >
            Products
          </NavLink>
        </li>
        <li>
          <NavLink
            className={({ isActive }) => (isActive ? "active-link" : "")}
            to="/about"
          >
            About
          </NavLink>
        </li>
        <li>
          <NavLink
            className={({ isActive }) => (isActive ? "active-link" : "")}
            to="/contact"
          >
            Contact
          </NavLink>
        </li>
        {/* Commenting out the test-auth link */}
        {/* <li>
          <Link to="/test-auth">Test Auth</Link>
        </li> */}
        {!isAuthenticated && (
          <li>
            <NavLink
              className={({ isActive }) => (isActive ? "active-link" : "")}
              to="/guest"
            >
              Guest
            </NavLink>
          </li>
        )}
        {isAuthenticated && (
          <>
            <li>
              <NavLink
                className={({ isActive }) => (isActive ? "active-link" : "")}
                to="/profile"
              >
                Profile
              </NavLink>
            </li>
            <li>
              <NavLink
                className={({ isActive }) => (isActive ? "active-link" : "")}
                to="/cart"
              >
                Cart
              </NavLink>
            </li>
          </>
        )}
      </ul>

      {/* Login/Register/User info on the right */}
      <div className="auth-section">
        {isAuthenticated ? (
          <div className="nav-user">
            {isAdmin() ? (
              <div className="user-dropdown" ref={dropdownRef}>
                <span onClick={toggleDropdown} className="dropdown-trigger">
                  Welcome, {user?.username} <small>(Admin)</small> ▼
                </span>
                {showDropdown && (
                  <div className="dropdown-menu">
                    <Link to="/admin" className="dropdown-item admin-link">
                      Admin Dashboard
                    </Link>
                    <Link to="/profile" className="dropdown-item">
                      My Profile
                    </Link>
                  </div>
                )}
              </div>
            ) : (
              <span>Welcome, {user?.username}</span>
            )}
            <button onClick={logout} className="logout-button">
              Logout
            </button>
          </div>
        ) : (
          <div className="auth-buttons">
            <Link to="/login" className="login-button">
              Log in
            </Link>
            <Link to="/register" className="register-button">
              Register
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <div className="nav-container">
            <Navigation />
          </div>

          <div className="content-container">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/products" element={<Products />} />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/guest" element={<Guest />} />
              <Route path="/unauthorized" element={<Unauthorized />} />
              <Route path="/test-auth" element={<TestAuth />} />
              
              {/* Protected routes */}
              <Route 
                path="/profile" 
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                } 
              />
              
              <Route 
                path="/cart" 
                element={<Cart />} 
              />
              
              <Route 
                path="/checkout" 
                element={<Checkout />} 
              />
              
              <Route 
                path="/order-confirmation" 
                element={<OrderConfirmation />} 
              />
              
              {/* Admin routes */}
              <Route 
                path="/admin" 
                element={
                  <AdminRoute>
                    <AdminDashboard />
                  </AdminRoute>
                } 
              />
              
              <Route path="*" element={<h1>Page Not Found</h1>} />
            </Routes>
          </div>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
