import React, { useState } from "react";
import "./Products.css";

const productList = [
  { id: 1, name: "Chew Toy", image: "https://images.unsplash.com/photo-1522008693277-086ad6075b78?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8ZG9nJTIwY2hldyUyMHRveXxlbnwwfHwwfHx8MA%3D%3D", description: "Durable chew toy.", price: 9.99, pet: "Dog", category: "Toy", rating: 4.5 },
  { id: 2, name: "Scratching Post", image: "https://images.unsplash.com/photo-1636543459635-c9756f9aef79?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8c2NyYXRjaGluZyUyMHBvc3R8ZW58MHx8MHx8fDA%3D", description: "Sturdy scratching post.", price: 24.99, pet: "Cat", category: "Toy", rating: 4.2 },
  { id: 3, name: "Bite-proof Leash", image: "https://images.unsplash.com/photo-1625734062403-428e52d753fe?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTZ8fGxlYXNofGVufDB8fDB8fHww", description: "Durable dog leash.", price: 15.49, pet: "Dog", category: "Leashes & Collars", rating: 4.8 },
  { id: 4, name: "Cat Food", image: "https://plus.unsplash.com/premium_photo-1726761692986-6bcde87fc2b8?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8Y2F0JTIwZm9vZHxlbnwwfHwwfHx8MA%3D%3D", description: "Nutritious cat food.", price: 19.99, pet: "Cat", category: "Food", rating: 4.7 },
  { id: 5, name: "Dog Food", image: "https://images.unsplash.com/photo-1589924691995-400dc9ecc119?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8N3x8ZG9nJTIwZm9vZHxlbnwwfHwwfHx8MA%3D%3D", description: "Healthy dog food.", price: 22.99, pet: "Dog", category: "Food", rating: 4.9 },
  { id: 6, name: "Pet Collar", image: "https://images.unsplash.com/photo-1605639496822-eddf63ad6c8f?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Nnx8ZG9nJTIwY29sbGFyfGVufDB8fDB8fHww", description: "Stylish pet collar.", price: 10.99, pet: "Dog", category: "Leashes & Collars", rating: 4.1 },
  { id: 7, name: "Cat Bed", image: "https://images.unsplash.com/photo-1573682127988-f67136e7f12a?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8N3x8Y2F0JTIwYmVkfGVufDB8fDB8fHww", description: "Soft and cozy bed.", price: 29.99, pet: "Cat", category: "Furniture", rating: 4.3 },
  { id: 8, name: "Kong", image: "https://images.unsplash.com/photo-1535294435445-d7249524ef2e?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8ZG9nJTIwdG95fGVufDB8fDB8fHww", description: "Red Kong", price: 10.99, pet: "Dog", category: "Toy", rating: 4.6 },
  { id: 9, name: "Freeze-dried Chicken Treats", image: "https://images.unsplash.com/photo-1571873735645-1ae72b963024?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8OHx8cGV0JTIwZm9vZHxlbnwwfHwwfHx8MA%3D%3D", description: "Healthy snack for dogs", price: 9.99, pet: "Dog", category: "Food", rating: 4.4 },
];

const petTypes = ["All", "Dog", "Cat"];
const categories = ["All", "Food", "Toy", "Leashes & Collars", "Furniture"];

function Products() {
  const [selectedPet, setSelectedPet] = useState("All");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [cart, setCart] = useState([]);

  const filteredProducts = productList
    .filter((product) =>
      (selectedPet === "All" || product.pet === selectedPet) &&
      (selectedCategory === "All" || product.category === selectedCategory) &&
      product.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

  const addToCart = (product) => {
    setCart([...cart, product]);
  };

  return (
    <div className="products-container">
      <h1>Our Products</h1>

      <div className="filters">
        <label>Filter by Pet:</label>
        <select onChange={(e) => setSelectedPet(e.target.value)} value={selectedPet}>
          {petTypes.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>

        <label>Filter by Category:</label>
        <select onChange={(e) => setSelectedCategory(e.target.value)} value={selectedCategory}>
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
      </div>

      <div className="products-grid">
        {filteredProducts.length > 0 ? (
          filteredProducts.map((product) => (
            <div key={product.id} className="product-card">
              <img src={product.image} alt={product.name} className="product-image" />
              <h3>{product.name}</h3>
              <p>{product.description}</p>
              <p className="product-price">${product.price.toFixed(2)}</p>
              <p>Rating: {product.rating} &#9733;</p>
              <button className="add-to-cart-btn" onClick={() => addToCart(product)}>
                Add to Cart
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