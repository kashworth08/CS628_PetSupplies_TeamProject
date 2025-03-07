import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ProductManagement from './ProductManagement';
import CategoryManagement from './CategoryManagement';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:5000/api/users', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        setUsers(response.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch users. ' + (err.response?.data?.msg || err.message));
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const renderTabContent = () => {
    switch (activeTab) {
      case 'users':
        return (
          <div className="admin-section">
            <h2>User Management</h2>
            {loading ? (
              <p>Loading users...</p>
            ) : error ? (
              <p className="error">{error}</p>
            ) : (
              <div className="user-list">
                <table>
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Username</th>
                      <th>Email</th>
                      <th>Role</th>
                      <th>Address</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map(user => (
                      <tr key={user.id}>
                        <td>{user.id}</td>
                        <td>{user.username}</td>
                        <td>{user.email}</td>
                        <td>{user.role}</td>
                        <td>{user.address}</td>
                        <td>
                          <button className="edit-btn">Edit</button>
                          <button className="delete-btn">Delete</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        );
      case 'products':
        return <ProductManagement />;
      case 'categories':
        return <CategoryManagement />;
      default:
        return (
          <>
            <div className="admin-section">
              <h2>Dashboard Overview</h2>
              <div className="stats-grid">
                <div className="stat-card">
                  <h3>Total Users</h3>
                  <p className="stat-value">{users.length}</p>
                </div>
                <div className="stat-card">
                  <h3>Admin Users</h3>
                  <p className="stat-value">{users.filter(user => user.role === 'admin').length}</p>
                </div>
                <div className="stat-card">
                  <h3>Regular Users</h3>
                  <p className="stat-value">{users.filter(user => user.role === 'user').length}</p>
                </div>
              </div>
            </div>
            
            <div className="admin-section">
              <h2>Recent Activity</h2>
              <p>No recent activity to display.</p>
            </div>
          </>
        );
    }
  };

  return (
    <div className="admin-dashboard">
      <h1>Admin Dashboard</h1>
      
      <div className="admin-tabs">
        <button 
          className={`tab-btn ${activeTab === 'dashboard' ? 'active' : ''}`}
          onClick={() => setActiveTab('dashboard')}
        >
          Dashboard
        </button>
        <button 
          className={`tab-btn ${activeTab === 'users' ? 'active' : ''}`}
          onClick={() => setActiveTab('users')}
        >
          Users
        </button>
        <button 
          className={`tab-btn ${activeTab === 'products' ? 'active' : ''}`}
          onClick={() => setActiveTab('products')}
        >
          Products
        </button>
        <button 
          className={`tab-btn ${activeTab === 'categories' ? 'active' : ''}`}
          onClick={() => setActiveTab('categories')}
        >
          Categories
        </button>
      </div>
      
      <div className="tab-content">
        {renderTabContent()}
      </div>
    </div>
  );
};

export default AdminDashboard; 