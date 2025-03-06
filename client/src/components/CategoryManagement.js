import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './CategoryManagement.css';

const CategoryManagement = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentCategory, setCurrentCategory] = useState({
    Name: '',
    ParentCategoryID: ''
  });
  const [isEditing, setIsEditing] = useState(false);
  const [formErrors, setFormErrors] = useState({});

  // Fetch categories on component mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        
        const response = await axios.get('http://localhost:5000/api/categories', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        setCategories(response.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch categories. ' + (err.response?.data?.msg || err.message));
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCurrentCategory({
      ...currentCategory,
      [name]: value
    });
  };

  // Validate form
  const validateForm = () => {
    const errors = {};
    
    if (!currentCategory.Name) {
      errors.Name = 'Name is required';
    }
    
    // Prevent circular reference (category can't be its own parent)
    if (isEditing && currentCategory.ParentCategoryID === currentCategory._id) {
      errors.ParentCategoryID = 'Category cannot be its own parent';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    try {
      const token = localStorage.getItem('token');
      
      if (isEditing) {
        // Update existing category
        await axios.put(`http://localhost:5000/api/categories/${currentCategory._id}`, currentCategory, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        // Update categories list
        setCategories(categories.map(category => 
          category._id === currentCategory._id ? currentCategory : category
        ));
      } else {
        // Create new category
        const response = await axios.post('http://localhost:5000/api/categories', currentCategory, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        // Add new category to list
        setCategories([...categories, response.data]);
      }
      
      // Reset form
      setCurrentCategory({
        Name: '',
        ParentCategoryID: ''
      });
      setIsEditing(false);
      setFormErrors({});
    } catch (err) {
      setError('Failed to save category. ' + (err.response?.data?.msg || err.message));
    }
  };

  // Handle edit button click
  const handleEdit = (category) => {
    setCurrentCategory(category);
    setIsEditing(true);
    setFormErrors({});
  };

  // Handle delete button click
  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this category?')) {
      try {
        const token = localStorage.getItem('token');
        
        await axios.delete(`http://localhost:5000/api/categories/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        // Remove category from list
        setCategories(categories.filter(category => category._id !== id));
      } catch (err) {
        setError('Failed to delete category. ' + (err.response?.data?.msg || err.message));
      }
    }
  };

  // Cancel editing
  const handleCancel = () => {
    setCurrentCategory({
      Name: '',
      ParentCategoryID: ''
    });
    setIsEditing(false);
    setFormErrors({});
  };

  // Get parent category name
  const getParentCategoryName = (parentId) => {
    if (!parentId) return 'None';
    const parent = categories.find(category => category._id === parentId);
    return parent ? parent.Name : 'Unknown';
  };

  return (
    <div className="category-management">
      <h2>Category Management</h2>
      
      {error && <div className="error-message">{error}</div>}
      
      <div className="category-form-container">
        <h3>{isEditing ? 'Edit Category' : 'Add New Category'}</h3>
        <form onSubmit={handleSubmit} className="category-form">
          <div className="form-group">
            <label htmlFor="Name">Category Name</label>
            <input
              type="text"
              id="Name"
              name="Name"
              value={currentCategory.Name}
              onChange={handleInputChange}
              className={formErrors.Name ? 'error' : ''}
            />
            {formErrors.Name && <span className="error-text">{formErrors.Name}</span>}
          </div>
          
          <div className="form-group">
            <label htmlFor="ParentCategoryID">Parent Category</label>
            <select
              id="ParentCategoryID"
              name="ParentCategoryID"
              value={currentCategory.ParentCategoryID || ''}
              onChange={handleInputChange}
              className={formErrors.ParentCategoryID ? 'error' : ''}
            >
              <option value="">None (Top Level)</option>
              {categories
                .filter(category => !isEditing || category._id !== currentCategory._id)
                .map(category => (
                  <option key={category._id} value={category._id}>
                    {category.Name}
                  </option>
                ))
              }
            </select>
            {formErrors.ParentCategoryID && <span className="error-text">{formErrors.ParentCategoryID}</span>}
          </div>
          
          <div className="form-buttons">
            <button type="submit" className="save-btn">
              {isEditing ? 'Update Category' : 'Add Category'}
            </button>
            {isEditing && (
              <button type="button" className="cancel-btn" onClick={handleCancel}>
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>
      
      <div className="categories-list">
        <h3>Categories</h3>
        {loading ? (
          <p>Loading categories...</p>
        ) : categories.length === 0 ? (
          <p>No categories found.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Parent Category</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {categories.map(category => (
                <tr key={category._id}>
                  <td>{category.Name}</td>
                  <td>{getParentCategoryName(category.ParentCategoryID)}</td>
                  <td>
                    <button className="edit-btn" onClick={() => handleEdit(category)}>Edit</button>
                    <button className="delete-btn" onClick={() => handleDelete(category._id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default CategoryManagement; 