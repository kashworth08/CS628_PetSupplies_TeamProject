import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./Products.css";

// Helper function to get or create a session ID (same as in Cart.js)
const getSessionId = () => {
  let sessionId = localStorage.getItem('sessionId');
  if (!sessionId) {
    sessionId = 'sess_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    localStorage.setItem('sessionId', sessionId);
  }
  return sessionId;
};

function Products() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [addingToCart, setAddingToCart] = useState({});
  const [notification, setNotification] = useState(null);
  
  const { isAuthenticated, token } = useAuth();
  const navigate = useNavigate();
  const sessionId = getSessionId();

  // Fetch products from the backend
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${process.env.REACT_APP_API_URL}/api/products`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch products');
        }
        
        const data = await response.json();
        setProducts(data);
        
        // Extract unique categories
        const uniqueCategories = ['All', ...new Set(data.map(product => product.CategoryID?.Name).filter(Boolean))];
        setCategories(uniqueCategories);
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching products:', error);
        setError('Failed to load products. Please try again later.');
        setLoading(false);
      }
    };
    
    fetchProducts();
  }, []);

  // Filter products based on category and search query
  const filteredProducts = products.filter((product) =>
    (selectedCategory === "All" || product.CategoryID?.Name === selectedCategory) &&
    (product.Name.toLowerCase().includes(searchQuery.toLowerCase()) || 
     product.Description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Add product to cart
  const addToCart = async (product, navigateToCart = false) => {
    try {
      // Prevent multiple clicks
      if (addingToCart[product._id]) {
        return;
      }
      
      setAddingToCart(prev => ({ ...prev, [product._id]: true }));
      
      const headers = {
        'Content-Type': 'application/json',
        'X-Session-Id': sessionId
      };
      
      if (isAuthenticated && token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      console.log('Adding product to cart:', product._id);
      console.log('Headers:', headers);
      
      // Send a single request to add the item with quantity 1
      // The server will handle incrementing if the item already exists
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/cart`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          productId: product._id,
          quantity: 1,
          increment: true // Tell the server to increment the quantity if the item exists
        })
      });
      
      console.log('Add to cart response status:', response.status);
      
      if (!response.ok) {
        throw new Error('Failed to add item to cart');
      }
      
      // Show success notification
      setNotification({
        message: `${product.Name} added to cart!`,
        type: 'success'
      });
      
      // Hide notification after 3 seconds
      setTimeout(() => {
        setNotification(null);
      }, 3000);
      
      // Navigate to cart if requested
      if (navigateToCart) {
        goToCart();
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      
      // Show error notification
      setNotification({
        message: 'Failed to add item to cart. Please try again.',
        type: 'error'
      });
      
      // Hide notification after 3 seconds
      setTimeout(() => {
        setNotification(null);
      }, 3000);
    } finally {
      // Reset adding state after a short delay to prevent rapid clicks
      setTimeout(() => {
        setAddingToCart(prev => ({ ...prev, [product._id]: false }));
      }, 1000);
    }
  };

  // Navigate to cart
  const goToCart = () => {
    // Navigate to cart with a timestamp parameter to force a refresh
    navigate(`/cart?t=${Date.now()}`);
  };

  if (loading) {
    return <div className="loading">Loading products...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  return (
    <div className="products-container">
      <h1>Our Products</h1>

      <div className="filters">
        <label>Filter by Category:</label>
        <select 
          onChange={(e) => setSelectedCategory(e.target.value)} 
          value={selectedCategory}
        >
          {categories.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>

        <label>Search:</label>
        <input
          type="text"
          placeholder="Search products"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        
        <button className="view-cart-btn" onClick={goToCart}>
          View Cart
        </button>
      </div>

      {notification && (
        <div className={`notification ${notification.type}`}>
          {notification.message}
        </div>
      )}

      <div className="products-grid">
        {filteredProducts.length > 0 ? (
          filteredProducts.map((product) => (
            <div key={product._id} className="product-card">
              <img 
                src={product.ImageURL || 'https://via.placeholder.com/150'} 
                alt={product.Name} 
                className="product-image" 
              />
              <h3>{product.Name}</h3>
              <p>{product.Description}</p>
              <p className="product-price">${product.Price.toFixed(2)}</p>
              <p className="product-stock">In Stock: {product.Stock}</p>
              <button 
                className="add-to-cart-btn" 
                onClick={() => addToCart(product)}
                disabled={addingToCart[product._id] || product.Stock <= 0}
              >
                {addingToCart[product._id] ? 'Adding...' : product.Stock <= 0 ? 'Out of Stock' : 'Add to Cart'}
              </button>
              <button 
                className="add-and-view-cart-btn" 
                onClick={() => addToCart(product, true)}
                disabled={addingToCart[product._id] || product.Stock <= 0}
              >
                Add & View Cart
              </button>
            </div>
          ))
        ) : (
          <p>No products found.</p>
        )}
      </div>
    </div>
  );
}

export default Products;