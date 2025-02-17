import React from "react";
import "./Home.css"; // Import the CSS file

function Home() {
  return (
    <div>
      {/* Hero Section */}
      <section className="hero-section">
        <h1 className="hero-title">Welcome to Pawfect Supplies!</h1>
        <p className="hero-subtitle">Your one-stop shop for all things pet-related.</p>
        <button className="cta-button">Shop Now</button>
      </section>

      {/* Featured Products Section */}
      <section className="section">
        <h2>Featured Products</h2>
        <div className="feature-list">
          <div className="feature-item">
            <img
              src="https://images.unsplash.com/photo-1535294435445-d7249524ef2e?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8ZG9nJTIwdG95fGVufDB8fDB8fHww"
              alt="Kong"
              className="image"
            />
            <p>Kong</p>
            <p>$10.99</p>
          </div>
          <div className="feature-item">
            <img
              src="https://images.unsplash.com/photo-1571873735645-1ae72b963024?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8OHx8cGV0JTIwZm9vZHxlbnwwfHwwfHx8MA%3D%3D"
              alt="Freeze Dried Chicken Treats"
              className="image"
            />
            <p>Freeze Dried Chicken Treats</p>
            <p>$9.99</p>
          </div>
          <div className="feature-item">
            <img
              src="https://images.unsplash.com/photo-1625734062403-428e52d753fe?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTZ8fGxlYXNofGVufDB8fDB8fHww"
              alt="Leash"
              className="image"
            />
            <p>Bite-Proof Leash</p>
            <p>$15.49</p>
          </div>
        </div>
      </section>

      {/* Customer Testimonial Section */}
      <section className="testimonial-section">
        <h2>What Our Customers Say</h2>
        <div className="testimonial">
          <p>"Pawfect Supplies is amazing! They have everything I need for my dog and the service is top-notch."</p>
          <p>- Mike P., Happy Customer</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <p>© 2025 Pawfect Supplies | All Rights Reserved</p>
      </footer>
    </div>
  );
}

export default Home;
