import React, { useState, useEffect } from "react";
import "./Profile.css";

const mockUser = {
  name: "John Doe",
  email: "johndoe@example.com",
  profilePicture: "/images/profile-placeholder.jpg",
  purchases: [
    { id: 1, name: "Chew Toy", date: "2025-02-10", price: 9.99 },
    { id: 2, name: "Dog Leash", date: "2025-01-25", price: 14.99 },
    { id: 3, name: "Cat Food", date: "2025-01-10", price: 19.99 },
  ],
};

function Profile() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Simulate fetching user data (replace with API call)
    setTimeout(() => {
      setUser(mockUser);
    }, 1000);
  }, []);

  const handleLogout = () => {
    console.log("User logged out"); // Replace with actual logout functionality
    setUser(null);
  };

  if (!user) {
    return <p>Loading profile...</p>;
  }

  return (
    <div className="profile-container">
      <div className="profile-header">
        <img src={user.profilePicture} alt="Profile" className="profile-pic" />
        <h2>{user.name}</h2>
        <p>{user.email}</p>
        <button onClick={handleLogout} className="logout-btn">Logout</button>
      </div>

      <div className="purchase-history">
        <h3>Recent Purchases</h3>
        <ul>
          {user.purchases.map((purchase) => (
            <li key={purchase.id}>
              {purchase.name} - ${purchase.price.toFixed(2)} <span className="date">({purchase.date})</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default Profile;