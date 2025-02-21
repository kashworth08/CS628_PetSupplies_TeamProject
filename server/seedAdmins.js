// seedAdmins.js (for seeding admin users)
const seedUsers = require("./seedUsers"); // Import the generic seeding function

const adminUsers = [
  {
    username: "admin1",
    email: "admin1@example.com",
    password: "password1", // Replace with a strong password
    address: "123 Admin St",
    role: "admin",
  },
  {
    username: "admin2",
    email: "admin2@example.com",
    password: "password2", // Replace with a strong password
    address: "456 Admin Ave",
    role: "admin",
  },
  {
    username: "admin3",
    email: "admin3@example.com",
    password: "password3", // Replace with a strong password
    address: "789 Admin Rd",
    role: "admin",
  },
  {
    username: "admin4",
    email: "admin4@example.com",
    password: "password4", // Replace with a strong password
    address: "101 Admin Ln",
    role: "admin",
  },
];

seedUsers("admin", adminUsers); // Call seedUsers for admins
