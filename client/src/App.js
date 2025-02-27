import React, { useContext } from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import Home from "./components/Home";
import About from "./components/About";
import Contact from "./components/Contact";
import Products from "./components/Products";
import Profile from "./components/Profile";
import Register from './components/Register';
import Login from './components/Login';
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
      {isAuthenticated ? (
        <div className="nav-user">
          <span>Welcome, {user?.username}</span>
          <button onClick={logout} className="nav-button logout-button">Logout</button>
        </div>
      ) : (
        <Link to="/login" className="nav-button login-button">Log in</Link>
      )}

      <ul>
        <li>
          <Link to="/">Home</Link>
        </li>
        <li>
          <Link to="/products">Products</Link>
        </li>
        <li>
          <Link to="/about">About</Link>
        </li>
        <li>
          <Link to="/contact">Contact</Link>
        </li>
        {!isAuthenticated && (
          <li>
            <Link to="/register">Register</Link>
          </li>
        )}
        {!isAuthenticated && (
          <li>
            <Link to="/guest">Guest</Link>
          </li>
        )}
        {isAuthenticated && (
          <li>
            <Link to="/profile">Profile</Link>
          </li>
        )}
        {isAuthenticated && isAdmin() && (
          <li>
            <Link to="/admin" className="admin-link">Admin Dashboard</Link>
          </li>
        )}
      </ul>
    </nav>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Navigation />

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
      </Router>
    </AuthProvider>
  );
}

export default App;