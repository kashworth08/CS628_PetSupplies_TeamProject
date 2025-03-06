import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './ProductManagement.css';

const ProductManagement = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentProduct, setCurrentProduct] = useState({
    Name: '',
    Description: '',
    CategoryID: '',
    Price: '',
    Stock: ''
  });
  const [isEditing, setIsEditing] = useState(false);
  const [formErrors, setFormErrors] = useState({});

  // Fetch products and categories on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        
        // Fetch products
        const productsResponse = await axios.get('http://localhost:5000/api/products', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        // Fetch categories
        const categoriesResponse = await axios.get('http://localhost:5000/api/categories', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        setProducts(productsResponse.data);
        setCategories(categoriesResponse.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch data. ' + (err.response?.data?.msg || err.message));
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCurrentProduct({
      ...currentProduct,
      [name]: name === 'Price' || name === 'Stock' ? parseFloat(value) : value
    });
  };

  // Validate form
  const validateForm = () => {
    const errors = {};
    
    if (!currentProduct.Name) {
      errors.Name = 'Name is required';
    }
    
    if (!currentProduct.CategoryID) {
      errors.CategoryID = 'Category is required';
    }
    
    if (!currentProduct.Price || currentProduct.Price <= 0) {
      errors.Price = 'Price must be greater than 0';
    }
    
    if (!currentProduct.Stock || currentProduct.Stock < 0) {
      errors.Stock = 'Stock must be 0 or greater';
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
        // Update existing product
        await axios.put(`http://localhost:5000/api/products/${currentProduct._id}`, currentProduct, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        // Update products list
        setProducts(products.map(product => 
          product._id === currentProduct._id ? currentProduct : product
        ));
      } else {
        // Create new product
        const response = await axios.post('http://localhost:5000/api/products', currentProduct, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        // Add new product to list
        setProducts([...products, response.data]);
      }
      
      // Reset form
      setCurrentProduct({
        Name: '',
        Description: '',
        CategoryID: '',
        Price: '',
        Stock: ''
      });
      setIsEditing(false);
      setFormErrors({});
    } catch (err) {
      setError('Failed to save product. ' + (err.response?.data?.msg || err.message));
    }
  };

  // Handle edit button click
  const handleEdit = (product) => {
    setCurrentProduct(product);
    setIsEditing(true);
    setFormErrors({});
  };

  // Handle delete button click
  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        const token = localStorage.getItem('token');
        
        await axios.delete(`http://localhost:5000/api/products/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        // Remove product from list
        setProducts(products.filter(product => product._id !== id));
      } catch (err) {
        setError('Failed to delete product. ' + (err.response?.data?.msg || err.message));
      }
    }
  };

  // Cancel editing
  const handleCancel = () => {
    setCurrentProduct({
      Name: '',
      Description: '',
      CategoryID: '',
      Price: '',
      Stock: ''
    });
    setIsEditing(false);
    setFormErrors({});
  };

  return (
    <div className="product-management">
      <h2>Product Management</h2>
      
      {error && <div className="error-message">{error}</div>}
      
      <div className="product-form-container">
        <h3>{isEditing ? 'Edit Product' : 'Add New Product'}</h3>
        <form onSubmit={handleSubmit} className="product-form">
          <div className="form-group">
            <label htmlFor="Name">Product Name</label>
            <input
              type="text"
              id="Name"
              name="Name"
              value={currentProduct.Name}
              onChange={handleInputChange}
              className={formErrors.Name ? 'error' : ''}
            />
            {formErrors.Name && <span className="error-text">{formErrors.Name}</span>}
          </div>
          
          <div className="form-group">
            <label htmlFor="Description">Description</label>
            <textarea
              id="Description"
              name="Description"
              value={currentProduct.Description}
              onChange={handleInputChange}
              rows="3"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="CategoryID">Category</label>
            <select
              id="CategoryID"
              name="CategoryID"
              value={currentProduct.CategoryID}
              onChange={handleInputChange}
              className={formErrors.CategoryID ? 'error' : ''}
            >
              <option value="">Select a category</option>
              {categories.map(category => (
                <option key={category._id} value={category._id}>
                  {category.Name}
                </option>
              ))}
            </select>
            {formErrors.CategoryID && <span className="error-text">{formErrors.CategoryID}</span>}
          </div>
          
          <div className="form-group">
            <label htmlFor="Price">Price ($)</label>
            <input
              type="number"
              id="Price"
              name="Price"
              value={currentProduct.Price}
              onChange={handleInputChange}
              step="0.01"
              min="0"
              className={formErrors.Price ? 'error' : ''}
            />
            {formErrors.Price && <span className="error-text">{formErrors.Price}</span>}
          </div>
          
          <div className="form-group">
            <label htmlFor="Stock">Stock</label>
            <input
              type="number"
              id="Stock"
              name="Stock"
              value={currentProduct.Stock}
              onChange={handleInputChange}
              min="0"
              className={formErrors.Stock ? 'error' : ''}
            />
            {formErrors.Stock && <span className="error-text">{formErrors.Stock}</span>}
          </div>
          
          <div className="form-buttons">
            <button type="submit" className="save-btn">
              {isEditing ? 'Update Product' : 'Add Product'}
            </button>
            {isEditing && (
              <button type="button" className="cancel-btn" onClick={handleCancel}>
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>
      
      <div className="products-list">
        <h3>Products</h3>
        {loading ? (
          <p>Loading products...</p>
        ) : products.length === 0 ? (
          <p>No products found.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Category</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map(product => (
                <tr key={product._id}>
                  <td>{product.Name}</td>
                  <td>{product.CategoryID.Name || 'Unknown'}</td>
                  <td>${product.Price.toFixed(2)}</td>
                  <td>{product.Stock}</td>
                  <td>
                    <button className="edit-btn" onClick={() => handleEdit(product)}>Edit</button>
                    <button className="delete-btn" onClick={() => handleDelete(product._id)}>Delete</button>
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

export default ProductManagement; 