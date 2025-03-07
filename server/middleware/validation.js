// Validation middleware for user registration
const validateRegistration = (req, res, next) => {
  const { username, email, password, address } = req.body;
  const errors = [];

  // Check if all fields are present
  if (!username || !email || !password || !address) {
    return res.status(400).json({ msg: 'Please enter all fields' });
  }

  // Username validation
  if (username.length < 3 || username.length > 30) {
    errors.push('Username must be between 3 and 30 characters');
  }

  // Email validation
  const emailRegex = /^\S+@\S+\.\S+$/;
  if (!emailRegex.test(email)) {
    errors.push('Please enter a valid email address');
  }

  // Password validation
  // At least 8 characters, one uppercase letter, and one special character
  const passwordRegex = /^(?=.*[A-Z])(?=.*[!@#$%^&*])(?=.{8,})/;
  if (!passwordRegex.test(password)) {
    errors.push('Password must be at least 8 characters with one uppercase letter and one special character');
  }

  // Address validation
  if (address.length > 100) {
    errors.push('Address must be less than 100 characters');
  }

  // If there are errors, return them
  if (errors.length > 0) {
    return res.status(400).json({ errors });
  }

  // If all validations pass, proceed to the next middleware
  next();
};

// Add login validation middleware
const validateLogin = (req, res, next) => {
  const { email, password } = req.body;
  
  // Check if email and password are provided
  if (!email || !password) {
    return res.status(400).json({ 
      msg: 'Please enter all fields',
      field: !email ? 'email' : 'password'
    });
  }
  
  // Basic email format validation
  const emailRegex = /^\S+@\S+\.\S+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ 
      msg: 'Please enter a valid email address',
      field: 'email'
    });
  }
  
  // Password length validation
  if (password.length < 6) {
    return res.status(400).json({ 
      msg: 'Password must be at least 6 characters',
      field: 'password'
    });
  }
  
  next();
};

module.exports = {
  validateRegistration,
  validateLogin
}; 