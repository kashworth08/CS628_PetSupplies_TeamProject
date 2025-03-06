import React, { useContext } from "react";
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
import { AuthProvider } from "./context/AuthContext";
import AuthContext from "./context/AuthContext";
import { ProtectedRoute, AdminRoute } from "./components/ProtectedRoute";
import "./App.css"; // Import your CSS file

// Navigation component with conditional rendering based on auth state
const Navigation = () => {
  const { isAuthenticated, isAdmin, logout, user } = useContext(AuthContext);

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
          <li>
            <NavLink
              className={({ isActive }) => (isActive ? "active-link" : "")}
              to="/profile"
            >
              Profile
            </NavLink>
          </li>
        )}
        {isAuthenticated && isAdmin() && (
          <li>
            <NavLink
              className={({ isActive }) =>
                isActive ? "active-link admin-link" : "admin-link"
              }
              to="/admin"
            >
              Admin Dashboard
            </NavLink>
          </li>
        )}
      </ul>

      {/* Login/Register/User info on the right */}
      <div className="auth-section">
        {isAuthenticated ? (
          <div className="nav-user">
            <span>Welcome, {user?.username}</span>
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

              {/* Protected routes */}
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                }
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
