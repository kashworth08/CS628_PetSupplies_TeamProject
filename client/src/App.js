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

  return (
    <nav>
      {/* Navigation items on the left */}
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
        {/* Commenting out the test-auth link */}
        {/* <li>
          <Link to="/test-auth">Test Auth</Link>
        </li> */}
        {!isAuthenticated && (
          <li>
            <Link to="/guest">Guest</Link>
          </li>
        )}
        {isAuthenticated && (
          <>
            <li>
              <Link to="/profile">Profile</Link>
            </li>
            <li>
              <Link to="/cart">Cart</Link>
            </li>
          </>
        )}
        {isAuthenticated && isAdmin() && (
          <li>
            <Link to="/admin" className="admin-link">Admin Dashboard</Link>
          </li>
        )}
        {!isAuthenticated && (
          <li>
            <Link to="/login?admin=true" className="admin-login-link">Admin Login</Link>
          </li>
        )}
      </ul>

      {/* Login/Register/User info on the right */}
      <div className="auth-section">
        {isAuthenticated ? (
          <div className="nav-user">
            <span>Welcome, {user?.username} {isAdmin() && <small>(Admin)</small>}</span>
            <button onClick={logout} className="logout-button">Logout</button>
          </div>
        ) : (
          <div className="auth-buttons">
            <Link to="/login" className="login-button">Log in</Link>
            <Link to="/register" className="register-button">Register</Link>
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
                element={
                  <ProtectedRoute>
                    <Cart />
                  </ProtectedRoute>
                } 
              />
              
              <Route 
                path="/checkout" 
                element={
                  <ProtectedRoute>
                    <Checkout />
                  </ProtectedRoute>
                } 
              />
              
              <Route 
                path="/order-confirmation" 
                element={
                  <ProtectedRoute>
                    <OrderConfirmation />
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