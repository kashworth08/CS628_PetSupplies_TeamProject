import React from "react";
import "./About.css"; // Importing a CSS file for styling

function About() {
  return (
    <div className="about-container">
      <section className="about-header">
        <h1>About Pawfect Supplies</h1>
        <p>Your trusted partner for all pet needs</p>
      </section>

      <section className="about-content">
        <h2>Our Mission</h2>
        <p>
          At Pawfect Supplies, we are dedicated to providing high-quality products
          for your pets. Our mission is to make sure that every pet and their owner
          has the best supplies to lead a happy and healthy life together.
        </p>

        <h2>What We Offer</h2>
        <p>
          We offer a wide range of products including pet food, toys, accessories,
          and more. All our products are carefully selected to ensure the safety and
          comfort of your furry friends.
        </p>

        <h2>Our Values</h2>
        <ul>
          <li>Quality: We believe in providing only the best for your pets.</li>
          <li>Customer Care: We are always here to help you with any questions or concerns.</li>
          <li>Affordability: We strive to make pet supplies accessible for everyone.</li>
        </ul>
      </section>

      <section className="about-image">
        <img
          src="https://media.istockphoto.com/id/1845512061/photo/cute-domestic-cats-and-dogs-of-various-colors-run-through-a-summer-sunny-meadow.webp?a=1&b=1&s=612x612&w=0&k=20&c=2J3kbJekOp6Q3MNuSX_94l9mg7RCMxBftwhD-HQdu6I=" // Placeholder image for now
          alt="Happy pets"
          className="about-image-style"
        />
      </section>

      <footer className="about-footer">
        <p>Thank you for choosing Pawfect Supplies. We are here for your pet’s every need!</p>
      </footer>
    </div>
  );
}

export default About;
